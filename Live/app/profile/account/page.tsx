'use client';

import { ChevronLeft, User, Phone, Mail, IdCard, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { userService, UserProfile } from '@/services/userService';

export default function AccountDetails() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Bank Details State
    const [bankData, setBankData] = useState({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
    });
    const [password, setPassword] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        async function fetchProfile() {
            const data = await userService.getProfile();
            if (data) {
                setProfile(data);
                if (data.bankDetails) {
                    setBankData({
                        accountHolderName: data.bankDetails.accountHolderName || '',
                        bankName: data.bankDetails.bankName || '',
                        accountNumber: data.bankDetails.accountNumber || '',
                        ifscCode: data.bankDetails.ifscCode || '',
                        upiId: data.bankDetails.upiId || ''
                    });
                }
            }
            setLoading(false);
        }
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!password) return setMessage({ text: 'Password required', type: 'error' });
        
        setSaving(true);
        const res = await userService.updateBank(bankData, password);
        setSaving(false);
        setPassword('');
        setShowConfirm(false);

        if (res.success) {
            setMessage({ text: 'Bank details updated securely!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } else {
            setMessage({ text: res.error || 'Update failed', type: 'error' });
        }
    };

    if (loading) return null;

    const details = [
        { label: "USER ID", value: profile?.id || 'N/A', icon: IdCard },
        { label: "PHONE NUMBER", value: `+91 ${profile?.phone}` || 'N/A', icon: Phone },
        { label: "MEMBERSHIP", value: profile?.vipPlan?.toUpperCase() || 'FREE', icon: ShieldCheck },
    ];

    return (
        <div className="flex flex-col min-min-h-full bg-background text-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>

            <header className="relative z-10 pt-10 pb-4 px-5 flex items-center gap-4 shrink-0 border-b border-white/5 bg-background">
                <button onClick={() => router.back()} className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition shadow-sm">
                    <ChevronLeft size={22} className="text-gray-400" />
                </button>
                <h1 className="text-lg font-black tracking-[0.2em] uppercase text-indigo-400">Account Control</h1>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
                
                {/* Fixed Stats Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {details.map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-surface border border-white/5 rounded-[2rem] p-4 flex items-center gap-4 shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <item.icon size={18} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                                <p className="text-white text-sm font-bold tracking-wide">{item.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bank Details Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <ShieldCheck size={18} className="text-indigo-400" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Withdrawal Accounts</h2>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-[2.5rem] p-6 space-y-5 shadow-gold">
                        <div className="space-y-4">
                            {[
                                { id: 'accountHolderName', label: 'Account Holder Name', placeholder: 'Enter full name', type: 'text' },
                                { id: 'bankName', label: 'Bank Name', placeholder: 'e.g. HDFC Bank', type: 'text' },
                                { id: 'accountNumber', label: 'Account Number', placeholder: '0000 0000 0000 0000', type: 'password' },
                                { id: 'ifscCode', label: 'IFSC Code', placeholder: 'SBIN000XXXX', type: 'text' },
                                { id: 'upiId', label: 'UPI ID', placeholder: 'name@upi', type: 'text' }
                            ].map((f) => (
                                <div key={f.id} className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{f.label}</label>
                                    <input 
                                        type={f.type}
                                        value={(bankData as any)[f.id]}
                                        onChange={(e) => setBankData({ ...bankData, [f.id]: e.target.value })}
                                        placeholder={f.placeholder}
                                        className="w-full bg-background border border-white/5 rounded-2xl py-3.5 px-5 text-sm text-white placeholder-slate-700 outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowConfirm(true)}
                            className="w-full py-4 rounded-3xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-gold active:scale-95 transition-all mt-4"
                        >
                            Authorize & Save Details
                        </button>
                    </div>
                </motion.div>

                {message.text && (
                    <p className={`text-center text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'text-accent-green' : 'text-red-400'} animate-bounce`}>
                        {message.text}
                    </p>
                )}
            </main>

            {/* Confirm Password Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-[340px] bg-surface border border-primary/20 rounded-[2.5rem] p-8 shadow-gold">
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Security Auth</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-6">
                            Enter your login password to authorize bank detail changes.
                        </p>
                        
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Terminal Password"
                            className="w-full bg-background border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-primary/50 mb-6"
                        />

                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Cancel</button>
                            <button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="flex-[2] py-4 bg-primary rounded-2xl text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                {saving ? 'Auth...' : 'Verify & Save'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
