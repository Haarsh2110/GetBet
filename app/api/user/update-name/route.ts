import { NextRequest } from 'next/server';
import { updateName } from '@/backend/controllers/user.controller';

export async function POST(req: NextRequest) {
    return updateName(req);
}
