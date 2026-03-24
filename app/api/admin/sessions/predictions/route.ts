import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period');

        if (!period) {
            return NextResponse.json({ success: false, error: 'Period is required' }, { status: 400 });
        }

        const WingoOrder = (await import('@/lib/models/wingo-order')).default;

        // Fetch all orders for this period grouped by prediction
        const orders = await WingoOrder.find({ period }, { userId: 1, amount: 1, prediction: 1 }).lean();

        const smallOrders = orders.filter((o: any) => o.prediction === 'SMALL');
        const bigOrders = orders.filter((o: any) => o.prediction === 'BIG');

        const smallVolume = smallOrders.reduce((s: number, o: any) => s + (o.amount || 0), 0);
        const bigVolume = bigOrders.reduce((s: number, o: any) => s + (o.amount || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                smallVolume,
                bigVolume,
                smallCount: smallOrders.length,
                bigCount: bigOrders.length,
                smallUsers: smallOrders.map((o: any) => ({ id: o.userId, amount: o.amount })),
                bigUsers: bigOrders.map((o: any) => ({ id: o.userId, amount: o.amount })),
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
