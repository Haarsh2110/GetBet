import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const startTime = Date.now();
    try {
        await connectDB();

        // Aggregate Session records grouped by date (specifically for WinGo)
        const results = await Session.aggregate([
            {
                $match: {
                    game: 'WinGo'
                }
            },
            {
                $project: {
                    dateStr: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata"
                        }
                    },
                    createdAt: 1
                }
            },
            {
                $group: {
                    _id: "$dateStr",
                    sessions: { $sum: 1 },
                    sortKey: { $max: "$createdAt" }
                }
            },
            {
                $sort: { sortKey: -1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    sessions: "$sessions"
                }
            }
        ]);

        const endTime = Date.now();
        console.log(`[API] GET /api/admin/wingo/result-history/grouped - Time: ${endTime - startTime}ms`);

        return NextResponse.json(results);
    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/admin/wingo/result-history/grouped - Time: ${endTime - startTime}ms`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
