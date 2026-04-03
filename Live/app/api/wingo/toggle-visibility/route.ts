import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import GameSettings from '@/lib/models/game-settings';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log('[API] WinGo Toggle Visibility called');
    try {
        await connectDB();
        
        const currentSettings = await GameSettings.findOne({ game: 'wingo' });
        const nextValue = currentSettings ? !currentSettings.showUpcomingToUsers : true;

        const settings = await GameSettings.findOneAndUpdate(
            { game: 'wingo' },
            { $set: { showUpcomingToUsers: nextValue } },
            { upsert: true, new: true }
        );

        console.log('[DB] WinGo Visibility Toggled. showUpcomingToUsers:', settings.showUpcomingToUsers);

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        console.error('[API Error] Failed to toggle visibility:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
