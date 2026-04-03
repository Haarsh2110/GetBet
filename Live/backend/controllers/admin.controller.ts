import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';
import Transaction from '@/backend/models/transaction';

export async function getAdminOverview() {
    const startTime = Date.now();
    try {
        await connectDB();

        const totalUsers = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ status: { $ne: 'banned' } });

        const volumeAggr = await Transaction.aggregate([
            { $match: { type: 'bet', status: 'completed' } },
            { $group: { _id: null, totalVolume: { $sum: '$amount' } } }
        ]);

        const totalVolume = volumeAggr.length > 0 ? volumeAggr[0].totalVolume : 0;

        const endTime = Date.now();
        console.log(`[API] GET /api/admin/overview - Time: ${endTime - startTime}ms`);

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                activeUsersCount,
                totalVolume,
                liveSessions: 4,
                ggr: totalVolume * 0.15,
            }
        });
    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/admin/overview - Time: ${endTime - startTime}ms`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch overview data' },
            { status: 500 }
        );
    }
}

export async function getAdminUsers(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const role = searchParams.get('role');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const group = searchParams.get('group');

        const query: any = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (group) query.groups = group;
        if (search) {
            query.$or = [
                { userId: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v').lean();
        const total = await User.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error: any) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch user data' }, { status: 500 });
    }
}

export async function createAdminUser(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        if (!body.userId) {
            body.userId = `user_${Date.now()}${Math.floor(Math.random() * 100)}`;
        }
        const newUser = await User.create(body);
        return NextResponse.json({ success: true, data: newUser });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function updateAdminUser(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { userId, action, data } = body;

        if (!userId || !action) {
            return NextResponse.json({ success: false, error: 'Missing userId or action' }, { status: 400 });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        if (action === 'update_status') {
            (user as any).status = data.status;
        } else if (action === 'update_role') {
            (user as any).role = data.role;
        } else if (action === 'update_balance') {
            (user as any).mainBalance += Number(data.amount || 0);
        } else if (action === 'edit_user') {
            if (data.name) user.name = data.name;
            if (data.email) user.email = data.email;
            if (data.phone) (user as any).phone = data.phone;
        } else if (action === 'assign_group') {
            (user as any).groups = data.groups;
        } else {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        await user.save();
        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
    }
}

export async function getAdminWithdrawals(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const status = searchParams.get('status') || 'pending';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const query = { type: 'withdraw', status };
        const skip = (page - 1) * limit;

        const withdrawals = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

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
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error: any) {
        console.error('Error fetching admin withdrawals:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch withdrawals' }, { status: 500 });
    }
}

export async function processAdminWithdrawal(req: NextRequest) {
    try {
        await connectDB();
        const { transactionId, action, reason } = await req.json();

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
            (transaction as any).status = 'approved';
        } else if (action === 'reject') {
            (transaction as any).status = 'rejected';
            (transaction as any).reason = reason || 'Rejected by system admin';
            (user as any).mainBalance += transaction.amount;
            await user.save();
        }

        await transaction.save();

        return NextResponse.json({ success: true, data: transaction });
    } catch (error: any) {
        console.error('Error processing withdrawal:', error);
        return NextResponse.json({ success: false, error: 'Failed to process withdrawal' }, { status: 500 });
    }
}

export async function getAdminTickets(req: NextRequest) {
    try {
        await connectDB();
        const Ticket = (await import('@/backend/models/ticket')).default;
        const { searchParams } = new URL(req.url);

        const status = searchParams.get('status');
        const query: any = {};
        if (status) query.status = status;

        const tickets = await Ticket.find(query).sort({ priority: -1, createdAt: -1 }).limit(50);

        return NextResponse.json({ success: true, data: tickets });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

export async function updateAdminTicket(req: NextRequest) {
    try {
        await connectDB();
        const Ticket = (await import('@/backend/models/ticket')).default;
        const { id, adminReply, status } = await req.json();

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
        }

        if (adminReply) (ticket as any).adminReply = adminReply;
        if (status) {
            (ticket as any).status = status;
            if (status === 'Resolved' || status === 'Closed') {
                (ticket as any).resolvedAt = new Date();
            }
        }

        await ticket.save();
        return NextResponse.json({ success: true, data: ticket });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to update ticket' }, { status: 500 });
    }
}
