'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';

export default function PredictionHistoryDetailPage() {
    const router = useRouter();
    const params = useParams();
    const dateParam = params.date as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dateParam) return;

        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/games/wingo/history/${dateParam}`, { cache: 'no-store' });
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch daily history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [dateParam]);

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
                            <div className="bg-surface border border-white/10 px-6 py-2 rounded-full font-black text-sm tracking-widest text-[#f97316]">
                                TOTAL TURNOVER {data.totalTurnover}
                            </div>
                            <div className="bg-surface border border-white/10 px-6 py-2 rounded-xl font-black text-sm tracking-widest text-white/80">
                                TOTAL SESSION - {data.totalSession}
                            </div>
                        </div>

                        {/* Detail List */}
                        <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden shrink-0 min-h-[400px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>

                            <div className="grid grid-cols-3 gap-2 border-b border-[#ef4444]/30 pb-3 mb-4 text-xs font-black tracking-widest text-[#ef4444] text-center">
                                <div className="text-left">SESSION NO.</div>
                                <div>TURNOVER</div>
                                <div></div>
                            </div>

                            <div className="space-y-4">
                                {data.sessions.map((session: any) => (
                                    <div
                                        key={session.id}
                                        onClick={() => router.push(`/wingo/prediction-history/${dateParam}/${session.id}`)}
                                        className="grid grid-cols-3 gap-2 items-center text-center font-bold text-white hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
                                    >
                                        <div className="text-left font-mono text-lg">
                                            {session.index} {/* Displaying sequential 7, 6, 5 based on screenshot */}
                                        </div>
                                        <div className="text-lg">
                                            {session.turnover}
                                        </div>
                                        <div className="flex justify-end items-center text-right pr-2">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] text-[#f97316]/70 uppercase tracking-widest group-hover:text-[#f97316] transition-colors">
                                                    Click to<br />open
                                                </span>
                                            </div>
                                            <ArrowRight size={14} className="text-[#f97316] ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full relative overflow-hidden py-4 rounded-full bg-surface border border-white/10 shadow-lg transition-transform active:scale-95 group flex items-center justify-center">
                            <span className="relative z-10 text-white font-black text-xs tracking-[0.2em] uppercase transition-colors">
                                NO MORE HISTORY
                            </span>
                        </button>
                    </>
                )}
            </main>
        </div>
    );
}
