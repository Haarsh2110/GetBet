'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2 } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
                setError(data.error || 'Failed to login');
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
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Gateway</h1>
                    <p className="text-white/50 text-sm">Secure access required to continue.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                    {error && (
                        <div className="p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm rounded-lg text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                            <input
                                type="text"
                                placeholder="Admin Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                            <input
                                type="password"
                                placeholder="Security Key"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" size={20} /> Authenticating...</>
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
