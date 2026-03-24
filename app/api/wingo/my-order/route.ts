import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WingoOrder from '@/lib/models/wingo-order';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const period = searchParams.get('period');

        if (!userId || !period) {
            return NextResponse.json({ success: false, error: 'Missing userId or period' }, { status: 400 });
        }

        const order = await WingoOrder.findOne({ userId, period });

        return NextResponse.json({
            success: true,
            data: order || null
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
