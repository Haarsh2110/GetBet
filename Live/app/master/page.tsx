'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, 
    Wallet, 
    Zap, 
    TrendingUp, 
    ArrowUpRight, 
    ShieldCheck, 
    Lock,
    ExternalLink,
    Clock,
    CheckCircle2,
    Crown
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface Stats {
    totalUsers: number;
    volume30d: number;
    wingoBets: number;
    activeGames: number;
    velocity: Array<{
        date: string;
        totalOrder: number;
        executed: number;
    }>;
}

export default function MasterDashboard() {
    const masterPath = APP_CONFIG.master.path;
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/master/stats');
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Master Sync Fail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-primary text-[10px] font-black tracking-widest uppercase">Loading Dashboard...</p>
        </div>
    );

    const kpis = [
        { label: 'Total Users', value: stats?.totalUsers || 0, sub: 'Registered Accounts', icon: Users, color: 'text-blue-400' },
        { label: 'Volume (30D)', value: `₹${stats?.volume30d?.toLocaleString() || 0}`, sub: 'Total Revenue', icon: Wallet, color: 'text-green-400' },
        { label: 'Wingo Total', value: stats?.wingoBets || 0, sub: 'Total Bets', icon: Zap, color: 'text-yellow-400' },
        { label: 'Active Games', value: stats?.activeGames || 0, sub: 'Running Now', icon: TrendingUp, color: 'text-orange-400' },
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 text-primary text-[8px] font-black tracking-[0.5em] uppercase mb-4">
                    <div className="w-8 h-[2px] bg-primary animate-pulse" /> Live Status
                </div>
                <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                    Dashboard <span className="text-primary italic">/ Live</span>
                </h1>
                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-4 flex items-center gap-2">
                    Status: <span className="text-green-500">System Operational [Secure]</span>
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={kpi.label}
                            className="bg-surface border border-white/5 rounded-[40px] p-8 group hover:border-primary/40 transition-all duration-500"
                        >
                            <div className="w-12 h-12 rounded-[20px] bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500">
                                <Icon className={kpi.color} size={24} />
                            </div>
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase">{kpi.value}</h3>
                            <p className="text-[9px] text-primary/40 font-bold uppercase tracking-widest mt-2">{kpi.sub}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Matrix View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Project Velocity Chart (Mock Table) */}
                <div className="lg:col-span-2 bg-surface border border-white/5 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                     <h2 className="text-lg font-black italic uppercase tracking-widest mb-10 flex items-center gap-3">
                        <TrendingUp size={20} className="text-primary" /> Daily Transactions
                        <span className="ml-auto text-gray-700 text-[9px] font-black cursor-pointer hover:text-white transition uppercase tracking-widest flex items-center gap-2 underline underline-offset-4 decoration-primary/20">Full Report <ArrowUpRight size={14} /></span>
                    </h2>

                    <div className="space-y-6">
                        {(stats?.velocity || []).reverse().slice(0, 5).map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-[32px] bg-black/40 border border-white/5 group hover:border-primary/20 transition cursor-default">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 border-dashed flex flex-col items-center justify-center">
                                        <p className="text-[8px] font-black italic text-gray-500 uppercase leading-none">{log.date.split('-')[1]}</p>
                                        <p className="text-lg font-black italic text-white leading-none mt-1">{log.date.split('-')[2]}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black italic text-white uppercase italic">{log.date}</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                            {log.totalOrder.toLocaleString()} Orders Processed
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">₹{log.executed.toLocaleString()}</p>
                                    <p className="text-[8px] text-green-500 font-black uppercase tracking-[0.2em] mt-1 italic group-hover:animate-pulse transition">+ Active Gain</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Direct Overrides Section */}
                <div className="bg-surface border border-white/5 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <h2 className="text-[10px] font-black text-primary tracking-[0.4em] uppercase mb-10 border-b border-primary/20 pb-4 flex items-center gap-2 italic">
                        <ShieldCheck size={16} /> Fast Actions
                    </h2>

                    <div className="space-y-6">
                        <button onClick={() => router.push(`${masterPath}/users`)} className="w-full p-8 rounded-[40px] bg-white/5 border border-white/5 hover:border-primary transition group/btn text-left relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/btn:scale-125 transition duration-700">
                                <Users size={120} className="text-primary rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <Users size={24} className="text-primary mb-6" />
                                <h3 className="text-xs font-black italic uppercase italic mb-1 flex items-center justify-between">Update Balance <ArrowUpRight className="opacity-40 group-hover/btn:opacity-100 transition" size={16}/></h3>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Add or remove funds</p>
                            </div>
                        </button>

                        <button onClick={() => router.push(`${masterPath}/plans`)} className="w-full p-8 rounded-[40px] bg-white/5 border border-white/5 hover:border-indigo-500 transition group/btn text-left relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/btn:scale-125 transition duration-700">
                                <Crown size={120} className="text-indigo-500 rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <Crown size={24} className="text-indigo-500 mb-6" />
                                <h3 className="text-xs font-black italic uppercase italic mb-1 flex items-center justify-between">VIP Plans <ArrowUpRight className="opacity-40 group-hover/btn:opacity-100 transition" size={16}/></h3>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Manage VIP Pricing</p>
                            </div>
                        </button>

                        <button onClick={() => router.push(`${masterPath}/settings`)} className="w-full p-8 rounded-[40px] bg-white/5 border border-white/5 hover:border-red-500 transition group/btn text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/btn:scale-125 transition duration-700">
                                <Lock size={120} className="text-red-500 -rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <ShieldCheck size={24} className="text-gray-500 group-hover:text-red-500 transition" />
                                <h3 className="text-xs font-black italic uppercase italic mt-6 mb-1 flex items-center justify-between">Emergency Lock <ArrowUpRight className="opacity-40" size={16}/></h3>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Turn off system</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-12 p-6 rounded-[32px] bg-primary/5 border border-primary/10 flex items-center gap-4">
                        <Clock size={16} className="text-primary shrink-0" />
                        <p className="text-[10px] text-gray-600 font-black uppercase leading-relaxed italic">Last Status Update: <span className="text-white">Active Now</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

