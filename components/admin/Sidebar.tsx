'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Gamepad2,
    ListOrdered,
    History,
    TrendingUp,
    Settings,
    LogOut,
    Menu,
    X,
    BarChart3,
    Users,
    Users2,
    Wallet,
    Banknote,
    FileCheck,
    MessageSquare,
    BellRing,
    Shield,
    ActivitySquare
} from 'lucide-react';
import { useState } from 'react';

const navCategories = [
    {
        title: 'Overview',
        items: [
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        ]
    },
    {
        title: 'User Management',
        items: [
            { href: '/admin/users', label: 'Users List', icon: Users },
            { href: '/admin/users/groups', label: 'Groups', icon: Users2 },
            { href: '/admin/users/history', label: 'User History', icon: History },
        ]
    },
    {
        title: 'Session Control',
        items: [
            { href: '/admin/sessions', label: 'Active Sessions', icon: Gamepad2 },
            { href: '/admin/sessions/results', label: 'Results & Appeals', icon: ListOrdered },
        ]
    },
    {
        title: 'Financial Admin',
        items: [
            { href: '/admin/finance/withdrawals', label: 'Withdrawals Queue', icon: Wallet },
            { href: '/admin/finance/history', label: 'Payment Ledger', icon: Banknote },
            { href: '/admin/finance/audit', label: 'Financial Audit', icon: FileCheck },
        ]
    },
    {
        title: 'Support & Comms',
        items: [
            { href: '/admin/support', label: 'Support Tickets', icon: MessageSquare },
            { href: '/admin/communication', label: 'Broadcasts', icon: BellRing },
        ]
    },
    {
        title: 'System Config',
        items: [
            { href: '/admin/settings', label: 'General Settings', icon: Settings },
            { href: '/admin/settings/roles', label: 'Access Control', icon: Shield },
            { href: '/admin/logs', label: 'System Logs', icon: ActivitySquare },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-surface rounded-md text-white/70 hover:text-white"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar background overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar itself */}
            <aside className={`
        fixed md:relative flex flex-col
        w-64 h-full bg-[#030614] border-r border-white/5 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                {/* Logo/Brand */}
                <div className="p-6 flex items-center justify-center border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
                            <span className="font-display font-bold text-lg text-black">GB</span>
                        </div>
                        <span className="font-display font-bold text-xl tracking-wider text-white">GET<span className="text-primary">BET</span></span>
                    </div>
                </div>

                {/* Navigation Area */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
                    {navCategories.map((category) => (
                        <div key={category.title} className="mb-6 last:mb-0">
                            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-3">
                                {category.title}
                            </div>
                            <div className="space-y-1">
                                {category.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                                ${isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                }
                                            `}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
                                            )}
                                            <Icon size={18} className={isActive ? 'text-primary' : 'group-hover:text-white transition-colors'} />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/5">
                    <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Exit Admin</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
