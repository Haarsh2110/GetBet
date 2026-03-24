import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    try {
        await connectDB();

        // Date format from URL is dd-mm-yyyy e.g. "02-03-2026"
        const { date: dateStr } = await params;
        const [day, month, year] = dateStr.split('-');

        const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

        const query = {
            game: 'WinGo',
            status: { $in: ['Running', 'Completed', 'Settled'] },
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        };

        const sessions = await Session.find(query)
            .select('_id period totalPool createdAt')
            .sort({ createdAt: -1 })
            .lean();

        const totalSession = sessions.length;
        const totalTurnover = sessions.reduce((sum, s) => sum + (s.totalPool || 0), 0);

        // Map to format suitable for UI
        const mappedSessions = sessions.map((s, index) => ({
            id: s._id,
            sessionNo: s.period, // Or we could use (totalSession - index) if they want 7,6,5,4 sequential
            turnover: s.totalPool || 0,
            index: totalSession - index // matching the 7, 6, 5... format in screenshot
        }));

        return NextResponse.json({
            success: true,
            data: {
                date: dateStr,
                totalSession,
                totalTurnover,
                sessions: mappedSessions
            }
        });

    } catch (error: any) {
        console.error('Error fetching prediction history details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch prediction history details' },
            { status: 500 }
        );
    }
}
