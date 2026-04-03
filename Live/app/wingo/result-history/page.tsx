'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

export default function ResultHistoryPage() {
    const router = useRouter();
    const { wallet } = useWallet();
    const userId = wallet?.userId;
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/games/wingo/my-results?userId=${userId}`, { cache: 'no-store' });
                const json = await res.json();
                if (json.success) {
                    setResults(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch result history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [userId]);

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-[100px]">
            {/* Header */}
            <header className="sticky top-0 pt-10 pb-4 px-5 bg-[#0A0A0A]/95 backdrop-blur-xl z-50 border-b border-white/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#facc15]/10 via-[#0A0A0A] to-[#0A0A0A] z-0"></div>

                <div className="relative z-10 flex items-center mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 text-center pr-8">
                        <h1 className="text-lg font-black text-white tracking-[0.15em] uppercase drop-shadow-[0_2px_10px_rgba(250,204,21,0.3)]">
                            RESULT HISTORY
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 relative z-20 pt-6 flex flex-col gap-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#facc15]" size={36} />
                    </div>
                ) : results.length > 0 ? (
                    results.map((item, idx) => (
                        <div key={idx} className="bg-[#111111] rounded-2xl p-5 border border-white/5 shadow-lg relative overflow-hidden flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">
                                    PERIOD NUMBER
                                </span>
                                <span className="text-white font-mono text-xl tracking-widest">
                                    {item.period}
                                </span>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">
                                    ACTUAL RESULT
                                </span>
                                <div className="flex items-center gap-2">
                                    {/* Color Indicator */}
                                    <div className={`w-3 h-3 rounded-full shadow-lg ${item.isRed ? 'bg-[#ef4444] shadow-[#ef4444]/50' : 'bg-[#22c55e] shadow-[#22c55e]/50'}`}></div>
                                    <span className={`text-lg font-black tracking-widest uppercase ${item.result === 'BIG' ? 'text-[#eab308]' : 'text-[#3b82f6]'}`}>
                                        {item.result}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-white/30 text-xs font-black uppercase tracking-widest">
                        No result history found
                    </div>
                )}
            </main>
        </div>
    );
}
