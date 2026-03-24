'use client';

import { Save, ShieldCheck, Mail, Globe, BellRing } from 'lucide-react';

export default function GeneralSettings() {
    return (
        <div className="min-h-screen bg-background text-white pb-20">
            {/* Dark Golden Header */}
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <h1 className="text-white font-black text-xl tracking-widest uppercase">SYSTEM SETTINGS</h1>
                <p className="text-xs text-white/50 mt-2 font-black tracking-widest uppercase text-center">Platform Dynamics</p>
            </div>

            <div className="px-6 mt-8 space-y-6">
                <button className="w-full bg-gradient-to-r from-primary to-primary-muted text-black font-black text-[11px] px-8 py-4 rounded-xl shadow-glow tracking-widest uppercase active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <Save size={16} /> SAVE ALL CHANGES
                </button>

                {/* Global Limits */}
                <div className="bg-surface border border-primary/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full"></div>
                    
                    <h3 className="text-primary font-black text-[12px] tracking-widest uppercase mb-6 flex items-center gap-3 border-b border-primary/20 pb-4">
                        <ShieldCheck size={18} /> FINANCIAL LIMITS
                    </h3>
                    
                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2">Minimum Deposit (₹)</label>
                            <input type="number" defaultValue="100" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2">Minimum Withdrawal (₹)</label>
                            <input type="number" defaultValue="500" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2">Max Daily Liability (₹)</label>
                            <input type="number" defaultValue="1000000" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner" />
                        </div>
                    </div>
                </div>

                {/* Game Configurations */}
                <div className="bg-surface border border-primary/20 rounded-2xl p-6 shadow-lg mb-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full"></div>

                    <h3 className="text-primary font-black text-[12px] tracking-widest uppercase mb-6 flex items-center gap-3 border-b border-primary/20 pb-4">
                        <Globe size={18} /> GAME OPERATIONS
                    </h3>
                    
                    <div className="space-y-5 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-white/5 shadow-inner">
                            <div className="pr-4">
                                <div className="font-black text-[11px] text-white uppercase tracking-widest mb-1">Win Go Maintenance</div>
                                <div className="text-[9px] text-white/40 tracking-wider">Disable betting for 1M</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-red shadow-inner"></div>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-white/5 shadow-inner">
                            <div className="pr-4">
                                <div className="font-black text-[11px] text-white uppercase tracking-widest mb-1">Auto-Settlement</div>
                                <div className="text-[9px] text-white/40 tracking-wider">Settle without override</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-green shadow-inner"></div>
                            </label>
                        </div>
                        
                        <div className="pt-2">
                            <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2">Platform Tax (%)</label>
                            <input type="number" defaultValue="2.5" step="0.1" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
