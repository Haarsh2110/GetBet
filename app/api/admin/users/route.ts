import { NextRequest } from 'next/server';
import { getAdminUsers, createAdminUser, updateAdminUser } from '@/backend/controllers/admin.controller';

export async function GET(req: NextRequest) {
    return getAdminUsers(req);
}

export async function POST(req: NextRequest) {
    return createAdminUser(req);
}

export async function PATCH(req: NextRequest) {
    return updateAdminUser(req);
}
