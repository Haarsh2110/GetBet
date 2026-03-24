import { NextResponse } from 'next/server';
import { signAuth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        // Hardcoded admin credentials for now
        // In production, this should check the User database model with hashed passwords
        const validUsername = process.env.ADMIN_USERNAME || 'admin';
        const validPassword = process.env.ADMIN_PASSWORD || 'getbet@admin2025';

        if (username === validUsername && password === validPassword) {
            const token = await signAuth({ id: 'admin-1', role: 'admin' });

            const response = NextResponse.json({ success: true, message: 'Login successful' });
            response.cookies.set({
                name: 'admin_token',
                value: token,
                httpOnly: true,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 // 24 hours
            });

            return response;
        }

        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
