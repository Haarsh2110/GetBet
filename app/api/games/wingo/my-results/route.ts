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

        // 1. Get all period numbers where the user has placed an order
        const userOrders: any[] = await WingoOrder.find({ userId })
            .select('period')
            .limit(100)
            .lean();

        if (userOrders.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const userPeriods = Array.from(new Set(userOrders.map((o: any) => o.period)));

        // 2. Fetch WingoPeriods that HAVE an admin result, and exist in user's history
        const periods = await WingoPeriod.find({
            period: { $in: userPeriods },
            adminStatus: 'completed'
        }).sort({ period: -1 }).lean();

        // 3. Map to simple format
        const filteredResults = periods.map((p: any) => ({
            period: p.period,
            result: p.adminResult,
            isRed: (p.adminResult === 'SMALL') // Or whatever color logic you have ('SMALL' is generally red)
        }));

        return NextResponse.json({ success: true, data: filteredResults });
    } catch (error: any) {
        console.error('Error fetching my-results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed' },
            { status: 500 }
        );
    }
}
