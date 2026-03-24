'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function PredictionHistoryUserListPage() {
    const router = useRouter();
    const params = useParams();
    const dateParam = params.date as string;
    const sessionId = params.sessionId as string;
    const periodNumber = params.period as string;
    const prediction = params.prediction as string; // 'small' or 'big'

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dateParam || !sessionId || !periodNumber || !prediction) return;

        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/games/wingo/history/${dateParam}/${sessionId}/${periodNumber}/${prediction}`, { cache: 'no-store' });
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch specific user list:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [dateParam, sessionId, periodNumber, prediction]);

    const isSmall = data?.prediction === 'SMALL';
    const accentColor = isSmall ? 'text-[#16a34a]' : 'text-[#dc2626]';
    const borderAccent = isSmall ? 'border-[#16a34a]/30' : 'border-[#dc2626]/30';

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

            <main className="flex-1 px-5 relative z-20 pt-6 flex flex-col gap-6">

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#f97316] w-10 h-10" />
                    </div>
                ) : !data ? (
                    <div className="text-center py-20 text-white/50 font-medium">Failed to load data.</div>
                ) : (
                    <>
                        {/* Summary Header matching screenshot */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-[#f97316] text-white px-6 py-2 rounded-xl font-black text-lg tracking-widest shadow-[0_5px_15px_rgba(249,115,22,0.3)] border border-[#f97316]/50">
                                DATE : {data.date}
                            </div>
                            <div className="w-full bg-surface border border-white/10 px-4 py-3 rounded-full flex justify-center text-center font-black tracking-widest shadow-lg">
                                <span className="text-white/90">PERIOD NUMBER - <span className="text-white">{data.periodNumber}</span></span>
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col gap-3 px-2">
                            <div className="flex justify-between items-center bg-[#111111] p-3 rounded-xl border border-white/5">
                                <span className="text-white font-black uppercase tracking-widest text-lg">Prediction</span>
                                <span className={`${accentColor} font-black text-2xl tracking-widest`}>{data.prediction}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#111111] p-3 rounded-xl border border-white/5">
                                <span className="text-white font-black uppercase tracking-widest text-lg">Volume</span>
                                <span className="text-white font-black text-xl tracking-wider">{data.totalVolume}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#111111] p-3 rounded-xl border border-white/5">
                                <span className="text-white font-black uppercase tracking-widest text-lg">User Count</span>
                                <span className="text-white font-black text-xl tracking-wider">{data.userCount}</span>
                            </div>
                        </div>

                        {/* User Detail List */}
                        <div className={`bg-[#111111] border ${borderAccent} rounded-3xl p-5 shadow-2xl relative overflow-hidden shrink-0 min-h-[400px]`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>

                            <div className="space-y-3 relative z-10">
                                {data.users && data.users.length > 0 ? data.users.map((user: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 text-center border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-2 rounded-xl transition-colors">
                                        {/* Row Number */}
                                        <div className="text-[#ef4444] font-black text-lg w-6 text-left">
                                            {idx + 1}
                                        </div>

                                        {/* User ID Box */}
                                        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-1 flex-1 text-left flex gap-1 items-center">
                                            <span className="text-white/50 text-[10px] font-black tracking-widest uppercase">User</span>
                                            <span className="text-white font-mono tracking-widest">{user.userId}</span>
                                        </div>

                                        {/* Volume Amount */}
                                        <div className="text-white font-black text-lg min-w-[60px] text-right pr-2">
                                            {user.volume}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center text-white/30 text-xs font-black uppercase tracking-widest">
                                        No users found.
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="w-full relative overflow-hidden py-4 rounded-full bg-surface border border-white/10 shadow-lg transition-transform active:scale-95 group flex items-center justify-center">
                            <span className="relative z-10 text-[#ef4444]/80 font-black text-xs tracking-[0.2em] uppercase transition-colors">
                                All history
                            </span>
                        </button>
                    </>
                )}
            </main>
        </div>
    );
}
