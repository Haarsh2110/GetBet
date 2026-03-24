import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import GameSettings from '@/lib/models/game-settings';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log('[API] WinGo Activate Session called');
    try {
        await connectDB();
        
        const today = new Date().toISOString().split('T')[0];
        let settings = await GameSettings.findOne({ game: 'wingo' });

        if (!settings) {
            console.log('[DB] Settings not found, creating new entry');
            settings = new GameSettings({
                game: 'wingo',
                periodRef: 1000666,
                periodRefTime: new Date(),
                sessionCount: 0,
                sessionActive: false,
                lastResetDate: today
            });
        }

        settings.sessionActive = true;
        await settings.save();
        
        // Calculate manual period for session record
        const now = new Date();
        const diffMs = now.getTime() - new Date(settings.periodRefTime).getTime();
        const periodsPassed = Math.floor(diffMs / 60000);
        const manualPeriod = (settings.periodRef + periodsPassed).toString();

        // Store session record for history as requested (Record every click)
        const newSession = await Session.create({
            sessionId: 'WG-1M',
            game: 'WinGo',
            period: manualPeriod,
            timerIntervalMs: 60000,
            startTime: now,
            endTime: new Date(now.getTime() + 60000),
            status: 'Running'
        });

        // 6. SINGLE SOURCE OF TRUTH: Fetch today's count from DB
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        const todaySessionCount = await Session.countDocuments({
            game: 'WinGo',
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        console.log(`[DB] WinGo Activated successfully. Records count: ${todaySessionCount}`);

        return NextResponse.json({
            success: true,
            data: {
                sessionCount: todaySessionCount,
                sessionActive: settings.sessionActive,
                session: newSession,
                todaySessionCount
            }
        });
    } catch (error: any) {
        console.error('[API Error] Failed to activate WinGo:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
