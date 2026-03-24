import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDB();
        
        // Fetch all users sorted by latest
        const users = await User.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            users: users.map(u => ({
                _id: u._id,
                phoneNumber: u.phone || 'N/A',
                userName: u.name || 'Anonymous',
                isVip: u.vipPlan !== 'none',
                balance: u.vipBalance || 0,
                createdAt: u.createdAt
            }))
        });
    } catch (error) {
        console.error('Master Users API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
