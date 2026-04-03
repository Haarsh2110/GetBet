import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WingoOrder from '@/lib/models/wingo-order';
import WingoPeriod from '@/lib/models/wingo-period';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
        }

        // 1. Fetch user's orders sorted by newest
        const orders = await WingoOrder.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        if (orders.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const userPeriods = orders.map((o: any) => o.period);

        // 2. Fetch the corresponding WingoPeriod records to check Admin's declared results
        const periods = await WingoPeriod.find({ period: { $in: userPeriods } }).lean();
        
        // 3. Create a lookup map for quick access
        const periodLookup = new Map<string, any>();
        periods.forEach((p: any) => {
            periodLookup.set(String(p.period).trim(), p);
        });

        // 4. Map user's orders & determine win/loss based on WingoPeriod.adminResult
        const mappedOrders = orders.map((order: any) => {
            const periodDoc = periodLookup.get(String(order.period).trim());
            
            let status = 'PENDING';
            let won = false;

            if (periodDoc && periodDoc.adminStatus === 'completed' && periodDoc.adminResult) {
                status = 'DECLARED';
                // Did the user win their prediction?
                if (String(periodDoc.adminResult).toUpperCase() === String(order.prediction).toUpperCase()) {
                    won = true;
                }
            }

            return {
                id: order._id.toString(),
                period: order.period,
                prediction: order.prediction,
                amount: order.amount,
                createdAt: order.createdAt,
                status,
                won,
                actualResult: periodDoc ? periodDoc.adminResult : null
            };
        });

        return NextResponse.json({ success: true, data: mappedOrders });
    } catch (error: any) {
        console.error('Error fetching my-predictions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed' },
            { status: 500 }
        );
    }
}
