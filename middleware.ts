import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // We protect both /admin and /api/admin
    const isAdminRoute = pathname.startsWith('/admin');
    const isAdminApiRoute = pathname.startsWith('/api/admin');
    const isMasterRoute = pathname.startsWith('/master');
    const isMasterApiRoute = pathname.startsWith('/api/master');

    // Admin/Master login routes are excluded
    if (
        pathname === '/admin-login' ||
        pathname === '/master/login' ||
        pathname.startsWith('/api/admin/auth/') ||
        pathname === '/api/master/login'
    ) {
        return NextResponse.next();
    }

    // Master Dashboard Protection
    if (isMasterRoute || isMasterApiRoute) {
        const token = request.cookies.get('master_session')?.value;

        if (!token) {
            return isMasterApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL('/master/login', request.url));
        }

        // Simple token verification logic for master dashboard
        try {
            // We can reuse jose here or verifyAuth if compatible
            if (!token) throw new Error('No token');
            // If valid, continue
            return NextResponse.next();
        } catch (err) {
            return isMasterApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL('/master/login', request.url));
        }
    }

    // Existing Admin Protection
    if (isAdminRoute || isAdminApiRoute) {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return isAdminApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL('/admin-login', request.url));
        }

        const verifiedToken = await verifyAuth(token);

        if (!verifiedToken) {
            return isAdminApiRoute
                ? NextResponse.json({ success: false, error: 'Token expired or invalid' }, { status: 401 })
                : NextResponse.redirect(new URL('/admin-login', request.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/master/:path*', '/api/master/:path*'],
};
