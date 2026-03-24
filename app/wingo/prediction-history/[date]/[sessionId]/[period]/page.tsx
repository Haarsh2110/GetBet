'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';

export default function PredictionHistoryExactPeriodPage() {
    const router = useRouter();
    const params = useParams();
    const dateParam = params.date as string;
    const sessionId = params.sessionId as string;
    const periodNumber = params.period as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dateParam || !sessionId || !periodNumber) return;

        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/games/wingo/history/${dateParam}/${sessionId}/${periodNumber}`, { cache: 'no-store' });
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch specific period history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [dateParam, sessionId, periodNumber]);

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
                            <div className="w-full bg-surface border border-white/10 px-4 py-3 rounded-full flex justify-center text-center font-black tracking-widest shadow-lg">
                                <span className="text-[#f97316]">TOTAL VOLUME - <span className="text-white">{data.totalVolume}</span></span>
                            </div>
                        </div>

                        {/* Prediction Section */}
                        <div className="mt-4 flex flex-col items-center">
                            <h2 className="text-[#facc15] font-black text-xl tracking-[0.15em] uppercase mb-4 drop-shadow-[0_2px_10px_rgba(250,204,21,0.2)]">PREDICTION</h2>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                {/* Small Box */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white font-black text-lg tracking-widest">Small</span>
                                    <div className="bg-[#16a34a] w-full py-4 rounded-xl flex items-center justify-center shadow-[0_5px_20px_rgba(22,163,74,0.3)] border border-[#22c55e]/50 cursor-pointer hover:brightness-110 transition-all active:scale-95 text-white text-3xl font-black tracking-wider">
                                        {data.prediction?.small?.volume || 0}
                                    </div>
                                </div>

                                {/* Big Box */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white font-black text-lg tracking-widest">Big</span>
                                    <div className="bg-[#dc2626] w-full py-4 rounded-xl flex items-center justify-center shadow-[0_5px_20px_rgba(220,38,38,0.3)] border border-[#ef4444]/50 cursor-pointer hover:brightness-110 transition-all active:scale-95 text-white text-3xl font-black tracking-wider">
                                        {data.prediction?.big?.volume || 0}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Count Section */}
                        <div className="mt-6 flex flex-col items-center">
                            <h2 className="text-white/90 font-black text-xl tracking-[0.15em] uppercase mb-4">USER COUNT</h2>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                {/* Small Users Box */}
                                <div
                                    className="flex flex-col w-full text-center cursor-pointer group"
                                    onClick={() => router.push(`/wingo/prediction-history/${dateParam}/${sessionId}/${periodNumber}/small`)}
                                >
                                    <div className="bg-[#15803d] w-full py-3 rounded-xl flex items-center justify-center shadow-lg border border-[#16a34a]/30 text-white text-3xl font-black tracking-wider mb-3 group-hover:brightness-110 group-active:scale-95 transition-all">
                                        {data.prediction?.small?.users || 0}
                                    </div>
                                    <div className="flex justify-center items-center text-center">
                                        <div className="flex flex-col items-center gap-1 group">
                                            <span className="text-xs text-[#f97316] font-medium group-hover:text-white transition-colors">Click to</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-[#f97316] font-medium group-hover:text-white transition-colors">open</span>
                                                <ArrowRight size={14} className="text-[#f97316] group-hover:translate-x-1 group-hover:text-white transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Big Users Box */}
                                <div
                                    className="flex flex-col w-full text-center cursor-pointer group"
                                    onClick={() => router.push(`/wingo/prediction-history/${dateParam}/${sessionId}/${periodNumber}/big`)}
                                >
                                    <div className="bg-[#b91c1c] w-full py-3 rounded-xl flex items-center justify-center shadow-lg border border-[#dc2626]/30 text-white text-3xl font-black tracking-wider mb-3 group-hover:brightness-110 group-active:scale-95 transition-all">
                                        {data.prediction?.big?.users || 0}
                                    </div>
                                    <div className="flex justify-center items-center text-center">
                                        <div className="flex flex-col items-center gap-1 group">
                                            <span className="text-xs text-[#f97316] font-medium group-hover:text-white transition-colors">Click to</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-[#f97316] font-medium group-hover:text-white transition-colors">open</span>
                                                <ArrowRight size={14} className="text-[#f97316] group-hover:translate-x-1 group-hover:text-white transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>
                )}
            </main>
        </div>
    );
}
