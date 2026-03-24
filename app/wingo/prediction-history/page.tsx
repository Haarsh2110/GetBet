'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

export default function PredictionHistoryPage() {
    const router = useRouter();
    const { wallet } = useWallet();
    const userId = wallet?.userId;
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/games/wingo/my-predictions?userId=${userId}`, { cache: 'no-store' });
                const json = await res.json();
                if (json.success) {
                    setHistory(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch prediction history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userId]);

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-[100px]">
            {/* Header */}
            <header className="sticky top-0 pt-10 pb-4 px-5 bg-[#0A0A0A]/95 backdrop-blur-xl z-50 border-b border-white/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#f97316]/10 via-[#0A0A0A] to-[#0A0A0A] z-0"></div>

                <div className="relative z-10 flex items-center mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 text-center pr-8">
                        <h1 className="text-lg font-black text-white tracking-[0.15em] uppercase drop-shadow-[0_2px_10px_rgba(249,115,22,0.3)]">
                            PREDICTION HISTORY
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 relative z-20 pt-6 flex flex-col gap-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#facc15]" size={36} />
                    </div>
                ) : history.length > 0 ? (
                    history.map((item, idx) => (
                        <div key={idx} className="bg-[#111111] rounded-2xl p-4 border border-white/5 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#facc15]/5 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                            
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#facc15] font-black text-xs tracking-widest uppercase">
                                    PERIOD: {item.period}
                                </span>
                                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">
                                    {new Date(item.createdAt).toLocaleString('en-IN', { hour12: false })}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                <div className="flex flex-col gap-1 items-start">
                                    <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">Prediction</span>
                                    <span className={`text-sm font-black tracking-widest ${item.prediction === 'BIG' ? 'text-[#eab308]' : 'text-[#3b82f6]'}`}>
                                        {item.prediction}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 items-center border-x border-white/10 px-2">
                                    <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">Amount</span>
                                    <span className="text-sm text-white font-bold">₹{item.amount}</span>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">Result</span>
                                    {item.status === 'DECLARED' ? (
                                        <span className={`text-sm font-black tracking-widest uppercase ${item.won ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                            {item.won ? '+₹' + (item.amount * 1.96).toFixed(0) : 'LOSS'}
                                        </span>
                                    ) : (
                                        <span className="text-sm font-black text-white/50 uppercase tracking-widest">
                                            WAITING
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-white/30 text-xs font-black uppercase tracking-widest">
                        No prediction history found
                    </div>
                )}
            </main>
        </div>
    );
}
