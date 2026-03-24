import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import Transaction from '@/lib/models/transaction';
import { PLANS, PlanId } from '@/lib/plans';

export async function POST(req: NextRequest) {
    try {
        const { planId, userId } = await req.json();

        if (!planId || !userId || !PLANS[planId as PlanId]) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const plan = PLANS[planId as PlanId];
        await connectDB();

        const user = await User.findOne({ userId });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent double-click race conditions (if bought same plan in last 10 seconds)
        if (user.vipPlan === planId && user.updatedAt && (Date.now() - new Date(user.updatedAt).getTime() < 10000)) {
            return NextResponse.json({ 
                success: true, 
                newBalance: user.mainBalance, 
                vipPlan: user.vipPlan,
                message: 'Plan already activated' 
            });
        }

        if (user.mainBalance < plan.price) {
            return NextResponse.json({ error: `Insufficient balance. You need ₹${plan.price}.` }, { status: 400 });
        }

        // Deduct balance and update VIP status
        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { 
                $inc: { mainBalance: -plan.price },
                $set: { 
                    vipPlan: planId,
                    vipBalance: 100000,
                    vipExpiresAt: new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000)
                }
            },
            { new: true }
        );

        // Record transaction
        await Transaction.create({
            userId,
            type: 'purchase',
            amount: plan.price,
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
        console.error('[POST /api/wallet/buy-plan]', err);
        return NextResponse.json({ error: `Purchase failed: ${err.message}` }, { status: 500 });
    }
}
