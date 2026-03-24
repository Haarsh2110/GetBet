import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/lib/models/ticket';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const status = searchParams.get('status');
        const query: any = {};

        if (status) query.status = status;

        const tickets = await Ticket.find(query)
            .sort({ priority: -1, createdAt: -1 }) // Sort Critical first, then newest
            .limit(50);

        return NextResponse.json({
            success: true,
            data: tickets
        });
    } catch (error: any) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tickets' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, adminReply, status } = body;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
        }

        if (adminReply) ticket.adminReply = adminReply;
        if (status) {
            ticket.status = status;
            if (status === 'Resolved' || status === 'Closed') {
                ticket.resolvedAt = new Date();
            }
        }

        await ticket.save();

        return NextResponse.json({ success: true, data: ticket });
    } catch (error: any) {
        console.error('Error updating ticket:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update ticket' },
            { status: 500 }
        );
    }
}
