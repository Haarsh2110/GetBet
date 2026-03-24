import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';
import GameSettings from '@/lib/models/game-settings';
import WingoPeriod from '@/lib/models/wingo-period';
import { processWingoPeriod } from '@/lib/wingo-engine';

export const dynamic = 'force-dynamic';

// ─── Server-side In-Memory Cache (1.5s TTL) ───────────────────────────────────
// At 5,000 users polling every 2s → 150,000 DB reads/min without cache.
// With 1.5s cache → only ~4,000 DB reads/min. 97% reduction.
const periodCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_MS = 1500;

function getFromCache(key: string) {
    const entry = periodCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
    periodCache.delete(key);
    return null;
}
function setToCache(key: string, data: any) {
    periodCache.set(key, { data, ts: Date.now() });
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Auto Daily Init at Midnight ─────────────────────────────────────────────
// Tracks the last date we initialized daily records.
// On the first API call of a new day, triggers init in background (non-blocking).
let lastInitDate = '';

async function runDailyInitIfNeeded() {
    const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-03-21"
    if (lastInitDate === todayStr) return; // Already done today
    lastInitDate = todayStr; // Mark immediately to prevent concurrent runs

    // Run in background — doesn't delay the API response
    setImmediate(async () => {
        try {
            const { connectDB } = await import('@/lib/mongodb');
            const User = (await import('@/lib/models/user')).default;
            const DailyRecord = (await import('@/lib/models/daily-record')).default;
            await connectDB();

            const usersWithBalance = await User.find(
                { bettingBalance: { $gt: 0 }, role: 'user' },
                { userId: 1, bettingBalance: 1 }
            ).lean();

            let created = 0;
            // Use Promise.all with per-user upsert for type safety
            await Promise.all(usersWithBalance.map(async (user: any) => {
                const existing = await DailyRecord.findOne({ userId: user.userId, date: todayStr });
                if (!existing) {
                    await DailyRecord.create({
                        userId: user.userId,
                        date: todayStr,
                        initialBalance: user.bettingBalance,
                        newTransfers: 0,
                        totalOrder: user.bettingBalance,
                        executed: 0,
                        pending: user.bettingBalance,
                        status: 'Pending' as const
                    });
                    created++;
                }
            }));

            console.log(`[AutoDailyInit] ${todayStr} → ${created} users initialized`);
        } catch (err) {
            lastInitDate = ''; // Reset so it retries on next call
            console.error('[AutoDailyInit] Failed:', err);
        }
    });
}
// ─────────────────────────────────────────────────────────────────────────────


export async function GET(req: NextRequest) {
    const startTime = Date.now();
    try {
        await connectDB();

        // Auto-init daily records at midnight (non-blocking background task)
        runDailyInitIfNeeded();


        // ─── Settings (cached) ───────────────────────────────────────────────
        let settings: any = getFromCache('settings');
        if (!settings) {
            settings = await GameSettings.findOne({ game: 'wingo' }, 
                { periodRefTime: 1, periodRef: 1, sessionActive: 1, showUpcomingToUsers: 1, upcomingPeriod: 1 }
            ).lean();
            if (settings) setToCache('settings', settings);
        }

        // 0. Parse userId for personal prediction assignment
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // 1. Calculate Current Period
        const now = new Date();
        const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();
        const refTime = new Date(settings ? settings.periodRefTime : new Date()).getTime();
        const diffMs = currentMinuteStart - refTime;
        const periodsPassed = Math.floor(diffMs / 60000);
        const currentPeriod = settings ? (settings.periodRef + periodsPassed).toString() : '1000666';

        if (!settings || !settings.sessionActive) {
            return NextResponse.json({
                success: true,
                data: null,
                period: currentPeriod,
                settings: settings ? {
                    showUpcomingToUsers: settings.showUpcomingToUsers,
                    upcomingPeriod: settings.upcomingPeriod
                } : null,
                message: 'Session is currently inactive'
            });
        }

        const currentSecond = now.getSeconds();
        const WingoOrder = (await import('@/lib/models/wingo-order')).default;
        
        // Fetch user-specific prediction (always fresh — personal data, small indexed query)
        let userPrediction = null;
        let userAmount = 0;
        if (userId) {
            const order = await WingoOrder.findOne(
                { userId, period: currentPeriod },
                { prediction: 1, amount: 1 }
            ).lean();
            if (order) {
                userPrediction = (order as any).prediction;
                userAmount = (order as any).amount;
            }
        }

        // ─── Period Data (cached) ────────────────────────────────────────────
        const periodCacheKey = `period_${currentPeriod}`;
        let periodData: any = getFromCache(periodCacheKey);

        if (!periodData) {
            periodData = await WingoPeriod.findOne({ period: currentPeriod },
                { state: 1, result: 1, sessionId: 1, totalBigVolume: 1, totalSmallVolume: 1 }
            ).lean();

            if (currentSecond >= 10) {
                if (!periodData || periodData.state === 'WAITING') {
                    periodData = await processWingoPeriod(currentPeriod);
                }
            } else if (!periodData) {
                const newPeriod = await WingoPeriod.create({ period: currentPeriod, state: 'WAITING' });
                periodData = (newPeriod as any).toObject();
            }

            if (periodData) {
                if (periodData._id) periodData.id = periodData._id.toString();
                // Only cache if fully processed (not WAITING), so engine runs exactly once
                if (periodData.state !== 'WAITING') {
                    setToCache(periodCacheKey, periodData);
                }
            }
        }

        // ─── Session History (cached) ────────────────────────────────────────
        let activeSession: any = getFromCache('activeSession');
        if (!activeSession) {
            activeSession = await Session.findOne(
                { game: 'WinGo', status: 'Running' },
                { _id: 1, pastResults: 1 }
            ).sort({ createdAt: -1 }).lean();
            if (activeSession) setToCache('activeSession', activeSession);
        }

        const endTime = Date.now();
        console.log(`[API] /wingo/active ${endTime - startTime}ms | Period: ${currentPeriod} | User: ${userId || 'anon'}`);

        return NextResponse.json({
            success: true,
            data: {
                period: currentPeriod,
                endTime: new Date(currentMinuteStart + 60000),
                status: periodData?.state || 'WAITING',
                prediction: periodData?.state === 'RESULT_DECLARED' ? periodData?.result : userPrediction,
                amount: userAmount,
                id: periodData?.id,
                pastResults: activeSession?.pastResults || []
            },
            settings: {
                showUpcomingToUsers: settings.showUpcomingToUsers,
                upcomingPeriod: settings.upcomingPeriod
            }
        });
    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/games/wingo/active - Time: ${endTime - startTime}ms`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch session' },
            { status: 500 }
        );
    }
}
