import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';

// Temporary mock bets storage memory (Resets on server restart)
let mockBets: any[] = [];

function generateRandomBets(users: any[], sessionId: string) {
    const options = ['Red', 'Green', 'Violet', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return users.map(user => {
        const amount = Math.floor(Math.random() * 5000) + 100;
        const choice = options[Math.floor(Math.random() * options.length)];
        return {
            id: `bet_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.userId,
            userName: user.name,
            sessionId,
            amount,
            choice,
            status: 'active',
            timestamp: new Date()
        };
    });
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
        }

        // If we don't have mock bets for this session, generate some
        let sessionBets = mockBets.filter(b => b.sessionId === sessionId && b.status === 'active');

        if (sessionBets.length === 0) {
            // Fetch 10 random users to act as players
            const users = await User.aggregate([{ $sample: { size: 10 } }]);
            if (users.length > 0) {
                const newBets = generateRandomBets(users, sessionId);
                mockBets = [...mockBets, ...newBets];
                sessionBets = newBets;
            }
        }

        // Calculate pool distribution
        const distribution = sessionBets.reduce((acc: any, bet: any) => {
            if (!acc[bet.choice]) acc[bet.choice] = 0;
            acc[bet.choice] += bet.amount;
            return acc;
        }, {});

        const totalPool = sessionBets.reduce((sum, bet) => sum + bet.amount, 0);

        return NextResponse.json({
            success: true,
            data: {
                players: sessionBets,
                distribution,
                totalPool,
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch live players' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, betId, userId } = body;

        if (action === 'kick') {
            // Remove bet from mock memory
            mockBets = mockBets.filter(b => b.id !== betId);
            return NextResponse.json({ success: true, message: 'User kicked from session' });
        }

        if (action === 'block') {
            await connectDB();
            // Block user in real DB
            await User.findOneAndUpdate({ userId }, { status: 'suspended' });
            // Remove their bets
            mockBets = mockBets.filter(b => b.userId !== userId);
            return NextResponse.json({ success: true, message: 'User blocked and kicked' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
    }
}
