import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ date: string, sessionId: string, period: string }> }) {
    try {
        await connectDB();

        const { date, sessionId, period } = await params;
        const periodNumber = period;

        // Fetch the specific session by its _id
        const session = await Session.findById(sessionId);

        if (!session) {
            return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
        }

        // Find the specific period from the session's pastResults
        const periodData = session.pastResults.find((p) => p.period === periodNumber);

        if (!periodData) {
            return NextResponse.json({ success: false, error: 'Period not found' }, { status: 404 });
        }

        // We estimate the volume since real bets aren't stored by period in the DB yet
        const estimatedVolume = Math.floor((session.totalPool || 0) / Math.max(1, session.pastResults.length));

        // Mocking the split between Small and Big, ensuring total matches estimatedVolume
        // If result was 'Big', more volume/users went to 'Big' to match typical "house edge" or pattern.
        // But for UI display, we'll randomize a close distribution.
        const smallPercent = periodData.result === 'Small' ? 0.6 : 0.4;
        const smallVolume = Math.floor(estimatedVolume * smallPercent);
        const bigVolume = estimatedVolume - smallVolume;

        // Random users
        const totalUsers = Math.floor(estimatedVolume / 500) + 12; // Example math
        const smallUsers = Math.floor(totalUsers * smallPercent);
        const bigUsers = totalUsers - smallUsers;

        return NextResponse.json({
            success: true,
            data: {
                date: date,
                periodNumber: periodNumber,
                totalVolume: estimatedVolume,
                prediction: {
                    small: { volume: smallVolume, users: smallUsers },
                    big: { volume: bigVolume, users: bigUsers }
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching prediction period detail:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch prediction period detail' },
            { status: 500 }
        );
    }
}
