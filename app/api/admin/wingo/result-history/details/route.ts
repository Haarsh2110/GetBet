import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/lib/models/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date'); // Format: DD-MM-YYYY

        if (!dateStr) {
            return NextResponse.json({ success: false, error: 'Date required' }, { status: 400 });
        }

        const [day, month, year] = dateStr.split('-').map(Number);
        
        // Target date range in UTC
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const sessions = await Session.find({
            game: 'WinGo',
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .select('period status createdAt')
        .sort({ createdAt: -1 })
        .lean();

        // Transform into format expected by frontend
        const data = sessions.map(s => ({
            period: s.period,
            result: s.status,
            isRed: s.status === 'Completed',
            createdAt: s.createdAt
        }));

        return NextResponse.json({
            success: true,
            data: data
        });
    } catch (error: any) {
        console.error('Error fetching period details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch details' },
            { status: 500 }
        );
    }
}
