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

    // Master Dashboard Protection
    if (isMasterRoute || isMasterApiRoute) {
        const token = request.cookies.get('master_session')?.value;

        if (!token) {
            return isMasterApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL(masterLoginPath, request.url));
        }

        try {
            if (!token) throw new Error('No token');
            return NextResponse.next();
        } catch (err) {
            return isMasterApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL(masterLoginPath, request.url));
        }
    }


    // Existing Admin Protection
    if (isAdminRoute || isAdminApiRoute) {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return isAdminApiRoute
                ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL(adminLoginPath, request.url));
        }

        const verifiedToken = await verifyAuth(token);

        if (!verifiedToken) {
            return isAdminApiRoute
                ? NextResponse.json({ success: false, error: 'Token expired or invalid' }, { status: 401 })
                : NextResponse.redirect(new URL(adminLoginPath, request.url));
        }

        return NextResponse.next();
    }

    // --- User Protection System ---
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
        if (!verified) {
            return isUserApiRoute
                ? NextResponse.json({ success: false, error: 'Invalid Session' }, { status: 401 })
                : NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
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
