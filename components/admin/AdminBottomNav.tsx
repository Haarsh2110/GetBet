'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, User } from 'lucide-react';

export default function AdminBottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/admin') return pathname === '/admin';
        return pathname?.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0A] border-t border-white/5 flex justify-around items-center py-4 px-4 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            <Link href="/admin" className={`flex flex-col items-center gap-1.5 ${isActive('/admin') ? 'text-primary' : 'text-white opacity-50 hover:opacity-100'} transition-opacity`}>
                <Home size={20} className={isActive('/admin') ? 'text-primary' : ''} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${isActive('/admin') ? 'text-primary' : ''}`}>Home</span>
                {isActive('/admin') && <span className="w-1 h-1 bg-primary rounded-full mt-0.5 shadow-gold"></span>}
            </Link>
            <Link href="/admin/orders" className={`flex flex-col items-center gap-1.5 ${isActive('/admin/orders') ? 'text-primary' : 'text-white opacity-50 hover:opacity-100'} transition-opacity`}>
                <LayoutDashboard size={20} className={isActive('/admin/orders') ? 'text-primary' : ''} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${isActive('/admin/orders') ? 'text-primary' : ''}`}>Dashboard</span>
                {isActive('/admin/orders') && <span className="w-1 h-1 bg-primary rounded-full mt-0.5 shadow-gold"></span>}
            </Link>
            <Link href="/admin/settings" className={`flex flex-col items-center gap-1.5 ${isActive('/admin/settings') ? 'text-primary' : 'text-white opacity-50 hover:opacity-100'} transition-opacity`}>
                <User size={20} className={isActive('/admin/settings') ? 'text-primary' : ''} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${isActive('/admin/settings') ? 'text-primary' : ''}`}>Account</span>
                {isActive('/admin/settings') && <span className="w-1 h-1 bg-primary rounded-full mt-0.5 shadow-gold"></span>}
            </Link>
        </div>
    );
}
