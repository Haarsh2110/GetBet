'use client';

import { Search, Bell, User, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    // Create a readable title from pathname
    const getPageTitle = () => {
        if (pathname === '/admin') return 'DASHBOARD';
        if (pathname === '/admin/orders') return 'ORDERS MANAGEMENT';
        if (pathname === '/admin/wingo') return 'WIN GO CONTROL';
        if (pathname === '/admin/wingo/result-history') return 'RESULT HISTORY';
        if (pathname === '/admin/wingo/prediction-history') return 'PREDICTION HISTORY';
        return 'ADMIN SYSTEM';
    };

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to log out?')) return;
        setLoggingOut(true);
        try {
            await fetch('/api/admin/auth/logout', { method: 'POST' });
            router.push('/admin-login');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <header className="h-16 md:h-20 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-4 md:px-8">

            {/* Page Title (hidden on small mobile) */}
            <div className="hidden sm:block ml-10 md:ml-0">
                <h1 className="font-display font-bold text-lg md:text-xl tracking-wide uppercase">{getPageTitle()}</h1>
                <p className="text-xs text-white/40 uppercase tracking-widest hidden md:block">GetBet Management System</p>
            </div>

            {/* Spacer for mobile */}
            <div className="sm:hidden ml-12"></div>

            {/* Right side actions */}
            <div className="flex items-center gap-4 md:gap-6">
                {/* Search */}
                <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-white/30" />
                    </div>
                    <input
                        type="text"
                        placeholder="Global search..."
                        className="w-48 bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/30 text-white"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-white/70 hover:text-white">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                </button>

                {/* Profile / Logout */}
                <div className="flex items-center gap-3 pl-2 md:pl-4 md:border-l border-white/10 group cursor-pointer relative" onClick={handleLogout}>
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-primary group-hover:hidden transition-all">Master Admin</span>
                        <span className="text-sm font-semibold text-accent-red hidden group-hover:block transition-all">
                            {loggingOut ? 'Logging out...' : 'Log Out'}
                        </span>
                        <span className="text-xs text-white/40">Online</span>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-surface to-white/10 flex items-center justify-center border border-white/10 overflow-hidden relative group-hover:border-accent-red/50 transition-colors">
                        <User size={18} className="text-white/50 group-hover:hidden" />
                        <LogOut size={16} className="text-accent-red hidden group-hover:block ml-1" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-green rounded-full border-2 border-background group-hover:hidden"></div>
                    </div>
                </div>
            </div>
        </header>
    );
}
