'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/use-wallet';
import { motion } from 'motion/react';

export default function WinGoPlayPage() {
    const router = useRouter();
    const { wallet, prefetchGameData } = useWallet();
    
    // Initialize sessionData from global cache for instant-first-load
    const [sessionData, setSessionData] = useState<any>(wallet.gameCache?.['wingo'] || null);
    const [loading, setLoading] = useState(!wallet.gameCache?.['wingo']);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Use wallet balance from hook
    const bettingBalance = wallet.bettingBalance;

    // Memoize history parsing to avoid re-calculating on every timer tick
    const realHistory = useMemo(() => {
        return sessionData?.pastResults
            ? [...sessionData.pastResults].reverse()
            : [];
    }, [sessionData?.pastResults]);

    const fetchActiveSession = async () => {
        try {
            const url = `/api/games/wingo/active?t=${Date.now()}${wallet.userId ? `&userId=${wallet.userId}` : ''}`;
            const res = await fetch(url, { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                setSessionData(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch session state:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveSession();
        const intervalId = setInterval(fetchActiveSession, 2000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!sessionData || !sessionData.endTime) {
            setTimeLeft(null);
            return;
        }

        const tick = () => {
            const now = new Date().getTime();
            const end = new Date(sessionData.endTime).getTime();
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            setTimeLeft(diff);
        };

        tick();
        const timerId = setInterval(tick, 1000);
        return () => clearInterval(timerId);
    }, [sessionData]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isProcessing = sessionData?.status === 'PROCESSING' || (timeLeft !== null && timeLeft > 50); // 0-10s
    const predictionRevealed = sessionData?.prediction;
    const isLocked = bettingBalance === 0;

    const HistoryTable = useMemo(() => {
        if (!realHistory || realHistory.length === 0) {
            return (
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center text-white/40 text-xs">
                    No past results declared in this session yet.
                </div>
            );
        }
        return (
            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/5 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-4 py-3 text-left">Period No.</th>
                            <th className="px-4 py-3 text-center">Result</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {realHistory.map((item: any, idx: number) => (
                            <tr key={item.period || idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-4 font-mono text-white/80">{item.period}</td>
                                <td className="px-4 py-4 text-center font-bold">
                                    <span className={item.isRed ? 'text-[#ef4444]' : 'text-[#22c55e]'}>
                                        {item.result}
                                    </span>
                                </td>
                                <td className="px-4 py-4 justify-end flex">
                                    <span className="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase">Declared</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }, [realHistory]);

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-[100px]">
            {/* Header */}
            <header className="sticky top-0 pt-10 pb-4 px-5 bg-[#0A0A0A]/95 backdrop-blur-xl z-50 border-b border-white/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#facc15]/5 via-[#0A0A0A] to-[#0A0A0A] z-0"></div>

                <div className="relative z-10 flex items-center justify-between mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 text-center pr-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">GetBet VIP</p>
                        <h1 className="text-xl font-black text-[#facc15] uppercase tracking-widest">WIN GO 1M</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-5 relative z-20 pt-6 flex flex-col gap-6">

                {/* Top Status Card */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-6 relative z-10">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
                        ) : sessionData ? (
                            <div className={`px-4 py-1.5 rounded-sm border ${isProcessing ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-green-500/10 border-green-500/20 text-green-500'} flex items-center gap-2`}>
                                <Clock size={14} className={!isProcessing ? 'animate-pulse' : ''} />
                                <span className="text-[10px] uppercase font-black tracking-widest">
                                    {isProcessing ? 'PROCESSING' : 'RESULT DECLARED'} - <span className="font-mono text-sm">{timeLeft !== null ? formatTime(timeLeft).replace('00:', '') : '00'}</span>
                                </span>
                            </div>
                        ) : (
                            <div className="px-4 py-1.5 rounded-sm border bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444] flex items-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                <AlertCircle size={14} />
                                <span className="text-[10px] uppercase font-black tracking-widest">INACTIVE SESSION</span>
                            </div>
                        )}
                    </div>

                    {/* Prediction Info */}
                    <div className="flex flex-col items-center relative z-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CURRENT PERIOD</p>
                        <p className="text-xl font-black text-white tracking-widest font-mono mb-4">{sessionData?.period || '-------'}</p>

                        <div className="flex flex-col items-center gap-2 w-full max-w-[240px] bg-[#0A0A0A] p-4 border border-white/10 rounded-2xl shadow-inner mb-2">
                            <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">Prediction</span>

                        <div className={`w-[180px] h-auto min-h-[70px] flex-none relative flex flex-col items-center justify-center text-3xl font-black tracking-[2px] uppercase text-[#facc15] ${isLocked ? 'overflow-hidden rounded-xl' : ''}`}>
                                <div className={`flex flex-col items-center transition-all duration-300 ${isLocked ? 'blur-[12px] opacity-70 select-none pointer-events-none' : ''}`}>
                                    <div className="flex flex-col items-center gap-1 py-1">
                                        {/* Case 1: Has prediction assigned */}
                                        {sessionData?.prediction && (
                                            <>
                                                <span className="leading-tight">
                                                    {sessionData.prediction}
                                                </span>
                                                {sessionData.status !== 'RESULT_DECLARED' && (
                                                    <span className="text-sm text-white/50 normal-case tracking-tight font-black mt-2">
                                                        Invest ₹{sessionData?.amount || 0}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        {/* Case 2: Has balance but no prediction yet (single user / groups forming) */}
                                        {!sessionData?.prediction && !isLocked && sessionData && (
                                            <div className="flex flex-col items-center gap-3 py-2">
                                                <div className="w-8 h-8 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-[11px] text-white/50 normal-case tracking-widest font-black mt-1">
                                                    Analyzing Market...
                                                </span>
                                            </div>
                                        )}
                                        {/* Case 3: No session data yet */}
                                        {!sessionData && !isLocked && (
                                            <span className="text-white/30 text-lg">---</span>
                                        )}
                                    </div>
                                </div>
                                {isLocked && (
                                    <div className="absolute inset-0 bg-[#0A0A0A]/40 z-10"></div>
                                )}
                            </div>


                            {/* Lock Message & CTA for Zero Balance */}
                            {isLocked && (
                                <div className="mt-4 flex flex-col items-center gap-4 py-2">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                                        Add money to betting<br />to get prediction
                                    </p>
                                    <button
                                        onClick={() => router.push('/wallet')}
                                        className="w-full py-3 bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Transfer to Betting
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAST History Section - Hidden for Zero Balance users */}
                {!isLocked && (
                    <div className="mb-6 mt-2">
                        <h3 className="font-display font-black text-lg mb-4 flex items-center gap-2 text-white">
                            <span className="w-1 h-5 bg-[#facc15] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"></span>
                            PAST
                        </h3>
                        {HistoryTable}
                    </div>
                )}

            </main>
        </div>
    );
}
