import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';

export async function updateName(req: NextRequest) {
    try {
        const { phone, name } = await req.json();

        if (!phone || !name || name.trim().length < 2) {
            return NextResponse.json({ error: 'Invalid name or phone' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOneAndUpdate(
            { phone },
            { name: name.trim() },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, name: user.name });
    } catch (err: any) {
        console.error('[UPDATE NAME ERROR]', err);
        return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
    }
}

export async function updateAvatar(req: NextRequest) {
    try {
        const { userId, avatar } = await req.json();

        if (!userId || !avatar) {
            return NextResponse.json({ error: 'User ID and avatar are required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOneAndUpdate(
            { userId },
            { avatar },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, avatar: (user as any).avatar });
    } catch (err: any) {
        console.error('[UPDATE AVATAR ERROR]', err);
        return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 });
    }
}

export async function updateBank(req: NextRequest) {
    try {
        const { userId, bankDetails, password } = await req.json();
        const bcrypt = (await import('bcryptjs')).default;

        if (!userId || !bankDetails || !password) {
            return NextResponse.json({ success: false, error: 'Please enter all bank details and password' }, { status: 400 });
        }

        await connectDB();
        
        // High-Velocity Selective Fetch: Only security key
        const user = await User.findOne({ userId }).select('password').lean();

        if (!user || !user.password) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Verify key
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
        }

        // Atomic Secure Update
        await User.updateOne({ userId }, { $set: { bankDetails } });

        return NextResponse.json({ success: true, message: 'Bank details updated successfully' });
    } catch (err: any) {
        console.error('[UPDATE BANK ERROR]', err);
        return NextResponse.json({ success: false, error: 'Failed to update bank details' }, { status: 500 });
    }
}
