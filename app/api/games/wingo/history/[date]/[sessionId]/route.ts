import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';
import Transaction from '@/lib/models/transaction'; // If we need to calculate true volume per period

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ date: string, sessionId: string }> }) {
    try {
        await connectDB();

        const { date, sessionId } = await params;

        // Fetch the specific session by its _id
        const session = await Session.findById(sessionId)
            .select('_id period totalPool pastResults')
            .lean();

        if (!session) {
            return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
        }

        // The session contains pastResults array which holds the period numbers
        // We will mock the "volume" (turnover per period) for now since period-specific pool isn't stored explicitly in the array
        // We can distribute the totalPool or just send back 0 if not available per period.

        // For a more accurate approach, we would query the Bets (Transactions) for this session's periods.
        // Assuming we want a quick implementation that looks like the UI design:

        // Ensure we sort pastResults by newest first
        const results = [...session.pastResults].sort((a, b) => {
            return Number(b.period) - Number(a.period);
        });

        // Map to format suitable for UI
        const mappedPeriods = results.map((r) => {
            // Volume calculation logic - currently missing from schema per period, so we use a placeholder or distribute
            // In a real app, this would be a sum of bets for `r.period`
            const estimatedVolume = Math.floor((session.totalPool || 0) / Math.max(1, session.pastResults.length));

            return {
                period: r.period,
                volume: estimatedVolume, // Placeholder for exact period turnover
                result: r.result,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                date: date,
                sessionCountStr: session.period, // Using base period as an identifier
                totalTurnover: session.totalPool || 0,
                periods: mappedPeriods
            }
        });

    } catch (error: any) {
        console.error('Error fetching prediction history periods:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch prediction history periods' },
            { status: 500 }
        );
    }
}
