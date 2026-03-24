import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WingoOrder from '@/lib/models/wingo-order';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
        }

        // Fetch user's orders, joined with period logic or grouping them by date
        const pipeline: any[] = [
            {
                $match: { userId: userId, status: { $regex: /./ } } // all orders for user
            },
            {
                $project: {
                    dateStr: {
                        $dateToString: { format: "%d-%m-%Y", date: "$createdAt", timezone: "Asia/Kolkata" }
                    },
                    amount: 1,
                    createdAt: 1
                }
            },
            {
                $group: {
                    _id: "$dateStr",
                    totalSession: { $sum: 1 },
                    turnover: { $sum: "$amount" },
                    sortKey: { $max: "$createdAt" }
                }
            },
            {
                $sort: { sortKey: -1 }
            },
            {
                $limit: 30
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalSession: 1,
                    turnover: 1
                }
            }
        ];

        const historyStats = await WingoOrder.aggregate(pipeline);

        return NextResponse.json({
            success: true,
            data: historyStats
        });
    } catch (error: any) {
        console.error('Error fetching prediction history:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch prediction history' },
            { status: 500 }
        );
    }
}
