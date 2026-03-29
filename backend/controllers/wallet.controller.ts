import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';

const walletCache = new Map<string, { data: any; ts: number }>();
const WALLET_CACHE_TTL = 3000;

export async function getWallet(req: Request) {
    const startTime = Date.now();
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        }

        const cached = walletCache.get(userId);
        if (cached && Date.now() - cached.ts < WALLET_CACHE_TTL) {
            return NextResponse.json(cached.data);
        }

        await connectDB();

        let user = await User.findOne({ userId })
            .select('mainBalance bettingBalance reverseBalance vipBalance estimatedBet vipPlan vipExpiresAt name')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let vipBalance = (user as any).vipBalance || 0;

        if (user.vipPlan && user.vipPlan !== 'none' && vipBalance === 0) {
            vipBalance = 100000;
            User.updateOne({ userId }, { $set: { vipBalance: 100000 } }).catch(() => { });
        }

        const payload = {
            mainBalance: (user as any).mainBalance || 0,
            bettingBalance: (user as any).bettingBalance || 0,
            reverseBalance: (user as any).reverseBalance || 0,
            vipBalance,
            estimatedBet: (user as any).estimatedBet || 0,
            vipPlan: user.vipPlan || 'none',
            vipExpiresAt: user.vipExpiresAt || null,
            name: user.name,
        };

        walletCache.set(userId, { data: payload, ts: Date.now() });

        const endTime = Date.now();
        console.log(`[Wallet] ${endTime - startTime}ms | user: ${userId}`);

        return NextResponse.json(payload);

    } catch (err: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/wallet - Time: ${endTime - startTime}ms`, err);
        return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
    }
}

export async function walletTransfer(req: Request) {
    try {
        const { userId, amount, direction } = await req.json();
        const Transaction = (await import('@/backend/models/transaction')).default;

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        await connectDB();

        const recentTransfer = await Transaction.findOne({
            userId,
            amount,
            type: direction === 'to_betting' ? 'bet' : 'transfer',
            createdAt: { $gte: new Date(Date.now() - 5000) }
        });

        if (recentTransfer) {
            return NextResponse.json({ success: true, message: 'Transfer already processed' });
        }
        const user = await User.findOne({ userId });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (direction === 'to_betting') {
            const isPlanActive = user.vipPlan && user.vipPlan !== 'none' && (!user.vipExpiresAt || new Date(user.vipExpiresAt) > new Date());
            if (!isPlanActive) {
                return NextResponse.json({ error: 'Please purchase a plan to start betting' }, { status: 403 });
            }

            if ((user as any).mainBalance < amount) {
                return NextResponse.json({ error: 'Insufficient main balance' }, { status: 400 });
            }
            (user as any).mainBalance -= amount;
            (user as any).bettingBalance += amount;

            const currentVipBalance = (user as any).vipBalance || 0;
            const currentEstimatedBet = (user as any).estimatedBet || 0;
            if (currentVipBalance >= amount) {
                (user as any).vipBalance = currentVipBalance - amount;
                (user as any).estimatedBet = currentEstimatedBet + amount;
            } else if (currentVipBalance > 0) {
                (user as any).estimatedBet = currentEstimatedBet + currentVipBalance;
                (user as any).vipBalance = 0;
            }
        } else if (direction === 'to_main') {
            const betBal = (user as any).bettingBalance || 0;
            const revBal = (user as any).reverseBalance || 0;
            if (betBal + revBal < amount) {
                return NextResponse.json({ error: 'Insufficient secondary balance' }, { status: 400 });
            }
            if (betBal >= amount) {
                (user as any).bettingBalance = betBal - amount;
            } else {
                (user as any).bettingBalance = 0;
                (user as any).reverseBalance = revBal - (amount - betBal);
            }
            (user as any).mainBalance += amount;
        } else if (direction === 'from_reverse') {
            const revBal = (user as any).reverseBalance || 0;
            if (revBal < amount) {
                return NextResponse.json({ error: 'Insufficient reverse balance' }, { status: 400 });
            }
            (user as any).reverseBalance = revBal - amount;
            (user as any).bettingBalance += amount;
        } else if (direction === 'from_vip') {
            if ((user as any).vipBalance < amount) {
                return NextResponse.json({ error: 'Insufficient VIP balance' }, { status: 400 });
            }
            (user as any).vipBalance -= amount;
            (user as any).bettingBalance += amount;
        } else {
            return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
        }

        await user.save();

        try {
            const { recordNewTransfer } = await import('@/lib/daily-recorder');
            if (direction === 'to_betting' || direction === 'from_reverse' || direction === 'from_vip') {
                await recordNewTransfer(userId, amount);
            } else if (direction === 'to_main') {
                await recordNewTransfer(userId, -amount);
            }
        } catch (e) {
            console.error('[DailyStats] Failed to update daily record:', e);
        }

        await Transaction.create({
            userId,
            type: direction === 'to_betting' ? 'bet' : 'transfer',
            amount,
            status: 'approved',
            method: direction === 'to_betting' ? 'Main to Betting' : 'Betting to Main',
            txnId: `${direction === 'to_betting' ? 'BET' : 'TRF'}-${Date.now()}`,
        });

        return NextResponse.json({
            success: true,
            mainBalance: (user as any).mainBalance,
            bettingBalance: (user as any).bettingBalance,
            reverseBalance: (user as any).reverseBalance,
            vipBalance: (user as any).vipBalance
        });
    } catch (err: any) {
        console.error('[POST /backend/controllers/walletTransfer]', err);
        return NextResponse.json({ error: `Transfer failed: ${err.message}` }, { status: 500 });
    }
}

export async function buyPlan(req: NextRequest) {
    try {
        const { planId, userId } = await req.json();
        const { PLANS } = await import('@/lib/plans');
        const Transaction = (await import('@/backend/models/transaction')).default;

        if (!planId || !userId || !(PLANS as any)[planId]) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const plan = (PLANS as any)[planId];
        await connectDB();

        const user = await User.findOne({ userId });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.vipPlan === planId && user.updatedAt && (Date.now() - new Date(user.updatedAt).getTime() < 10000)) {
            return NextResponse.json({ 
                success: true, 
                newBalance: (user as any).mainBalance, 
                vipPlan: user.vipPlan,
                message: 'Plan already activated' 
            });
        }

        if ((user as any).mainBalance < (plan as any).price) {
            return NextResponse.json({ error: `Insufficient balance. You need ₹${(plan as any).price}.` }, { status: 400 });
        }

        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { 
                $inc: { mainBalance: -(plan as any).price },
                $set: { 
                    vipPlan: planId,
                    vipBalance: 100000,
                    vipExpiresAt: new Date(Date.now() + (plan as any).days * 24 * 60 * 60 * 1000)
                }
            },
            { new: true }
        );

        await Transaction.create({
            userId,
            type: 'purchase',
            amount: (plan as any).price,
            status: 'approved',
            method: 'Wallet Balance',
            txnId: `BUY-${planId.toUpperCase()}-${Date.now()}`,
        });

        return NextResponse.json({
            success: true,
            newBalance: updatedUser?.mainBalance,
            vipPlan: updatedUser?.vipPlan
        });
    } catch (err: any) {
        console.error('[POST buyPlan]', err);
        return NextResponse.json({ error: `Purchase failed: ${err.message}` }, { status: 500 });
    }
}
