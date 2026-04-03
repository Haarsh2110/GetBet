import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';

export async function GET() {
    try {
        await connectDB();
        
        // Fetch all users with role 'user' sorted by latest
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            users: users.map(u => ({
                _id: u._id,
                userId: u.userId,
                phone: u.phone,
                name: u.name,
                vipPlan: u.vipPlan || 'none',
                vipBalance: u.vipBalance || 0,
                createdAt: (u as any).createdAt
            }))
        });
    } catch (error) {
        console.error('Master Users API Fail:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Master Node Synchronization Error' 
        }, { status: 500 });
    }
}
