import { NextRequest } from 'next/server';
import { updateBank } from '@/backend/controllers/user.controller';

export async function POST(req: NextRequest) {
    return updateBank(req);
}
