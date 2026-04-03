'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Home, LayoutDashboard, User } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

const apps = [
    { id: 'wingo', name: 'WinGo', color: 'from-indigo-600 to-indigo-800', icon: '/wingo.png' },
    { id: 'aviator', name: 'Aviator', color: 'from-surface to-surface-hover', icon: '/aviator.png' },
    { id: 'limbo', name: 'Limbo', color: 'from-surface to-surface-hover', icon: '/limbo.png' },
];

export default function AdminHome() {
    const adminPath = APP_CONFIG.admin.path;
    const [data, setData] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalVolume: 0,
        completedVolume: 0,
        pendingVolume: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await fetch('/api/admin/orders');
                const json = await res.json();
                if (json.success && json.summary) {
                    const s = json.summary;
                    setData({
                        totalOrders: s.totalOrders ?? 0,
                        completedOrders: s.completedOrders ?? 0,
                        pendingOrders: s.pendingOrders ?? 0,
                        totalVolume: s.totalVolume ?? 0,
                        completedVolume: s.completedVolume ?? 0,
                        pendingVolume: s.pendingVolume ?? 0,
                    });
                }
            } catch (err) {
                console.error('Failed to fetch overview:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Dark Golden Header */}
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <div className="flex items-center gap-3">
                    <span className="text-white font-black text-2xl tracking-widest italic">GET<span className="text-primary">BET</span></span>
                </div>
                <span className="text-primary text-[10px] font-black tracking-widest uppercase mt-1">ADMIN DASHBOARD</span>
            </div>

            <div className="px-6 pt-8 space-y-10">
                {/* Betting Apps Section */}
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                        <h2 className="font-display font-black text-white text-lg tracking-[0.2em] uppercase">Game Collection</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {apps.map((app) => {
                            const isWingo = app.id === 'wingo';

                            if (!isWingo) {
                                return (
                                    <div
                                        key={app.id}
                                        className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center p-3 cursor-not-allowed bg-surface/20 border border-white/5 grayscale group"
                                    >
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md mb-2 border border-white/5 shadow-inner">
                                            <GameIcon name={app.id} />
                                        </div>
                                        <span className="font-black tracking-[0.2em] text-[10px] text-white/40 uppercase">{app.name}</span>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <div className="px-3 py-1 border border-white/20 rounded-full">
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Later</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={app.id}
                                    href={`${adminPath}/wingo`}
                                    className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center p-3 cursor-pointer bg-surface border border-white/10 shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:border-primary/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 active:scale-95 group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md mb-2 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform">
                                        <GameIcon name={app.id} />
                                    </div>
                                    <span className="font-black tracking-[0.2em] text-[10px] text-white uppercase group-hover:text-primary transition-colors">{app.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Orders Summary */}
                <div className="space-y-6">
                        <h2 className="font-display font-black text-white text-lg tracking-[0.2em] uppercase flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                        Platform Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Summary Card 1 */}
                        <div className="bg-surface/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-2xl space-y-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                            <div className="space-y-4 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Total Bets</p>
                                    <h3 className="text-3xl font-black text-white tracking-tighter">{loading ? '...' : data.totalOrders}</h3>
                                </div>
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-white/30 uppercase">Finished</span>
                                        <span className="text-green-500">{data.completedOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-white/30 uppercase">Pending</span>
                                        <span className="text-orange-500">{data.pendingOrders}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Card 2 */}
                        <div className="bg-surface/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-2xl space-y-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                            <div className="space-y-4 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Total Bet Amount</p>
                                    <h3 className="text-3xl font-black text-white tracking-tighter">₹{loading ? '...' : data.totalVolume.toLocaleString()}</h3>
                                </div>
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-indigo-400/30 uppercase">Finished</span>
                                        <span className="text-white">₹{data.completedVolume.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-indigo-400/30 uppercase">Pending</span>
                                        <span className="text-indigo-400">₹{data.pendingVolume.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Node */}
                    <div className="flex justify-center mt-6">
                        <Link
                            href={`${adminPath}/orders`}
                            className="group flex items-center gap-3 bg-white text-black py-4 px-10 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 transition-all"
                        >
                            View All Bets
                            <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GameIcon({ name }: { name: string }) {
    if (name === 'wingo') {
        return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="10" cy="16" r="8" fill="#FFD700" stroke="#FFA500" strokeWidth="1.5" />
                <circle cx="10" cy="16" r="4" fill="#FFA500" />
                <circle cx="22" cy="16" r="8" fill="#00CC44" stroke="#009933" strokeWidth="1.5" />
                <circle cx="22" cy="16" r="4" fill="#009933" />
                <circle cx="10" cy="10" r="3" fill="#40E0D0" />
            </svg>
        );
    }
    if (name === 'aviator') {
        return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 16 L16 8 L28 12 L22 16 L28 20 L16 24 Z" fill="white" fillOpacity="0.6" />
                <circle cx="16" cy="16" r="3" fill="white" />
            </svg>
        );
    }
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5">
            <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2" />
            <path d="M16 6 L22 16 L16 26 L10 16 Z" fill="white" fillOpacity="0.6" />
        </svg>
    );
}
