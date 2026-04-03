'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                router.push(APP_CONFIG.admin.path);
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background bg-[url('/bg-pattern.svg')] bg-cover relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md"></div>

            <div className="relative z-10 w-full max-w-md mx-auto p-8 bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-block p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2 italic tracking-tighter uppercase">Admin <span className="text-primary italic">Gateway</span></h1>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Secure terminal access required to continue.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Admin Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Security Key"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-14 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-2"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-gold"
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" size={20} /> SYNCING...</>
                        ) : (
                            'Access System'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-white/30 relative z-10">
                    <p>Protected by Advanced Encryption</p>
                    <p className="mt-1">Unauthorized access is strictly prohibited and monitored.</p>
                </div>
            </div>
        </div>
    );
}
