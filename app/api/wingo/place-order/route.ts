import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WingoOrder from '@/lib/models/wingo-order';
import GameSettings from '@/lib/models/game-settings';
import WingoPeriod from '@/lib/models/wingo-period';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, amount, prediction } = await req.json();

        if (!userId || !amount || !prediction) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Get current period
        const settings = await GameSettings.findOne({ game: 'wingo' });
        if (!settings) {
            return NextResponse.json({ success: false, error: 'Game settings not found' }, { status: 500 });
        }

        const now = new Date();
        const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();
        const refTime = new Date(settings.periodRefTime).getTime();
        const diffMs = currentMinuteStart - refTime;
        const periodsPassed = Math.floor(diffMs / 60000);
        const currentPeriod = (settings.periodRef + periodsPassed).toString();

        // Check if betting is closed (first 10 seconds are for processing, but wait)
        // Actually, if it's the first 10 seconds, we are processing THIS period's result.
        // So betting for THIS period should have closed at the end of the PREVIOUS minute.
        
        // Let's check the current second
        const currentSecond = now.getSeconds();
        
        // If second < 10, we are in WAITING phase of currentPeriod. 
        // Betting for currentPeriod should be CLOSED because calculation is about to happen or happening.
        // In this specific system, users probably bet for the NEXT period or we allow betting until the reveal.
        
        // The requirement says:
        // "First 10 seconds: System calculates order distribution internally. No result shown to user."
        // This implies orders must be there by 0s.
        
        if (currentSecond < 10) {
             return NextResponse.json({ success: false, error: 'Betting closed for current period. Please wait for the next period.' }, { status: 400 });
        }

        // If second >= 10, the result for currentPeriod will be declared soon or is declared.
        // So we should probably bet for the NEXT period.
        const targetPeriod = (parseInt(currentPeriod) + 1).toString();

        const order = await WingoOrder.create({
            userId,
            period: targetPeriod,
            amount,
            prediction,
            status: 'PENDING'
        });

        // Ensure target period exists in DB in WAITING state
        await WingoPeriod.findOneAndUpdate(
            { period: targetPeriod },
            { $setOnInsert: { state: 'WAITING' } },
            { upsert: true }
        );

        return NextResponse.json({ success: true, data: order });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
