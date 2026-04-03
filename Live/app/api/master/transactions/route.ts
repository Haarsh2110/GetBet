import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Transaction from '@/backend/models/transaction';

export async function GET() {
    try {
        await connectDB();
        
        // Fetch last 100 transactions sorted by latest
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
                remark: (t as any).note || 'Manual Master Overwrite',
                createdAt: (t as any).createdAt
            }))
        });
    } catch (error) {
        console.error('Master Transactions Protocol Failure:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Master Node Synchronization Error' 
        }, { status: 500 });
    }
}
