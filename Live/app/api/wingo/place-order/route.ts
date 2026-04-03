import { NextRequest } from 'next/server';
import { placeOrder } from '@/backend/controllers/wingo.controller';

export async function POST(req: NextRequest) {
    return placeOrder(req);
}
