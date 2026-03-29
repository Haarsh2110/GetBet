import { NextRequest } from 'next/server';
import { sendOtp } from '@/backend/controllers/auth.controller';

export async function POST(req: NextRequest) {
    return sendOtp(req);
}
