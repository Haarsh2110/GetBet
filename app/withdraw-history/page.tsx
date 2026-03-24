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

// Static fallback data when API is not available
const FALLBACK: Transaction[] = [
    { _id: '1', amount: 15000, createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), method: 'USDT (TRC20)', status: 'rejected', reason: 'Network congestion timed out verification.' },
    { _id: '2', amount: 5000, createdAt: new Date(Date.now() - 86400000 * 16).toISOString(), method: 'UPI', status: 'approved', txnId: '#TX99283' },
    { _id: '3', amount: 8250, createdAt: new Date().toISOString(), method: 'BANK', status: 'pending' },
    { _id: '4', amount: 2000, createdAt: new Date(Date.now() - 86400000 * 18).toISOString(), method: 'PAYTM', status: 'approved', txnId: '#TX88123' },
    { _id: '5', amount: 50000, createdAt: new Date(Date.now() - 86400000 * 25).toISOString(), method: 'USDT (TRC20)', status: 'approved', txnId: '#TX77456' },
    { _id: '6', amount: 1500, createdAt: new Date(Date.now() - 86400000 * 29).toISOString(), method: 'UPI', status: 'rejected', reason: 'Invalid UPI ID provided.' },
];

const statusConfig: Record<Status, { icon: React.ReactNode; color: string; label: string }> = {
    approved: { color: '#22c55e', label: 'APPROVED', icon: <CheckCircle2 size={18} color="#22c55e" strokeWidth={2.5} /> },
    completed: { color: '#22c55e', label: 'COMPLETED', icon: <CheckCircle2 size={18} color="#22c55e" strokeWidth={2.5} /> },
    rejected: { color: '#ef4444', label: 'REJECTED', icon: <AlertCircle size={18} color="#ef4444" strokeWidth={2.5} /> },
    pending: { color: '#eab308', label: 'PENDING', icon: <Timer size={18} color="#eab308" strokeWidth={2} /> },
};

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function WithdrawHistory() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [fromDB, setFromDB] = useState(false);

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
                setFromDB(true);
            } else {
                // No real data yet — show fallback
                setTransactions(FALLBACK);
                setFromDB(false);
            }
        } catch {
            setTransactions(FALLBACK);
            setFromDB(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    return (
        <div className="flex flex-col h-[100dvh] bg-[#0A0A0A] relative overflow-hidden">
            {/* Header */}
            <header className="px-5 pt-10 pb-4 flex items-center justify-between relative z-10 shrink-0 border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition border border-white/10"
                >
                    <ArrowLeft size={18} className="text-white" />
                </button>
                <div className="text-center">
                    <h1 className="text-white text-lg font-black">Withdrawal History</h1>
                    {!fromDB && !loading && (
                        <p className="text-yellow-500/70 text-[9px] font-bold">Demo data — connect MongoDB to see real history</p>
                    )}
                </div>
                <button
                    onClick={fetchHistory}
                    className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition border border-white/10"
                >
                    <RefreshCw size={15} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {/* Transactions List */}
            <main className="flex-1 px-4 pb-[90px] overflow-y-auto no-scrollbar flex flex-col gap-3 pt-3">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[#111111] rounded-2xl border border-white/5 h-20 animate-pulse" />
                    ))
                ) : transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center pt-16">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                            <SlidersHorizontal size={24} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-bold text-sm">No withdrawals yet</p>
                        <p className="text-gray-700 text-xs">Your withdrawal history will appear here.</p>
                    </div>
                ) : (
                    transactions.map((txn, i) => {
                        const config = statusConfig[txn.status] ?? statusConfig.pending;
                        return (
                            <motion.div
                                key={txn._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden relative"
                            >
                                {/* Left accent bar */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                                    style={{ background: config.color }}
                                />

                                <div className="pl-5 pr-4 pt-4 pb-3 flex flex-col gap-2">
                                    {/* Top row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: config.color + '20' }}
                                            >
                                                {config.icon}
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-lg leading-tight">
                                                    ₹ {txn.amount.toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-gray-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                                                    {formatDate(txn.createdAt)}
                                                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                                    <span className="font-semibold">{txn.method}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <span
                                                className="text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider"
                                                style={{ background: config.color + '20', color: config.color }}
                                            >
                                                {config.label}
                                            </span>
                                            {txn.txnId && txn.status !== 'rejected' && (
                                                <span className="text-[10px] text-gray-500 font-mono">ID: {txn.txnId}</span>
                                            )}
                                            {txn.status === 'pending' && (
                                                <span className="text-[10px] text-gray-500">Processing...</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rejection reason + retry */}
                                    {txn.status === 'rejected' && (
                                        <>
                                            <div
                                                className="px-3 py-2 rounded-xl"
                                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                                            >
                                                <p className="text-red-400 text-[11px] font-semibold">
                                                    <span className="font-black">Reason: </span>
                                                    {txn.reason || 'Transaction verification failed.'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => router.push('/withdraw')}
                                                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black text-white text-xs uppercase tracking-wider active:scale-95 transition"
                                                style={{ background: '#ef4444' }}
                                            >
                                                <RotateCcw size={14} strokeWidth={2.5} />
                                                RETRY WITHDRAWAL
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
