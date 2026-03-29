import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/backend/controllers/auth.controller';

export async function GET(req: NextRequest) {
    return getCurrentUser(req);
}
