'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Home, LayoutDashboard, User } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

const apps = [
    { id: 'wingo', name: 'WIN GO', color: 'from-[#e8701a] to-[#d35b0d]', icon: '/wingo.png' },
    { id: 'aviator', name: 'AVIATOR', color: 'from-[#b9153a] to-[#8f0f2a]', icon: '/aviator.png' },
    { id: 'limbo', name: 'LIMBO', color: 'from-[#23388e] to-[#152361]', icon: '/limbo.png' },
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
                <span className="text-primary text-[10px] font-black tracking-widest uppercase mt-1">ADMIN PARTNER</span>
            </div>

            <div className="px-6 pt-8 space-y-10">
                {/* Betting Apps Section */}
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-1 h-5 bg-primary rounded-full shadow-gold"></div>
                        <h2 className="font-black text-white text-base tracking-widest uppercase">BETTING APPS</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {apps.map((app) => {
                            const isWingo = app.id === 'wingo';

                            if (!isWingo) {
                                return (
                                    <div
                                        key={app.id}
                                        className={`
                                            relative overflow-hidden rounded-xl aspect-square flex flex-col items-center justify-center p-3 cursor-not-allowed opacity-50 grayscale-[50%]
                                            bg-gradient-to-br ${app.color} shadow-lg border border-white/5
                                        `}
                                        title="Coming Soon"
                                    >
                                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-2 shadow-inner">
                                            <GameIcon name={app.id} />
                                        </div>
                                        <span className="font-black tracking-widest text-[11px] text-white shadow-sm">{app.name}</span>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Later</span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={app.id}
                                    href={`${adminPath}/wingo`}
                                    className={`
                                        relative overflow-hidden rounded-xl aspect-square flex flex-col items-center justify-center p-3 cursor-pointer
                                        bg-gradient-to-br ${app.color} shadow-lg active:scale-95 transition-transform duration-200 border border-white/10
                                    `}
                                >
                                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-2 shadow-inner">
                                        <GameIcon name={app.id} />
                                    </div>
                                    <span className="font-black tracking-widest text-[11px] text-white shadow-sm">{app.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Orders Summary */}
                <div>
                    <h2 className="font-black text-white text-lg tracking-widest uppercase mb-6 flex items-center gap-3">
                        <div className="w-1 h-5 bg-primary rounded-full shadow-gold"></div>
                        ORDERS SUMMARY
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Left Card - Counts */}
                        <div className="bg-surface rounded-2xl shadow-lg shadow-black/50 border border-primary/20 p-5 space-y-4">
                            <div>
                                <div className="bg-primary/10 text-primary border border-primary/30 text-center text-[10px] font-black tracking-widest py-1.5 px-3 rounded mb-2 uppercase">
                                    Total Order
                                </div>
                                <div className="text-center text-white font-black text-2xl">{loading ? '...' : data.totalOrders}</div>
                            </div>
                            <div>
                                <div className="bg-primary/10 text-primary border border-primary/30 text-center text-[10px] font-black tracking-widest py-1.5 px-3 rounded mb-2 uppercase">
                                    Completed
                                </div>
                                <div className="text-center text-white font-black text-2xl">{loading ? '...' : data.completedOrders}</div>
                            </div>
                            <div>
                                <div className="bg-primary/10 text-primary border border-primary/30 text-center text-[10px] font-black tracking-widest py-1.5 px-3 rounded mb-2 uppercase">
                                    Pending
                                </div>
                                <div className="text-center text-white font-black text-2xl">{loading ? '...' : data.pendingOrders}</div>
                            </div>
                        </div>

                        {/* Right Card - Volume */}
                        <div className="bg-surface rounded-2xl shadow-lg shadow-black/50 border border-primary/20 p-5 space-y-4">
                            <div>
                                <div className="bg-primary/10 text-primary border border-primary/30 text-center text-[10px] font-black tracking-widest py-1.5 px-3 rounded mb-2 uppercase">
                                    Total Volume
                                </div>
                                <div className="text-center text-white font-black text-2xl">{loading ? '...' : data.totalVolume.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="bg-primary/10 text-primary border border-primary/30 text-center text-[10px] font-black tracking-widest py-1.5 px-3 rounded mb-2 uppercase">
                                    Completed
                                </div>
                                <div className="text-center text-white font-black text-2xl">{loading ? '...' : data.completedVolume.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="bg-primary/10 text-primary border border-primary/30 text-center text-[10px] font-black tracking-widest py-1.5 px-3 rounded mb-2 uppercase">
                                    Pending
                                </div>
                                <div className="text-center text-white font-black text-2xl">{loading ? '...' : data.pendingVolume.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Arrow to Orders */}
                    <div className="flex justify-center mt-6">
                        <Link
                            href={`${adminPath}/orders`}
                            className="w-14 h-14 bg-gradient-to-r from-primary to-primary-muted rounded-full flex items-center justify-center shadow-gold hover:scale-105 transition-transform active:scale-95"
                        >
                            <ArrowRight size={24} className="text-black" />
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
