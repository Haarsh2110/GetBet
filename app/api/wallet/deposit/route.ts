import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import Transaction from '@/lib/models/transaction';

// POST /api/wallet/deposit
export async function POST(req: NextRequest) {
    try {
        let { amount, txnId, userId, method = 'USDT TRC20', plan } = await req.json();

        // Robust parsing for amount
        amount = Number(amount);

        console.log(`[API Wallet Deposit] Request received:`, { userId, amount, txnId, plan });

        if (!userId || isNaN(amount) || amount <= 0) {
            console.warn('[API Wallet Deposit] Validation failed:', { amount, userId, hasTxnId: !!txnId });
            return NextResponse.json({ error: 'Invalid data (Check amount/userId)' }, { status: 400 });
        }

        await connectDB();
        
        console.log(`[API Wallet Deposit] Searching for user. Query: { userId: "${userId}" }`);
        // Try finding by userId first (the string "user_..."), then by MongoDB _id as fallback
        let user = await User.findOne({ userId });
        
        if (!user && mongoose.Types.ObjectId.isValid(userId)) {
            console.log(`[API Wallet Deposit] userId not found, trying as ObjectId: ${userId}`);
            user = await User.findById(userId);
        }

        if (!user) {
            console.error(`[API Wallet Deposit] CRITICAL: User not found in DB for ID: ${userId}`);
            const allUsers = await User.find().limit(5).select('userId phone');
            console.log(`[API Wallet Deposit] Sample users in DB for debug:`, allUsers);
            return NextResponse.json({ error: `User ID ${userId} not found in our records.` }, { status: 404 });
        }

        console.log(`[API Wallet Deposit] Found User: ${user.phone} (${user.userId}). Current Main Balance: ${user.mainBalance}`);

        // Backend Safety: Prevent duplicate transactions if txnId is provided
        if (txnId) {
            const existing = await Transaction.findOne({ txnId });
            if (existing) {
                console.warn(`[API Wallet Deposit] SKIP: Transaction ${txnId} already exists in DB.`);
                return NextResponse.json({ 
                    success: true, 
                    alreadyProcessed: true,
                    message: 'This Transaction ID has already been used/processed.' 
                });
            }
        }

        // Prepare Update
        const updateData: any = {};
        if (plan) {
            let days = 30;
            if (plan === 'growth') days = 60;
            if (plan === 'elite') days = 90;
            updateData.$set = {
                vipPlan: plan,
                vipBalance: 100000,
                vipExpiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            };
            console.log(`[API Wallet Deposit] Action: UPGRADE PLAN to ${plan}`);
        } else {
            updateData.$inc = { mainBalance: amount };
            console.log(`[API Wallet Deposit] Action: INCREMENT balance by ${amount}`);
        }

        // Perform Update
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            console.error(`[API Wallet Deposit] Failed to update user object in DB`);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log(`[API Wallet Deposit] SUCCESS! New Main Balance: ${updatedUser.mainBalance}`);

        // Record transaction
        await Transaction.create({
            userId: userId,
            type: 'deposit',
            amount,
            status: 'approved',
            method,
            txnId: txnId || `DEP-${Date.now()}`,
        });

        return NextResponse.json({
            success: true,
            newBalance: user.mainBalance,
        });
    } catch (err: any) {
        console.error('[POST /api/wallet/deposit]', err);
        return NextResponse.json({ error: `Deposit failed: ${err.message}` }, { status: 500 });
    }
}
