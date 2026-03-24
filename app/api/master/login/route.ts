import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
    process.env.MASTER_ADMIN_PASSWORD || 'default_secret_key'
);

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Check against Environment Variables
        const masterEmail = process.env.MASTER_ADMIN_EMAIL;
        const masterPassword = process.env.MASTER_ADMIN_PASSWORD;

        if (email === masterEmail && password === masterPassword) {
            // Create JWT Token
            const token = await new SignJWT({ email, role: 'master' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('24h') // Token valid for 24 hours
                .sign(SECRET_KEY);

            // Set Secure HttpOnly Cookie
            const cookieStore = await cookies();
            cookieStore.set('master_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return NextResponse.json({ success: true, message: 'Login successful' });
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
