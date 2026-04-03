import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import GameSettings from '@/lib/models/game-settings';
import WingoPeriod from '@/lib/models/wingo-period';
import { processWingoPeriod } from '@/lib/wingo-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const settings = await GameSettings.findOne({ game: 'wingo' });

        if (!settings) {
            return NextResponse.json({
                success: true,
                period: '1000666'
            });
        }

        const now = new Date();
        const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();
        const refTime = new Date(settings.periodRefTime).getTime();
        
        const diffMs = currentMinuteStart - refTime;
        const periodsPassed = Math.floor(diffMs / 60000);
        
        const currentPeriod = (settings.periodRef + periodsPassed).toString();
        const currentSecond = now.getSeconds();

        // Automatic Processing Logic
        // Use .lean() to get a plain object, avoiding type mismatches between Document and plain object return from processWingoPeriod
        let periodData: any = await WingoPeriod.findOne({ period: currentPeriod }).lean();

        if (currentSecond >= 10) {
            // Processing time or result reveal time
            if (!periodData || periodData.state === 'WAITING') {
                // Trigger calculation
                periodData = await processWingoPeriod(currentPeriod);
            }
        } else {
            // First 10 seconds: Ensure period exists in WAITING state if not already
            if (!periodData) {
                const newPeriod = await WingoPeriod.create({
                    period: currentPeriod,
                    state: 'WAITING'
                });
                periodData = newPeriod.toObject();
            }
        }

        // Convert _id to string id to satisfy TypeScript expectations and frontend requirements
        if (periodData && periodData._id) {
            periodData.id = periodData._id.toString();
        }

        const timeLeft = 60 - currentSecond;

        return NextResponse.json({
            success: true,
            period: currentPeriod,
            timeLeft,
            status: periodData?.state || 'WAITING',
            prediction: (currentSecond >= 11 && periodData?.state === 'RESULT_DECLARED') ? periodData?.result : null, // Revealed at 11th second
            serverTime: now.getTime(),
            id: periodData?.id // Explicitly include id in the response if it helps
        });
    } catch (error: any) {
        console.error('Error in Wingo period API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
