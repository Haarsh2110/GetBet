import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';

export const dynamic = 'force-dynamic';

// ─── Wallet Server Cache (3s TTL) ────────────────────────────────────────────
// Each page navigation triggers refreshWallet(). With this cache,
// rapid navigation no longer hammers MongoDB.
const walletCache = new Map<string, { data: any; ts: number }>();
const WALLET_CACHE_TTL = 3000;

// GET /api/wallet — fetch wallet balances
export async function GET(req: Request) {
    const startTime = Date.now();
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        }

        // Check server cache first
        const cached = walletCache.get(userId);
        if (cached && Date.now() - cached.ts < WALLET_CACHE_TTL) {
            return NextResponse.json(cached.data);
        }

        await connectDB();

        let user = await User.findOne({ userId })
            .select('mainBalance bettingBalance reverseBalance vipBalance estimatedBet vipPlan vipExpiresAt name')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let vipBalance = user.vipBalance || 0;
        
        // Auto-fix: Only write to DB when actually needed (not on every request)
        if (user.vipPlan && user.vipPlan !== 'none' && vipBalance === 0) {
            vipBalance = 100000;
            User.updateOne({ userId }, { $set: { vipBalance: 100000 } }).catch(() => {});
        }

        const payload = {
            mainBalance: user.mainBalance || 0,
            bettingBalance: user.bettingBalance || 0,
            reverseBalance: user.reverseBalance || 0,
            vipBalance,
            estimatedBet: user.estimatedBet || 0,
            vipPlan: user.vipPlan || 'none',
            vipExpiresAt: user.vipExpiresAt || null,
            name: user.name,
        };

        walletCache.set(userId, { data: payload, ts: Date.now() });

        const endTime = Date.now();
        console.log(`[Wallet] ${endTime - startTime}ms | user: ${userId}`);

        return NextResponse.json(payload);

    } catch (err: any) {
        const endTime = Date.now();
        console.error(`[API Error] GET /api/wallet - Time: ${endTime - startTime}ms`, err);
        return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
    }
}
