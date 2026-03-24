import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import Transaction from '@/lib/models/transaction';

export async function POST(req: NextRequest) {
    try {
        const { userId, amount, direction } = await req.json(); // direction: 'to_betting' or 'to_main'

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        await connectDB();

        // Backend Safety: Prevent duplicate transfers within 5 seconds
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
            // Plan Validation (Backend Safety)
            const isPlanActive = user.vipPlan && user.vipPlan !== 'none' && (!user.vipExpiresAt || new Date(user.vipExpiresAt) > new Date());
            if (!isPlanActive) {
                return NextResponse.json({ error: 'Please purchase a plan to start betting' }, { status: 403 });
            }

            if (user.mainBalance < amount) {
                return NextResponse.json({ error: 'Insufficient main balance' }, { status: 400 });
            }
            // Step 1: Transfer from main wallet to betting
            user.mainBalance -= amount;
            user.bettingBalance += amount;

            // Step 2: Auto-deduct same amount from VIP balance → add to estimatedBet
            const currentVipBalance = user.vipBalance || 0;
            const currentEstimatedBet = user.estimatedBet || 0;
            if (currentVipBalance >= amount) {
                user.vipBalance = currentVipBalance - amount;
                user.estimatedBet = currentEstimatedBet + amount;
            } else if (currentVipBalance > 0) {
                // Partial deduction if VIP balance is less than transfer amount
                user.estimatedBet = currentEstimatedBet + currentVipBalance;
                user.vipBalance = 0;
            }
            // If vipBalance is 0, estimatedBet stays as is (no deduction possible)
        } else if (direction === 'to_main') {
            const betBal = user.bettingBalance || 0;
            const revBal = user.reverseBalance || 0;
            if (betBal + revBal < amount) {
                return NextResponse.json({ error: 'Insufficient secondary balance' }, { status: 400 });
            }
            if (betBal >= amount) {
                user.bettingBalance = betBal - amount;
            } else {
                user.bettingBalance = 0;
                user.reverseBalance = revBal - (amount - betBal);
            }
            user.mainBalance += amount;
        } else if (direction === 'from_reverse') {
            const revBal = user.reverseBalance || 0;
            if (revBal < amount) {
                return NextResponse.json({ error: 'Insufficient reverse balance' }, { status: 400 });
            }
            user.reverseBalance = revBal - amount;
            user.bettingBalance += amount;
        } else if (direction === 'from_vip') {
            if (user.vipBalance < amount) {
                return NextResponse.json({ error: 'Insufficient VIP balance' }, { status: 400 });
            }
            user.vipBalance -= amount;
            user.bettingBalance += amount;
        } else {
            return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
        }

        await user.save();

        // --- UPDATE DAILY STATS RECORD ---
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

        // Record transaction
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
            mainBalance: user.mainBalance,
            bettingBalance: user.bettingBalance,
            reverseBalance: user.reverseBalance,
            vipBalance: user.vipBalance
        });
    } catch (err: any) {
        console.error('[POST /api/wallet/transfer]', err);
        return NextResponse.json({ error: `Transfer failed: ${err.message}` }, { status: 500 });
    }
}
