import { NextRequest } from 'next/server';
import { getUserTransactions } from '@/backend/controllers/transaction.controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    return getUserTransactions(req);
}
