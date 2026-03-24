import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/transaction';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDB();
        
        // Fetch last 100 transactions with populated user IDs if possible
        // Actually, Transaction model uses userId as string (usually user_xxxx)
        const transactions = await Transaction.find({}).sort({ createdAt: -1 }).limit(100);

        return NextResponse.json({
            success: true,
            transactions: transactions.map(t => ({
                _id: t._id,
                userId: t.userId,
                amount: t.amount,
                type: t.type,
                status: t.status,
                method: t.method || 'sys',
                remark: t.note || 'N/A',
                createdAt: t.createdAt
            }))
        });
    } catch (error) {
        console.error('Master Transactions API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
