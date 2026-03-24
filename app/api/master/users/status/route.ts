import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';

export async function POST(request: Request) {
    try {
        await connectDB();
        const { userId, isVip } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Toggle VIP Plan
        const plan = isVip ? 'elite' : 'none';
        await User.findByIdAndUpdate(userId, { $set: { vipPlan: plan } });

        return NextResponse.json({ 
            success: true, 
            message: `User Plan updated: ${plan}`
        });
    } catch (error) {
        console.error('VIP Update Error:', error);
        return NextResponse.json({ success: false, message: 'System Error.' }, { status: 500 });
    }
}
