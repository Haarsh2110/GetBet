import { NextRequest } from 'next/server';
import { getWingoHistory } from '@/backend/controllers/wingo.controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    return getWingoHistory(req);
}
