import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import WingoOrder from '@/backend/models/wingo-order';
import GameSettings from '@/backend/models/game-settings';
import WingoPeriod from '@/backend/models/wingo-period';

export async function placeOrder(req: NextRequest) {
    try {
        await connectDB();
        const { userId, amount, prediction } = await req.json();

        if (!userId || !amount || !prediction) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const settings = await GameSettings.findOne({ game: 'wingo' });
        if (!settings) {
            return NextResponse.json({ success: false, error: 'Game settings not found' }, { status: 500 });
        }

        if (settings.maintenanceMode) {
            return NextResponse.json({ success: false, error: 'Win Go is currently under maintenance. Please try again later.' }, { status: 403 });
        }

        const now = new Date();
        const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();
        const refTime = new Date(settings.periodRefTime).getTime();
        const diffMs = currentMinuteStart - refTime;
        const periodsPassed = Math.floor(diffMs / 60000);
        const currentPeriod = (settings.periodRef + periodsPassed).toString();
        
        const currentSecond = now.getSeconds();
        
        if (currentSecond < 10) {
             return NextResponse.json({ success: false, error: 'Betting closed for current period. Please wait for the next period.' }, { status: 400 });
        }

        const targetPeriod = (parseInt(currentPeriod) + 1).toString();

        const order = await WingoOrder.create({
            userId,
            period: targetPeriod,
            amount,
            prediction,
            status: 'PENDING'
        });

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

export async function getMyOrder(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const period = searchParams.get('period');

        if (!userId || !period) {
            return NextResponse.json({ success: false, error: 'Missing userId or period' }, { status: 400 });
        }

        const order = await WingoOrder.findOne({ userId, period });

        return NextResponse.json({
            success: true,
            data: order || null
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function getWingoHistory(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
        }

        const pipeline: any[] = [
            {
                $match: { userId: userId, status: { $regex: /./ } }
            },
            {
                $project: {
                    dateStr: {
                        $dateToString: { format: "%d-%m-%Y", date: "$createdAt", timezone: "Asia/Kolkata" }
                    },
                    amount: 1,
                    createdAt: 1
                }
            },
            {
                $group: {
                    _id: "$dateStr",
                    totalSession: { $sum: 1 },
                    turnover: { $sum: "$amount" },
                    sortKey: { $max: "$createdAt" }
                }
            },
            {
                $sort: { sortKey: -1 }
            },
            {
                $limit: 30
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalSession: 1,
                    turnover: 1
                }
            }
        ];

        const historyStats = await WingoOrder.aggregate(pipeline);

        return NextResponse.json({
            success: true,
            data: historyStats
        });
    } catch (error: any) {
        console.error('Error fetching prediction history:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch prediction history' },
            { status: 500 }
        );
    }
}

export async function getWingoHistoryByDate(req: NextRequest, { params }: { params: any }) {
    try {
        await connectDB();
        const Session = (await import('@/backend/models/session')).default;
        const { date: dateStr } = await params;
        const [day, month, year] = dateStr.split('-');

        const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

        const query = {
            game: 'WinGo',
            status: { $in: ['Running', 'Completed', 'Settled'] },
            createdAt: { $gte: startDate, $lte: endDate }
        };

        const sessions = await Session.find(query).select('_id period totalPool createdAt').sort({ createdAt: -1 }).lean();

        const totalSession = sessions.length;
        const totalTurnover = sessions.reduce((sum, s) => sum + ((s as any).totalPool || 0), 0);

        const mappedSessions = sessions.map((s, index) => ({
            id: s._id,
            sessionNo: (s as any).period,
            turnover: (s as any).totalPool || 0,
            index: totalSession - index
        }));

        return NextResponse.json({
            success: true,
            data: {
                date: dateStr,
                totalSession,
                totalTurnover,
                sessions: mappedSessions
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch prediction history details' }, { status: 500 });
    }
}
