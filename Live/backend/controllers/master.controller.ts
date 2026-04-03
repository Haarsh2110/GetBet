import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';
import Transaction from '@/backend/models/transaction';
import WingoOrder from '@/backend/models/wingo-order';
import DailyRecord from '@/backend/models/daily-record';
import WingoPeriod from '@/backend/models/wingo-period';

export async function getMasterStats() {
    try {
        await connectDB();

        // 1. Total Users
        const totalUsers = await User.countDocuments({ role: 'user' });

        // 2. Volume (30D) - Sum of all successful transactions in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const volumeData = await Transaction.aggregate([
            {
                $match: {
                    status: { $in: ['completed', 'approved'] },
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const volume30d = volumeData.length > 0 ? volumeData[0].total : 0;

        // 3. Wingo Total - Count of all wingo orders
        const wingoBets = await WingoOrder.countDocuments();

        // 4. Active Games - Count of WingoPeriods that are currently active
        const activeGames = await WingoPeriod.countDocuments({ 
            state: { $in: ['WAITING', 'PROCESSING'] } 
        });

        // 5. Project Velocity - Aggregated Daily Records
        const velocityData = await DailyRecord.aggregate([
            {
                $group: {
                    _id: "$date",
                    totalOrder: { $sum: "$totalOrder" },
                    executed: { $sum: "$executed" }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 10 }
        ]);

        const velocity = velocityData.map(item => ({
            date: item._id,
            totalOrder: item.totalOrder,
            executed: item.executed
        }));

        // Default velocity if no data exists
        const safeVelocity = velocity.length > 0 ? velocity : [
            { date: new Date().toISOString().split('T')[0], totalOrder: 0, executed: 0 }
        ];

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                volume30d,
                wingoBets,
                activeGames,
                velocity: safeVelocity
            }
        });
    } catch (error) {
        console.error('Master Stats Neural Sync Fail:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Master Node Synchronization Error' 
        }, { status: 500 });
    }
}
