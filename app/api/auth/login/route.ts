import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone || phone.length < 10) {
            return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
        }

        await connectDB();

        // Find or Create user
        let user = await User.findOne({ phone });

        if (!user) {
            // New user registration
            user = await User.create({
                userId: `user_${Date.now()}`,
                name: `User ${phone.slice(-4)}`,
                email: `${phone}@getbet.vip`,
                phone: phone,
                mainBalance: 0,
                bettingBalance: 0,
                reverseBalance: 0,
                vipPlan: 'none',
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.userId,
                phone: user.phone,
                name: user.name
            }
        });
    } catch (err: any) {
        console.error('[AUTH ERROR]', err);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
