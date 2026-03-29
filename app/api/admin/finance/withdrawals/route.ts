import { NextRequest } from 'next/server';
import { getAdminWithdrawals, processAdminWithdrawal } from '@/backend/controllers/admin.controller';

export async function GET(req: NextRequest) {
    return getAdminWithdrawals(req);
}

export async function PATCH(req: NextRequest) {
    return processAdminWithdrawal(req);
}
