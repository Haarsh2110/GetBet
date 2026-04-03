import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';

export async function POST(request: Request) {
    try {
        await connectDB();
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ success: false, message: 'Identity check failed' }, { status: 400 });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return NextResponse.json({ success: false, message: 'Identity not found' }, { status: 404 });
        }

        // Toggle VIP Plan Protocol
        const currentPlan = user.vipPlan || 'none';
        const newPlan = currentPlan === 'none' ? 'elite' : 'none';
        
        await User.findOneAndUpdate({ phone }, { $set: { vipPlan: newPlan } });

        return NextResponse.json({ 
            success: true, 
            message: `User Plan Synced: ${newPlan}`,
            plan: newPlan
        });
    } catch (error) {
        console.error('VIP Protocol Sync Failure:', error);
        return NextResponse.json({ success: false, message: 'Neural Sync Failure' }, { status: 500 });
    }
}
