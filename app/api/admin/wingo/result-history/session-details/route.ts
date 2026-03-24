import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WingoPeriod from '@/lib/models/wingo-period';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
        }

        const periodsRaw = await WingoPeriod.find({
            sessionId: sessionId
        })
            .sort({ period: -1 })
            .lean();

        // Fetch session status
        const Session = (await import('@/lib/models/session')).default;
        const session = await Session.findById(sessionId)
            .select('status _id')
            .lean();

        // EXCLUSIVE SOURCE OF TRUTH: Use adminResult and adminStatus
        // Ignore any system-prefilled fields from 'result' or 'status'
        let totalTurnover = 0;
        const periods = periodsRaw.map(p => {
            const periodVolume = (p.totalBigVolume || 0) + (p.totalSmallVolume || 0);
            totalTurnover += periodVolume;
            return {
                ...p,
                id: (p as any)._id.toString(),
                result: p.adminResult || null,
                status: p.adminStatus || 'pending',
                volume: periodVolume
            };
        });

        return NextResponse.json({
            success: true,
            data: periods,
            totalTurnover,
            session: session ? {
                status: session.status,
                id: session._id.toString()
            } : null
        });
    } catch (error: any) {
        console.error('Error fetching session details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed' },
            { status: 500 }
        );
    }
}
