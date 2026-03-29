import { NextRequest } from 'next/server';
import { getMyOrder } from '@/backend/controllers/wingo.controller';

export async function GET(req: NextRequest) {
    return getMyOrder(req);
}
