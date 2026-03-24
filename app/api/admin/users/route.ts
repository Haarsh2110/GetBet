import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';

export async function GET(req: NextRequest) {
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
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { userId: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v')
            .lean(); // Use lean for faster JSON parsing

        const total = await User.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user data' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Generate a random userId if not provided
        if (!body.userId) {
            body.userId = `user_${Date.now()}${Math.floor(Math.random() * 100)}`;
        }

        const newUser = await User.create(body);
        return NextResponse.json({ success: true, data: newUser });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
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
            user.status = data.status; // 'active', 'suspended', 'banned'
        } else if (action === 'update_role') {
            user.role = data.role;
        } else if (action === 'update_balance') {
            user.mainBalance += Number(data.amount || 0);
        } else if (action === 'edit_user') {
            if (data.name) user.name = data.name;
            if (data.email) user.email = data.email;
            if (data.phone) user.phone = data.phone;
        } else if (action === 'assign_group') {
            user.groups = data.groups; // Expecting array of group names
        } else {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        await user.save();

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
