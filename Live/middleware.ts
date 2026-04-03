import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';
import { APP_CONFIG } from './lib/constants';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const adminPath = APP_CONFIG.admin.path;
    const adminLoginPath = APP_CONFIG.admin.loginPath;

    const masterPath = APP_CONFIG.master.path;
    const masterLoginPath = APP_CONFIG.master.loginPath;

    // We protect both /admin and /api/admin
    const isAdminRoute = pathname === adminPath || pathname.startsWith(`${adminPath}/`);
    const isAdminApiRoute = pathname.startsWith('/api/admin');
    const isMasterRoute = pathname === masterPath || pathname.startsWith(`${masterPath}/`);
    const isMasterApiRoute = pathname.startsWith('/api/master');

    // Admin/Master login routes are excluded
    if (
        pathname === adminLoginPath ||
        pathname === masterLoginPath ||
        pathname.startsWith('/api/admin/auth/') ||
        pathname === '/api/master/login'
    ) {
        return NextResponse.next();
    }

    // Master Dashboard Protection (Role: master)
    if (isMasterRoute || isMasterApiRoute) {
        const token = request.cookies.get('master_session')?.value;

        if (!token) {
            return isMasterApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized: Master Key Missing' }, { status: 401 })
                : NextResponse.redirect(new URL(masterLoginPath, request.url));
        }

        const verified = await verifyAuth(token);
        if (!verified || verified.role !== 'master') {
            return isMasterApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized: Access Revoked' }, { status: 403 })
                : NextResponse.redirect(new URL(masterLoginPath, request.url));
        }

        return NextResponse.next();
    }


    // Admin Protection (Role: admin)
    if (isAdminRoute || isAdminApiRoute) {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return isAdminApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized: Admin Key Missing' }, { status: 401 })
                : NextResponse.redirect(new URL(adminLoginPath, request.url));
        }

        const verified = await verifyAuth(token);
        if (!verified || verified.role !== 'admin') {
            return isAdminApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized: Node Mismatch' }, { status: 403 })
                : NextResponse.redirect(new URL(adminLoginPath, request.url));
        }

        return NextResponse.next();
    }

    // --- User Protection System (Role: user) ---
    const userPrivatePaths = [
        '/wallet', '/profile', '/withdraw', '/deposit-details', 
        '/add-funds', '/games', '/wingo', '/reverse-betting', 
        '/vip-plans', '/payment-success'
    ];

    const isUserPrivateRoute = userPrivatePaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
    const isUserApiRoute = pathname.startsWith('/api/user') || pathname.startsWith('/api/wallet');

    if (isUserPrivateRoute || isUserApiRoute) {
        const token = request.cookies.get('user_token')?.value;

        if (!token) {
            return isUserApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL('/login', request.url));
        }

        const verified = await verifyAuth(token);
        if (!verified || verified.role !== 'user') {
            return isUserApiRoute
                ? NextResponse.json({ success: false, error: 'Invalid Session Node' }, { status: 403 })
                : NextResponse.redirect(new URL('/login', request.url));
        }
    }

    const response = NextResponse.next();

    // Professional Security Headers Node Injection
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
}

export const config = {
    matcher: [
        '/admin/:path*', '/api/admin/:path*', 
        '/master/:path*', '/api/master/:path*',
        '/wallet/:path*', '/profile/:path*', '/withdraw/:path*', 
        '/deposit-details/:path*', '/add-funds/:path*', 
        '/games/:path*', '/wingo/:path*', '/reverse-betting/:path*', 
        '/vip-plans/:path*', '/payment-success/:path*',
        '/api/user/:path*', '/api/wallet/:path*'
    ],
};
