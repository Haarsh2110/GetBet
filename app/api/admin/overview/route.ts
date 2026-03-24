import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import Transaction from '@/lib/models/transaction';

export async function GET() {
    const startTime = Date.now();
    try {
        await connectDB();

        // Basic mock logic combined with DB counting for demo purposes
        const totalUsers = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ status: { $ne: 'banned' } });

        // Sum all completed deposits to approximate GGR/Volume
        const volumeAggr = await Transaction.aggregate([
            { $match: { type: 'bet', status: 'completed' } },
            { $group: { _id: null, totalVolume: { $sum: '$amount' } } }
        ]);

        const totalVolume = volumeAggr.length > 0 ? volumeAggr[0].totalVolume : 0;

        const endTime = Date.now();
        console.log(`[API] GET /api/admin/overview - Time: ${endTime - startTime}ms`);

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                activeUsersCount,
                totalVolume,
                liveSessions: 4, // Mocked for now until Sessions logic is fully alive
                ggr: totalVolume * 0.15, // Mock calculation (15% margin)
            }
        });
    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/admin/overview - Time: ${endTime - startTime}ms`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch overview data' },
            { status: 500 }
        );
    }
}
