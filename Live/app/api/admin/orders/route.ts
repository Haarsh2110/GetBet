import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/transaction';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const startTime = Date.now();
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const status = searchParams.get('status');

        const query: any = { type: 'bet' };
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        // --- REFINED DAILY STATS LOGIC (RESETTING AT 00:00) ---
        const DailyRecord = (await import('@/lib/models/daily-record')).default;
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Fetch Today's Detailed Records (Table)
        const dailyRecords = await DailyRecord.aggregate([
            { $match: { date: todayStr } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $addFields: {
                    userName: {
                        $ifNull: [
                            { $arrayElemAt: ['$user.name', 0] },
                            { $arrayElemAt: ['$user.username', 0] },
                            '$userId'
                        ]
                    }
                }
            },
            {
                $project: {
                    user: 0
                }
            }
        ]);

        const totalCount = await DailyRecord.countDocuments({ date: todayStr });

        // 2. Aggregate Collective Dashboard Summary for Today
        const dayStats = await DailyRecord.aggregate([
            { $match: { date: todayStr } },
            { 
                $group: { 
                    _id: null, 
                    totalOrdersVolume: { $sum: "$totalOrder" },
                    completedVolume: { $sum: "$executed" },
                    pendingVolume: { $sum: "$pending" },
                    totalUsers: { $sum: 1 },
                    completedUsers: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    pendingUsers: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } }
                } 
            }
        ]);

        const stats = {
            totalOrders: dayStats[0]?.totalUsers || 0,
            totalVolume: dayStats[0]?.totalOrdersVolume || 0,
            completedOrders: dayStats[0]?.completedUsers || 0,
            completedVolume: dayStats[0]?.completedVolume || 0,
            pendingOrders: dayStats[0]?.pendingUsers || 0,
            pendingVolume: dayStats[0]?.pendingVolume || 0,
        };

        const endTime = Date.now();
        console.log(`[API] GET /api/admin/orders - Time: ${endTime - startTime}ms`);

        return NextResponse.json({
            success: true,
            data: dailyRecords,
            summary: stats,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/admin/orders - Time: ${endTime - startTime}ms`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { transactionId, status } = body;

        if (!transactionId || !status) {
            return NextResponse.json({ success: false, error: 'Missing transactionId or status' }, { status: 400 });
        }

        const updated = await Transaction.findByIdAndUpdate(
            transactionId,
            { status },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }
}
