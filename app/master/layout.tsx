'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
    LayoutDashboard, 
    Users, 
    Wallet, 
    Settings, 
    Power, 
    Menu, 
    X,
    ShieldAlert,
    Bell,
    Zap
} from 'lucide-react';

export default function MasterLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const logout = () => {
        document.cookie = 'master_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/master/login');
    };

    const routes = [
        { name: 'Overview', path: '/master', icon: LayoutDashboard },
        { name: 'User Panel', path: '/master/users', icon: Users },
        { name: 'Finances', path: '/master/finances', icon: Wallet },
        { name: 'Configuration', path: '/master/settings', icon: Settings },
    ];

    // If we're on login page, don't show sidebar
    if (pathname === '/master/login') return <>{children}</>;

    return (
        <div className="min-h-screen bg-background text-white flex overflow-hidden">
            {/* Desktop Sidebar (Permanent) */}
            <aside className="hidden lg:flex w-80 bg-surface/30 border-r border-white/5 flex-col p-8 transition-all relative overflow-y-auto">
                <div className="flex items-center gap-4 mb-20 px-4">
                    <div className="w-12 h-12 rounded-[20px] bg-primary flex items-center justify-center shadow-gold">
                        <LayoutDashboard size={24} className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Master</h1>
                        <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-1">Control Center</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {routes.map((route) => {
                        const Icon = route.icon;
                        const isActive = pathname === route.path;
                        return (
                            <button 
                                key={route.path}
                                onClick={() => router.push(route.path)}
                                className={`flex items-center gap-4 w-full p-5 rounded-[24px] font-black text-[10px] tracking-widest uppercase transition-all ${
                                    isActive 
                                    ? 'bg-primary text-black shadow-gold' 
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon size={18} /> {route.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="pt-20 border-t border-white/5">
                     <button onClick={logout} className="flex items-center gap-4 w-full p-5 rounded-[24px] text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all font-black text-[10px] tracking-widest uppercase">
                        <Power size={18} /> Security Kill
                    </button>
                </div>
            </aside>

            {/* Mobile Header / Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-surface/50 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between z-40">
                <h1 className="text-xl font-black italic uppercase italic">Master Console</h1>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Bottom Tab Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-2xl border-t border-white/10 p-3 px-6 z-50 flex items-center justify-between rounded-t-[32px] shadow-2xl">
                 {routes.map((route) => {
                     const Icon = route.icon;
                     const isActive = pathname === route.path;
                     return (
                         <button 
                            key={route.path}
                            onClick={() => router.push(route.path)}
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-500'}`}
                         >
                            <Icon size={20} />
                            <span className="text-[8px] font-black tracking-widest uppercase">{route.name.split(' ')[0]}</span>
                         </button>
                     );
                 })}
                 <button onClick={logout} className="flex flex-col items-center gap-1 text-red-500/30">
                    <Power size={20} />
                    <span className="text-[8px] font-black tracking-widest uppercase">Exit</span>
                 </button>
            </nav>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
                    >
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4/5 max-w-sm h-full bg-surface p-8 flex flex-col pt-24"
                        >
                            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <X size={24} />
                            </button>

                            <nav className="flex-1 space-y-4">
                                {routes.map((route) => {
                                    const Icon = route.icon;
                                    const isActive = pathname === route.path;
                                    return (
                                        <button 
                                            key={route.path}
                                            onClick={() => { router.push(route.path); setIsMobileMenuOpen(false); }}
                                            className={`flex items-center gap-4 w-full p-5 rounded-[24px] font-black text-[10px] tracking-widest uppercase transition-all ${
                                                isActive 
                                                ? 'bg-primary text-black' 
                                                : 'text-gray-500 hover:text-white'
                                            }`}
                                        >
                                            <Icon size={18} /> {route.name}
                                        </button>
                                    );
                                })}
                            </nav>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto pt-20 lg:pt-0 no-scrollbar">
                <div className="p-4 md:p-10 pb-32 lg:pb-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
