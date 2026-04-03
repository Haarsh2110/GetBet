import { NextRequest } from 'next/server';
import { updateAvatar } from '@/backend/controllers/user.controller';

export async function POST(req: NextRequest) {
    return updateAvatar(req);
}
