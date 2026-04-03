import { NextResponse } from 'next/server';
import { signAuth } from '@/lib/auth';
import { connectDB } from '@/backend/config/db';
import User from '@/backend/models/user';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;
        const bcrypt = (await import('bcryptjs')).default;

        await connectDB();

        // Standard Professional Fallback/Sync from .env
        const envAdminName = process.env.ADMIN_USERNAME;
        const envAdminPass = process.env.ADMIN_PASSWORD;

        if (username === envAdminName && password === envAdminPass) {
            // Check if this admin exists in DB with this password hashed
            let dbAdmin = await User.findOne({ userId: 'admin-001' });

            if (!dbAdmin) {
                // Seed initial admin node
                const hashedPassword = await bcrypt.hash(envAdminPass!, 10);
                dbAdmin = await User.create({
                    userId: 'admin-001',
                    name: envAdminName,
                    email: 'admin.terminal@getbet.vip',
                    phone: '0000000000',
                    password: hashedPassword,
                    role: 'admin',
                    status: 'active'
                });
            } else {
                // Verify if password needs sync (if .env was changed)
                const isMatch = await bcrypt.compare(envAdminPass!, dbAdmin.password!);
                if (!isMatch) {
                    dbAdmin.password = await bcrypt.hash(envAdminPass!, 10);
                    await dbAdmin.save();
                }
            }

            const token = await signAuth({ id: dbAdmin.userId, role: 'admin' });
            const response = NextResponse.json({ success: true, message: 'Node Verified: Admin Sync Success' });
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

        // Standard DB auth for other admins (if any)
        const dbUser = await User.findOne({ 
            $or: [{ name: username }, { userId: username }, { phone: username }],
            role: 'admin' 
        });

        if (dbUser && dbUser.password) {
            const isValid = await bcrypt.compare(password, dbUser.password);
            if (isValid) {
                const token = await signAuth({ id: dbUser.userId, role: 'admin' });
                const response = NextResponse.json({ success: true, message: 'Login successful' });
                response.cookies.set({
                    name: 'admin_token',
                    value: token,
                    httpOnly: true,
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 
                });
                return response;
            }
        }

        return NextResponse.json({ success: false, error: 'Authorization error: Security node mismatch' }, { status: 401 });
    } catch (error: any) {
        console.error('[AUTH GATEWAY ERROR]', error);
        return NextResponse.json({ success: false, error: 'Internal system synchronization error' }, { status: 500 });
    }
}
