'use client';

import { ArrowLeft, CheckCircle2, AlertCircle, Timer, SlidersHorizontal, RotateCcw, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Status = 'approved' | 'rejected' | 'pending' | 'completed';

interface Transaction {
    _id: string;
    amount: number;
    createdAt: string;
    method: string;
    status: Status;
    txnId?: string;
    reason?: string;
}

const statusConfig: Record<Status, { icon: React.ReactNode; color: string; label: string }> = {
    approved: { color: '#6366f1', label: 'APPROVED', icon: <CheckCircle2 size={18} className="text-indigo-400" strokeWidth={2.5} /> },
    completed: { color: '#6366f1', label: 'COMPLETED', icon: <CheckCircle2 size={18} className="text-indigo-400" strokeWidth={2.5} /> },
    rejected: { color: '#ef4444', label: 'REJECTED', icon: <AlertCircle size={18} className="text-red-400" strokeWidth={2.5} /> },
    pending: { color: '#94a3b8', label: 'PENDING', icon: <Timer size={18} className="text-slate-400" strokeWidth={2} /> },
};

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function WithdrawHistory() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) throw new Error('No user logged in');
            const user = JSON.parse(storedUser);

            const res = await fetch(`/api/transactions?type=withdraw&limit=30&userId=${user.id}`);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            if (data.transactions && data.transactions.length > 0) {
                setTransactions(data.transactions);
            } else {
                setTransactions([]);
            }
        } catch {
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    return (
        <div className="flex flex-col min-h-full bg-background text-white relative overflow-hidden shrink-0">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>

            {/* Header */}
            <header className="px-5 pt-10 pb-4 flex items-center justify-between relative z-10 shrink-0 border-b border-white/5 bg-background">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition border border-white/10"
                >
                    <ArrowLeft size={18} className="text-gray-400" />
                </button>
                <div className="text-center">
                    <h1 className="text-indigo-400 text-sm font-black tracking-[0.2em] uppercase">Transfer Logs</h1>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Terminal History Sync</p>
                </div>
                <button
                    onClick={fetchHistory}
                    className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition border border-white/10"
                >
                    <RefreshCw size={15} className={`text-primary ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {/* Transactions List */}
            <main className="flex-1 px-5 pb-[90px] overflow-y-auto no-scrollbar flex flex-col gap-4 pt-6 relative z-10">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-surface rounded-3xl border border-white/5 h-24 animate-pulse" />
                    ))
                ) : transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center pt-16">
                        <div className="w-16 h-16 rounded-[2rem] bg-surface border border-white/5 flex items-center justify-center shadow-gold">
                            <SlidersHorizontal size={24} className="text-primary/40" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-widest">No Records Found</p>
                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-2">Withdrawal history is currently empty</p>
                        </div>
                        <button onClick={() => router.push('/withdraw')} className="mt-4 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] active:scale-95 transition-all">
                            Initialize First Withdrawal
                        </button>
                    </div>
                ) : (
                    transactions.map((txn, i) => {
                        const config = statusConfig[txn.status] ?? statusConfig.pending;
                        return (
                            <motion.div
                                key={txn._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden relative shadow-sm"
                            >
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ background: config.color + '15' }}>
                                            {config.icon}
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-lg tracking-tighter italic leading-none">
                                                ₹ {txn.amount.toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                {formatDate(txn.createdAt)}
                                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                <span className="text-slate-400">{txn.method}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span
                                            className="text-[9px] font-black px-3 py-1.5 rounded-xl tracking-[0.1em] border"
                                            style={{ background: config.color + '10', color: config.color, borderColor: config.color + '30' }}
                                        >
                                            {config.label}
                                        </span>
                                    </div>
                                </div>

                                {txn.status === 'rejected' && (
                                    <div className="mx-5 mb-4 p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                                        <p className="text-red-400/80 text-[9px] font-black leading-relaxed uppercase tracking-widest">
                                            Error Code: {txn.reason || 'Terminal verification sync failure'}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
