import { NextRequest } from 'next/server';
import { getWingoHistoryByDate } from '@/backend/controllers/wingo.controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: any }) {
    return getWingoHistoryByDate(req, context);
}
