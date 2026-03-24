import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WingoPeriod from '@/lib/models/wingo-period';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period');

        if (!period) {
            return NextResponse.json({ success: false, error: 'Period is required' }, { status: 400 });
        }

        const { processWingoPeriod } = await import('@/lib/wingo-engine');
        
        let stats = await WingoPeriod.findOne({ period }).lean();

        // 1. Ensure current and past 10 periods are processed (Catch-Up/Gap-Fill)
        // This ensures no periods are missed even if the dashboard was closed or throttled
        const currentPeriodNum = parseInt(period);
        for (let i = 0; i < 10; i++) {
            const periodToCheck = (currentPeriodNum - i).toString();
            const pStats = await WingoPeriod.findOne({ period: periodToCheck }).lean();
            if (!pStats || pStats.state === 'WAITING') {
                const result = await processWingoPeriod(periodToCheck);
                if (i === 0) stats = result; // Update current stats if it was the one being checked
            }
        }

        if (!stats) {
            return NextResponse.json({ success: true, data: null });
        }

        return NextResponse.json({
            success: true,
            data: {
                period: stats.period,
                totalBigVolume: stats.totalBigVolume || 0,
                totalSmallVolume: stats.totalSmallVolume || 0,
                totalBigUsers: stats.totalBigUsers || 0,
                totalSmallUsers: stats.totalSmallUsers || 0,
                state: stats.state
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
