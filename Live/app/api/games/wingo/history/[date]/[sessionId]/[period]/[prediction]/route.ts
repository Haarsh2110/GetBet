import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ date: string, sessionId: string, period: string, prediction: string }> }) {
    try {
        await connectDB();

        const { date, sessionId, period, prediction } = await params;

        // Fetch the specific session by its _id
        const session = await Session.findById(sessionId);

        if (!session) {
            return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
        }

        const periodData = session.pastResults.find((p) => p.period === period);

        if (!periodData) {
            return NextResponse.json({ success: false, error: 'Period not found' }, { status: 404 });
        }

        // Logic matched from the `/[period]/route.ts` to ensure numbers stay consistent
        const estimatedVolume = Math.floor((session.totalPool || 0) / Math.max(1, session.pastResults.length));

        const smallPercent = periodData.result === 'Small' ? 0.6 : 0.4;
        const smallVolume = Math.floor(estimatedVolume * smallPercent);
        const bigVolume = estimatedVolume - smallVolume;

        const totalUsers = Math.floor(estimatedVolume / 500) + 12;
        const smallUsersCount = Math.floor(totalUsers * smallPercent);
        const bigUsersCount = totalUsers - smallUsersCount;

        // Determine which set to generate based on URL parameter
        const isSmall = prediction.toLowerCase() === 'small';
        const targetVolume = isSmall ? smallVolume : bigVolume;
        const targetUserCount = isSmall ? smallUsersCount : bigUsersCount;

        // Generate mock users to match the exact total volume
        const usersList = [];
        let remainingVolume = targetVolume;

        // We'll give the first few users slightly higher amounts to simulate "whales"
        for (let i = 0; i < targetUserCount; i++) {
            // Guarantee at least something for everyone, but distribute the rest randomly
            const baseBet = Math.floor(targetVolume / targetUserCount * 0.5);

            // If it's the last user, they get everything left. Otherwise a random chunk.
            let userVolume = 0;
            if (i === targetUserCount - 1) {
                userVolume = remainingVolume;
            } else {
                // Randomly assign a portion of the *remaining* volume, biased heavily to keep some for the rest
                const maxShare = remainingVolume - (baseBet * (targetUserCount - i - 1));
                userVolume = baseBet + Math.floor(Math.random() * (maxShare * 0.4));
            }

            remainingVolume -= userVolume;

            usersList.push({
                // Generates a random 6 digit string for visual matching 
                userId: Math.floor(100000 + Math.random() * 900000).toString(),
                volume: userVolume,
            });
        }

        // Sort highest stakes first to match UI logic
        usersList.sort((a, b) => b.volume - a.volume);

        return NextResponse.json({
            success: true,
            data: {
                date: date,
                periodNumber: period,
                prediction: isSmall ? 'SMALL' : 'BIG',
                totalVolume: targetVolume,
                userCount: targetUserCount,
                users: usersList
            }
        });

    } catch (error: any) {
        console.error('Error fetching prediction user list:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user list' },
            { status: 500 }
        );
    }
}
