import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import Transaction from '@/lib/models/transaction';

export async function POST(request: Request) {
    try {
        await connectDB();
        const { userId, amount, action } = await request.json();

        if (!userId || isNaN(amount)) {
            return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const val = Math.abs(parseFloat(amount));
        const adjustment = action === 'add' ? val : -val;
        const newBalance = (user.vipBalance || 0) + adjustment;

        // Perform update
        await User.findByIdAndUpdate(userId, { $set: { vipBalance: newBalance } });

        // LOG (using existing Transaction model)
        await Transaction.create({
            userId: user.userId, // use their unique user_xxx ID
            amount: val,
            type: action === 'add' ? 'deposit' : 'withdraw',
            status: 'completed',
            method: 'admin_manual',
            note: `Manual ${action} by Master Admin`
        });

        return NextResponse.json({ 
            success: true, 
            message: `Vault updated: ₹${newBalance}`,
            newBalance 
        });
    } catch (error) {
        console.error('Balance Update Error:', error);
        return NextResponse.json({ success: false, message: 'System Error.' }, { status: 500 });
    }
}
