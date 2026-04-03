import { NextResponse } from 'next/server';
import { signAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Check against Environment Variables
        const masterEmail = process.env.MASTER_ADMIN_EMAIL;
        const masterPassword = process.env.MASTER_ADMIN_PASSWORD;

        if (email === masterEmail && password === masterPassword) {
            // Use unified signAuth logic for professional-grade security
            const token = await signAuth({ id: email, role: 'master' });

            // Set Secure HttpOnly Cookie
            const cookieStore = await cookies();
            cookieStore.set('master_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return NextResponse.json({ success: true, message: 'Node Verified: Master Node Access Granted' });
        }

        return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Master Login Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
