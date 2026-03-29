import { NextRequest } from 'next/server';
import { buyPlan } from '@/backend/controllers/wallet.controller';

export async function POST(req: NextRequest) {
    return buyPlan(req);
}
