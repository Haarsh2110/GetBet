import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import GameSettings from '@/lib/models/game-settings';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log('[API] WinGo Update Upcoming called');
    try {
        const { upcomingPeriod } = await req.json();
        
        if (upcomingPeriod === undefined || isNaN(parseInt(upcomingPeriod))) {
            return NextResponse.json({ success: false, error: 'Invalid upcomingPeriod' }, { status: 400 });
        }

        await connectDB();
        
        const settings = await GameSettings.findOneAndUpdate(
            { game: 'wingo' },
            { $set: { upcomingPeriod: parseInt(upcomingPeriod) } },
            { upsert: true, new: true }
        );

        console.log('[DB] WinGo Upcoming Period Updated:', settings.upcomingPeriod);

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        console.error('[API Error] Failed to update upcoming:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
