'use client';

import { useState, useEffect } from 'react';
import { Save, ShieldCheck, Globe, Loader2 } from 'lucide-react';
import Toast from '@/components/Toast';

export default function GeneralSettings() {
    // Game Specific (WinGo)
    const [wingoMaintenance, setWingoMaintenance] = useState(false);
    
    // Global Financial Limits
    const [minDeposit, setMinDeposit] = useState(100);
    const [minWithdrawal, setMinWithdrawal] = useState(500);
    const [maxLiability, setMaxLiability] = useState(1000000);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchAllSettings();
    }, []);

    const fetchAllSettings = async () => {
        try {
            // Fetch WinGo Specific Settings
            const wingoRes = await fetch('/api/admin/wingo/settings', { cache: 'no-store' });
            const wingoData = await wingoRes.json();
            if (wingoData.success && wingoData.settings) {
                setWingoMaintenance(wingoData.settings.maintenanceMode);
            }

            // Fetch Global System Settings
            const sysRes = await fetch('/api/admin/settings', { cache: 'no-store' });
            const sysData = await sysRes.json();
            if (sysData.success && sysData.settings) {
                setMinDeposit(sysData.settings.minDeposit);
                setMinWithdrawal(sysData.settings.minWithdrawal);
                setMaxLiability(sysData.settings.maxDailyLiability);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save WinGo Specific Settings
            const p1 = fetch('/api/admin/wingo/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maintenanceMode: wingoMaintenance })
            });

            // Save Global System Settings
            const p2 = fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    minDeposit: Number(minDeposit), 
                    minWithdrawal: Number(minWithdrawal), 
                    maxDailyLiability: Number(maxLiability) 
                })
            });

            const [r1, r2] = await Promise.all([p1, p2]);
            const d1 = await r1.json();
            const d2 = await r2.json();

            if (d1.success && d2.success) {
                setToast({ show: true, message: 'Settings saved successfully.', type: 'success' });
            } else {
                setToast({ show: true, message: 'Failed to save settings.', type: 'error' });
            }
        } catch (err) {
            console.error('Update failed:', err);
            setToast({ show: true, message: 'Something went wrong. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white pb-20">
            <Toast 
                show={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, show: false })} 
            />

            {/* Dark Golden Header */}
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <h1 className="text-white font-black text-xl tracking-widest uppercase">SYSTEM SETTINGS</h1>
                <p className="text-xs text-white/50 mt-2 font-black tracking-widest uppercase text-center">Manage Limits & Games</p>
            </div>

            <div className="px-6 mt-8 space-y-6">
                <button 
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="w-full bg-gradient-to-r from-primary to-primary-muted text-black font-black text-[11px] px-8 py-4 rounded-xl shadow-glow tracking-widest uppercase active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                    SAVE ALL CHANGES
                </button>

                {/* Global Limits */}
                <div className="bg-surface border border-primary/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full"></div>

                    <h3 className="text-primary font-black text-[12px] tracking-widest uppercase mb-6 flex items-center gap-3 border-b border-primary/20 pb-4">
                        <ShieldCheck size={18} /> FINANCIAL LIMITS
                    </h3>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2 italic">Minimum Deposit (₹)</label>
                            <input 
                                type="number" 
                                value={minDeposit} 
                                onChange={(e) => setMinDeposit(Number(e.target.value))}
                                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner font-mono" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2 italic">Minimum Withdrawal (₹)</label>
                            <input 
                                type="number" 
                                value={minWithdrawal} 
                                onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner font-mono" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2 italic">Max Daily Liability (₹)</label>
                            <input 
                                type="number" 
                                value={maxLiability} 
                                onChange={(e) => setMaxLiability(Number(e.target.value))}
                                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner font-mono" 
                            />
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
                                <div className="font-black text-[11px] text-white uppercase tracking-widest mb-1 italic">Win Go Maintenance</div>
                                <div className="text-[9px] text-white/40 tracking-wider uppercase font-bold">Disable betting terminal</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={wingoMaintenance}
                                    onChange={(e) => setWingoMaintenance(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-red shadow-inner"></div>
                            </label>
                        </div>

                        <div className="pt-2">
                             <label className="block text-[10px] text-white/50 font-black uppercase tracking-widest mb-2 italic">Platform Tax (%)</label>
                             <input type="number" defaultValue="2.5" step="0.1" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold tracking-wider outline-none focus:border-primary/50 transition-colors shadow-inner font-mono" />
                         </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
