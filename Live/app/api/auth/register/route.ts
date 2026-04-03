import { NextRequest } from 'next/server';
import { register } from '@/backend/controllers/auth.controller';

export async function POST(req: NextRequest) {
    return register(req);
}
