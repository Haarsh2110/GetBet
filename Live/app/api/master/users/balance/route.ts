import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';
import Transaction from '@/backend/models/transaction';

export async function POST(request: Request) {
    try {
        await connectDB();
        const { phone, amount, action } = await request.json();

        if (!phone || isNaN(amount)) {
            return NextResponse.json({ success: false, message: 'Invalid protocol input' }, { status: 400 });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return NextResponse.json({ success: false, message: 'Identity not found in core database' }, { status: 404 });
        }

        const val = Math.abs(parseFloat(amount));
        const adjustment = action === 'add' ? val : -val;
        const newBalance = (user.vipBalance || 0) + adjustment;

        // Perform balance injection
        await User.findOneAndUpdate({ phone }, { $set: { vipBalance: newBalance } });

        // Ledger LOG (using Transaction model)
        await Transaction.create({
            userId: user.userId,
            amount: val,
            type: action === 'add' ? 'deposit' : 'withdraw',
            status: 'completed',
            method: 'admin_manual',
            note: `Manual Master Overwrite: ${action}`
        });

        return NextResponse.json({ 
            success: true, 
            message: `Vault Sync Complete: ₹${newBalance}`,
            newBalance 
        });
    } catch (error) {
        console.error('Balance Sync Failure:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Neural Overwrite Error: System Failure' 
        }, { status: 500 });
    }
}
