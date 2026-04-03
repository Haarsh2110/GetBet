import { NextRequest } from 'next/server';
import { getAdminTickets, updateAdminTicket } from '@/backend/controllers/admin.controller';

export async function GET(req: NextRequest) {
    return getAdminTickets(req);
}

export async function PATCH(req: NextRequest) {
    return updateAdminTicket(req);
}
