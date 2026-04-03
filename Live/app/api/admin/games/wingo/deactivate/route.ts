import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import GameSettings from '@/lib/models/game-settings';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log('[API] WinGo Deactivate Session called');
    try {
        await connectDB();
        
        const settings = await GameSettings.findOneAndUpdate(
            { game: 'wingo' },
            { sessionActive: false },
            { new: true }
        );

        console.log(`[DB] WinGo Deactivated. Active: false`);

        return NextResponse.json({
            success: true,
            data: {
                sessionActive: false
            }
        });
    } catch (error: any) {
        console.error('[API Error] Failed to deactivate WinGo:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
