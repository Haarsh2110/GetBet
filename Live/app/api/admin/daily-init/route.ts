import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import DailyRecord from '@/lib/models/daily-record';

export const dynamic = 'force-dynamic';

// POST /api/admin/daily-init
// Called at midnight (00:00) to initialize daily records for all users with betting balance.
// This captures the "carry-over" balance from previous day as today's starting Total Order.
export async function POST() {
    try {
        await connectDB();
        const dateFormatted = new Date().toISOString().split('T')[0];

        // Get all users who have betting balance > 0
        const usersWithBalance = await User.find(
            { bettingBalance: { $gt: 0 }, role: 'user' },
            { _id: 1, userId: 1, bettingBalance: 1 }
        ).lean();

        let created = 0;
        let skipped = 0;

        for (const user of usersWithBalance) {
            // Only create if no record exists for today
            const existing = await DailyRecord.findOne({ userId: user.userId, date: dateFormatted });
            if (existing) { skipped++; continue; }

            await DailyRecord.create({
                userId: user.userId,
                date: dateFormatted,
                initialBalance: user.bettingBalance,
                newTransfers: 0,
                totalOrder: user.bettingBalance,
                executed: 0,
                pending: user.bettingBalance,
                status: 'Pending'
            });
            created++;
        }

        console.log(`[DailyInit] ${dateFormatted} → Created: ${created}, Skipped: ${skipped}`);
        return NextResponse.json({ success: true, created, skipped, date: dateFormatted });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET - Also support GET for easy browser testing
export async function GET() {
    return POST();
}
