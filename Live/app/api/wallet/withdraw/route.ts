import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import Transaction from '@/lib/models/transaction';

// POST /api/wallet/withdraw
export async function POST(req: NextRequest) {
    try {
        const { amount, userId, method = 'BANK', bankDetails, walletAddress, txnId, screenshot } = await req.json();

        if (!amount || amount <= 0 || !userId) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        await connectDB();

        // Backend Safety: Prevent duplicate withdrawals within 5 seconds (race condition)
        const recentWithdraw = await Transaction.findOne({
            userId,
            amount,
            type: 'withdraw',
            createdAt: { $gte: new Date(Date.now() - 5000) }
        });

        if (recentWithdraw) {
            return NextResponse.json({ success: true, message: 'Withdrawal already processed' });
        }

        const minWithdraw = 500;
        if (amount < minWithdraw) {
            return NextResponse.json({ error: `Minimum withdrawal is ₹${minWithdraw}` }, { status: 400 });
        }

        // Atomic deduct balance to prevent race conditions
        const user = await User.findOneAndUpdate(
            { userId: userId, mainBalance: { $gte: amount } },
            { $inc: { mainBalance: -amount } },
            { new: true }
        );

        if (!user) {
            // Either user doesn't exist or insufficient balance
            return NextResponse.json({ error: 'Insufficient balance or user not found' }, { status: 400 });
        }

        // Record transaction (pending — admin will approve)
        await Transaction.create({
            userId: userId,
            type: 'withdraw',
            amount,
            status: 'pending',
            method,
            txnId: txnId || `WD-${Date.now()}`,
            bankDetails,
            walletAddress,
            screenshot,
        });

        return NextResponse.json({ success: true, newBalance: user.mainBalance - amount });
    } catch (err: any) {
        console.error('[POST /api/wallet/withdraw]', err);
        return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
    }
}
