import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';
import GameSettings from '@/lib/models/game-settings';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const startTime = Date.now();
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const status = searchParams.get('status');
        const dateStr = searchParams.get('date');

        const query: any = {};

        if (status) query.status = status;

        if (dateStr) {
            // expected format 'DD-MM-YYYY'
            const [day, month, year] = dateStr.split('-').map(Number);
            // Adjust bounds to Asia/Kolkata (IST = UTC+5:30)
            const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
            startDate.setMinutes(startDate.getMinutes() - 330);

            const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
            endDate.setMinutes(endDate.getMinutes() - 330);

            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const sessions = await Session.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Dynamically import WingoPeriod to calculate actual turnovers
        const WingoPeriod = (await import('@/lib/models/wingo-period')).default;

        const formattedSessions = await Promise.all(sessions.map(async (s) => {
            // Aggregate exact turnover from periods for this session
            const periodsRaw = await WingoPeriod.find(
                { sessionId: s._id.toString() },
                { totalBigVolume: 1, totalSmallVolume: 1 }
            ).lean();

            const actualTurnover = periodsRaw.reduce((sum: number, p: any) => {
                return sum + (p.totalBigVolume || 0) + (p.totalSmallVolume || 0);
            }, 0);

            return {
                ...s,
                id: s._id.toString(),
                totalTurnover: actualTurnover
            };
        }));

        const total = await Session.countDocuments(query);

        const endTime = Date.now();
        console.log(`[API] GET /api/admin/sessions - Time: ${endTime - startTime}ms`);

        return NextResponse.json({
            success: true,
            data: formattedSessions,
            total
        });

    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/admin/sessions - Time: ${endTime - startTime}ms`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Admin manually creating a test session or overriding lifecycle
        const newSession = await Session.create(body);

        // Daily Reset & Increment sessionCount for WinGo
        if (body.game === 'WinGo') {
            const today = new Date().toISOString().split('T')[0];
            const settings = await GameSettings.findOne({ game: 'wingo' });
            if (settings) {
                if (settings.lastResetDate !== today) {
                    settings.sessionCount = 1;
                    settings.lastResetDate = today;
                } else {
                    settings.sessionCount += 1;
                }
                settings.sessionActive = true;
                await settings.save();
            }
        }

        return NextResponse.json({ success: true, data: newSession });
    } catch (error: any) {
        console.error('Error creating session:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create session' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const { id, action, ...updateData } = body;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
        }

        if (action === 'addPastResult') {
            const { period, result, isRed } = updateData;

            // 1. Update/Create WingoPeriod to reflect this pushed result
            const WingoPeriod = (await import('@/lib/models/wingo-period')).default;
            const normalizedResult = result.toUpperCase() as 'BIG' | 'SMALL';

            const periodDoc = await WingoPeriod.findOneAndUpdate(
                { period },
                {
                    adminResult: normalizedResult,
                    adminStatus: 'completed',
                    sessionId: id,
                    result: normalizedResult // Set main result too
                },
                { upsert: true, new: true }
            );

            // 2. Settle orders for this period (Settle Balance Logic)
            try {
                const WingoOrder = (await import('@/lib/models/wingo-order')).default;
                const User = (await import('@/lib/models/user')).default;
                const orders = await WingoOrder.find({ period, status: 'PENDING' });

                for (const order of orders) {
                    const user = await User.findOne({ userId: order.userId });
                    if (user) {
                        if (order.prediction !== normalizedResult) {
                            user.reverseBalance = (user.reverseBalance || 0) + order.amount;
                            try {
                                const { updateDailyExecution } = await import('@/lib/daily-recorder');
                                await updateDailyExecution(user.userId, order.amount, true);
                            } catch (e) {
                                console.error('[Settlement] DailyRecord Revert Failed:', e);
                            }
                            await user.save();
                        }
                    }
                    order.status = 'EXECUTED';
                    await order.save();
                }

                // If period belongs to session, update session status based on other periods
                const allSessionPeriods = await WingoPeriod.find({ sessionId: id });
                const hasPending = allSessionPeriods.some(p => p.adminStatus !== 'completed');
                await Session.findByIdAndUpdate(id, {
                    status: hasPending ? 'PENDING' : 'VERIFIED'
                });
            } catch (settleError) {
                console.error('[Settlement Error] Failed to settle orders during push:', settleError);
            }

            // 3. Keep exactly 5 results in session.pastResults (sliding window)
            const updated = await Session.findByIdAndUpdate(
                id,
                { $push: { pastResults: { $each: [{ period, result, isRed }], $slice: -5 } } },
                { new: true }
            );

            return NextResponse.json({ success: true, data: updated });
        }

        const { status, winningOutcome, endTime, totalDurationMs, bettingEnabled, autoResult, resultDelaySeconds, currentPeriod, upcomingPeriod } = updateData;

        const session = await Session.findById(id);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
        }

        // Handle Lifecycle / Status Toggles
        if (status) {
            if (status === 'Suspended' && session.status !== 'Suspended') {
                session.pausedTime = new Date();
            }
            if (status === 'Running' && session.status === 'Suspended' && session.pausedTime) {
                const now = new Date();
                const pausedDurationMs = now.getTime() - new Date(session.pausedTime).getTime();
                session.endTime = new Date(new Date(session.endTime).getTime() + pausedDurationMs);
                session.pausedTime = undefined;
            }
            session.status = status;
        }

        // Handle Total Duration Change (From Settings Modal)
        if (totalDurationMs !== undefined) {
            const durationDiff = totalDurationMs - session.timerIntervalMs;
            session.endTime = new Date(session.endTime.getTime() + durationDiff);
            session.timerIntervalMs = totalDurationMs;
        }

        // Handle Live Time Adjustments (+/- buttons)
        if (endTime) {
            const timeDiff = new Date(endTime).getTime() - session.endTime.getTime();
            session.endTime = new Date(endTime);
            session.timerIntervalMs += timeDiff;
        }

        // Handle Advanced Settings
        if (typeof bettingEnabled === 'boolean') session.bettingEnabled = bettingEnabled;
        if (typeof autoResult === 'boolean') session.autoResult = autoResult;
        if (typeof resultDelaySeconds === 'number') session.resultDelaySeconds = resultDelaySeconds;
        if (winningOutcome !== undefined) session.winningOutcome = winningOutcome;

        if (currentPeriod !== undefined) session.currentPeriod = currentPeriod;
        if (upcomingPeriod !== undefined) session.upcomingPeriod = upcomingPeriod;

        await session.save();

        return NextResponse.json({ success: true, data: session });
    } catch (error: any) {
        console.error('Error updating session:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update session' },
            { status: 500 }
        );
    }
}
