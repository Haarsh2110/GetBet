import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import Transaction from '@/lib/models/transaction';
import WingoOrder from '@/lib/models/wingo-order';
import DailyRecord from '@/lib/models/daily-record';

export async function GET() {
    try {
        await connectDB();

        // 1. Total User Stats
        const totalUsers = await User.countDocuments();
        
        // 2. Financial Overview (Last 30 days)
        const recentTransactions = await Transaction.find({
            status: 'success',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const totalVolume = recentTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        // 3. Game Performance (Wingo)
        const totalWingoBets = await WingoOrder.countDocuments();
        const winningBets = await WingoOrder.find({ status: 'win' });
        const houseWinLoss = winningBets.length; // Basic logic for now

        // 4. Daily Performance Logs
        const dailyLogs = await DailyRecord.find().sort({ date: -1 }).limit(7);

        return NextResponse.json({
            success: true,
            summary: {
                totalUsers,
                totalVolume: totalVolume.toLocaleString(),
                totalWingoBets,
                activeTickets: 0, // Placeholder
                dailyPerformance: dailyLogs.map(log => ({
                    date: log.date,
                    profit: log.totalOrder, // Volume
                    orders: log.executed // Executed amount
                })).reverse()
            }
        });
    } catch (error) {
        console.error('Master Stats API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
