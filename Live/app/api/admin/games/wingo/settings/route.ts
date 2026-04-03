import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import GameSettings from '@/lib/models/game-settings';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const startTime = Date.now();
    try {
        await connectDB();
        let settings = await GameSettings.findOne({ game: 'wingo' });

        if (!settings) {
            // Initialize with default values if not found
            const now = new Date();
            const minuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
            settings = await GameSettings.create({
                game: 'wingo',
                periodRef: 1000666,
                periodRefTime: minuteStart,
                sessionCount: 0,
                sessionActive: false,
                upcomingPeriod: 1000667,
                showUpcomingToUsers: false,
                lastResetDate: now.toISOString().split('T')[0]
            });
        }

        // Daily Reset Check
        const today = new Date().toISOString().split('T')[0];
        if (settings.lastResetDate !== today) {
            settings.sessionCount = 0;
            settings.sessionActive = false;
            settings.lastResetDate = today;
            await settings.save();
        }

        // Fetch today's session count from Session collection (Single Source of Truth)
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

        const endTime = Date.now();
        console.log(`[API] GET /api/admin/games/wingo/settings - Time: ${endTime - startTime}ms`);

        return NextResponse.json({
            success: true,
            data: {
                ...settings.toObject(),
                todaySessionCount
            }
        });
    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/admin/games/wingo/settings - Time: ${endTime - startTime}ms`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await connectDB();
        
        let updateData: any = {};
        
        if (body.periodRef !== undefined) {
            const now = new Date();
            const minuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
            updateData.periodRef = parseInt(body.periodRef);
            updateData.periodRefTime = minuteStart;
        }

        if (body.upcomingPeriod !== undefined) {
            updateData.upcomingPeriod = parseInt(body.upcomingPeriod);
        }

        if (body.showUpcomingToUsers !== undefined) {
            updateData.showUpcomingToUsers = body.showUpcomingToUsers;
        }

        const settings = await GameSettings.findOneAndUpdate(
            { game: 'wingo' },
            { $set: updateData },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
