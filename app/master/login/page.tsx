'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';

export default function MasterLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/master/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/master');
            } else {
                setError(data.message || 'Access Denied');
            }
        } catch (err) {
            setError('System Error. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080511] flex items-center justify-center p-5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header/Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 mb-4 shadow-gold">
                        <Lock className="text-primary" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">
                        GET<span className="text-primary">BET</span>
                    </h1>
                    <p className="text-gray-500 text-[10px] font-black tracking-[0.2em] uppercase mt-1">Master Management Console</p>
                </div>

                {/* Login Card */}
                <div className="bg-[#120C1F] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck size={120} className="text-white" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary tracking-widest uppercase ml-4">Authorized Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter Master Email"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 outline-none focus:border-primary/50 transition-all text-sm font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary tracking-widest uppercase ml-4">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 outline-none focus:border-primary/50 transition-all text-sm font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-[11px] font-black text-center uppercase tracking-wider"
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Login Button */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-light text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-gold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Initiate Session</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Link back to Ops Admin */}
                <div className="mt-8 text-center flex flex-col gap-4">
                    <p className="text-gray-600 text-[10px] font-black tracking-widest uppercase">Strict Authorized Access Only</p>
                    <a 
                        href="/admin" 
                        className="inline-flex items-center justify-center gap-2 text-primary/40 hover:text-primary transition-colors text-[9px] font-black uppercase tracking-widest group"
                    >
                        <Gamepad2 size={12} className="group-hover:rotate-12 transition-transform" />
                        Return to Operations Admin
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
