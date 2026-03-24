import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';

export async function POST(req: NextRequest) {
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
