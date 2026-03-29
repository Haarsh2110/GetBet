import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';
import Transaction from '@/backend/models/transaction';
import WingoOrder from '@/backend/models/wingo-order';
import DailyRecord from '@/backend/models/daily-record';

export async function getMasterStats() {
    try {
        await connectDB();

        const totalUsers = await User.countDocuments();
        
        const recentTransactions = await Transaction.find({
            status: 'success',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const totalVolume = recentTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        const totalWingoBets = await WingoOrder.countDocuments();
        const winningBets = await WingoOrder.find({ status: 'win' });
        
        const dailyLogs = await DailyRecord.find().sort({ date: -1 }).limit(7);

        return NextResponse.json({
            success: true,
            summary: {
                totalUsers,
                totalVolume: totalVolume.toLocaleString(),
                totalWingoBets,
                activeTickets: 0,
                dailyPerformance: dailyLogs.map(log => ({
                    date: (log as any).date,
                    profit: (log as any).totalOrder,
                    orders: (log as any).executed
                })).reverse()
            }
        });
    } catch (error) {
        console.error('Master Stats API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
