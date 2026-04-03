'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
    ChevronLeft, 
    ShieldCheck, 
    Bell, 
    Wrench,
    Save,
    RotateCcw,
    Zap,
    Lock,
    HelpCircle,
    Loader2,
    Wallet
} from 'lucide-react';

export default function MasterSettings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // States for global config
    const [maintenance, setMaintenance] = useState(false);
    const [withdrawActive, setWithdrawActive] = useState(true);
    const [globalAlert, setGlobalAlert] = useState('');

    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/master/settings?t=${Date.now()}`);
            const data = await res.json();
            if (data.success && data.settings) {
                setMaintenance(data.settings.maintenanceMode);
                setWithdrawActive(data.settings.withdrawalActive);
                setGlobalAlert(data.settings.globalAlert || '');
            }
        } catch (err) {
            console.error('Master Config Sync Fail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/master/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maintenanceMode: maintenance,
                    withdrawalActive: withdrawActive,
                    globalAlert: globalAlert
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Settings saved successfully.');
            } else {
                alert('Failed to update system config.');
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-primary text-[10px] font-black tracking-widest uppercase">Loading Settings...</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-2">
                <div>
                     <button 
                        onClick={() => router.push('/master')}
                        className="hidden md:flex items-center gap-2 text-gray-400 hover:text-primary transition text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ChevronLeft size={14} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        System <span className="text-primary font-black italic">Settings</span>
                    </h1>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-4">Website Settings & Maintenance</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/80 text-black px-10 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-gold flex items-center gap-3 transition active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Security & Access Section */}
                <section className="bg-surface border border-white/5 rounded-[48px] p-8 md:p-14 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
                        <ShieldCheck size={180} className="text-primary rotate-12" />
                    </div>
                    
                    <h2 className="text-lg font-black italic uppercase tracking-widest mb-10 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(255,184,0,0.5)]" />
                        Safety & Access Control
                    </h2>

                    <div className="space-y-8 relative z-10">
                        {/* Maintenance Toggle */}
                        <div className="flex items-center justify-between p-7 rounded-[32px] bg-black/40 border border-white/5 transition hover:border-primary/20 group/item">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-inner ${maintenance ? 'bg-red-500 text-white shadow-xl animate-pulse' : 'bg-green-500/20 text-green-500'}`}>
                                    <Wrench size={24} />
                                </div>
                                <div>
                                    <p className={`font-black text-sm uppercase italic tracking-tight ${maintenance ? 'text-red-500' : 'text-white/80'}`}>Maintenance Mode</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Shuts down public app view</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setMaintenance(!maintenance)}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 ${maintenance ? 'bg-red-500 shadow-xl' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${maintenance ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Withdrawal Access */}
                        <div className="flex items-center justify-between p-7 rounded-[32px] bg-black/40 border border-white/5 transition hover:border-primary/20 group/item">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-inner ${withdrawActive ? 'bg-primary text-black shadow-gold' : 'bg-red-500/20 text-red-500'}`}>
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase italic tracking-tight">Withdrawal Service</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Toggle payouts globally</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setWithdrawActive(!withdrawActive)}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 ${withdrawActive ? 'bg-primary shadow-gold' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${withdrawActive ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>

                         {/* VIP Logic (Coming Soon) */}
                        <div className="flex items-center justify-between p-7 rounded-[32px] bg-black/40 border border-white/5 transition hover:border-primary/20 group/item opacity-50 grayscale select-none">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <Zap size={24} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase italic tracking-tight">Risk Aid Integration</p>
                                    <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest mt-0.5">Automated Risk Filter (BETA)</p>
                                </div>
                            </div>
                            <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Master Lvl. 2 Required</div>
                        </div>
                    </div>
                </section>

                {/* Communication Broadcast Section */}
                <section className="bg-surface border border-white/5 rounded-[48px] p-8 md:p-14 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-all duration-700">
                        <Bell size={180} className="text-white -rotate-12" />
                    </div>

                    <h2 className="text-lg font-black italic uppercase tracking-widest mb-10 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(255,184,0,0.5)]" />
                        Global Announcement
                    </h2>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-primary tracking-widest uppercase ml-6 flex items-center gap-2">
                                <Bell size={12} className="animate-pulse" /> Announcement Banner Text
                            </label>
                            <textarea 
                                value={globalAlert}
                                onChange={(e) => setGlobalAlert(e.target.value)}
                                placeholder="Enter system pulse message..."
                                className="w-full bg-black/40 border border-white/5 rounded-[32px] p-8 text-white placeholder:text-gray-700 outline-none focus:border-primary/30 focus:bg-black/80 transition-all text-base font-bold min-h-[160px] leading-relaxed italic"
                            />
                        </div>

                        <div className="p-7 rounded-[32px] bg-primary/5 border border-primary/10 flex items-start gap-4">
                            <HelpCircle size={20} className="text-primary mt-1 shrink-0" />
                            <p className="text-[10px] font-black text-gray-500 leading-relaxed uppercase tracking-widest italic">
                                Changing this string will propagate the update across the entire project infrastructure in real-time. Use it for urgent patches or rewards announcements.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

