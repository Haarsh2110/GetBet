import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/transaction';
import User from '@/lib/models/user';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const status = searchParams.get('status') || 'pending';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const query = { type: 'withdraw', status };

        const skip = (page - 1) * limit;

        const withdrawals = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get user details for these withdrawals
        const userIds = withdrawals.map(w => w.userId);
        const users = await User.find({ userId: { $in: userIds } }).select('userId name email');

        const userMap = users.reduce((acc, user) => {
            acc[user.userId] = user;
            return acc;
        }, {} as Record<string, any>);

        const enrichedWithdrawals = withdrawals.map(w => ({
            ...w,
            user: userMap[w.userId] || { name: 'Unknown', email: 'N/A' }
        }));

        const total = await Transaction.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: enrichedWithdrawals,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('Error fetching admin withdrawals:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch withdrawals' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { transactionId, action, reason } = body;

        if (!transactionId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid action or missing transactionId' }, { status: 400 });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction || transaction.type !== 'withdraw' || transaction.status !== 'pending') {
            return NextResponse.json({ success: false, error: 'Invalid or already processed withdrawal' }, { status: 400 });
        }

        const user = await User.findOne({ userId: transaction.userId });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        if (action === 'approve') {
            transaction.status = 'approved';
            // Normally trigger bank payout logic here
        } else if (action === 'reject') {
            transaction.status = 'rejected';
            transaction.reason = reason || 'Rejected by system admin';
            // Refund the user's main balance since it was deducted when the request was made
            user.mainBalance += transaction.amount;
            await user.save();
        }

        await transaction.save();

        return NextResponse.json({ success: true, data: transaction });
    } catch (error: any) {
        console.error('Error processing withdrawal:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process withdrawal' },
            { status: 500 }
        );
    }
}
