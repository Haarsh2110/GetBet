import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/transaction';

export const dynamic = 'force-dynamic';

// GET /api/transactions?type=withdraw&limit=20
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        }

        await connectDB();

        const type = searchParams.get('type');     // 'deposit' | 'withdraw' | etc.
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const query: Record<string, any> = { userId };
        if (type) query.type = type;

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ transactions });
    } catch (err: any) {
        console.error('[GET /api/transactions]', err);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
