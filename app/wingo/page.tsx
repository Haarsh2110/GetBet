'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function WinGoGamePage() {
    const router = useRouter();
    const [sessionData, setSessionData] = useState<any>(null);
    const [currentPeriodDisplay, setCurrentPeriodDisplay] = useState<string>('');
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const fetchActiveSession = async () => {
        try {
            const res = await fetch('/api/games/wingo/active', { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                setSessionData(json.data);
                setSettings(json.settings);
                // Sync the calculated period display
                const pValue = (json as any).period || json.data?.period;
                if (pValue) setCurrentPeriodDisplay(pValue);
            }
        } catch (error) {
            console.error('Failed to check session state:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveSession();
        const intervalId = setInterval(fetchActiveSession, 3000);
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

    const [currentTime, setCurrentTime] = useState('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateTime();
        const tId = setInterval(updateTime, 1000);
        return () => clearInterval(tId);
    }, []);

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

            <main className="flex-1 px-5 relative z-20 pt-6 pb-[120px] flex flex-col gap-8">
                {/* Info Panel: Period & Time */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 shadow-2xl flex justify-between items-start relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>

                    <div className="flex flex-col items-center relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Period Number</p>
                        <p className="text-2xl font-black text-white tracking-widest mt-2 font-mono">{currentPeriodDisplay || '-------'}</p>
                    </div>

                    <div className="flex flex-col items-center relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Time</p>
                        <p className="text-2xl font-black text-[#facc15] tracking-widest mt-2 font-mono">{currentTime}</p>
                    </div>
                </div>

                {/* Dynamic Session Area */}
                <div className="w-full relative shrink-0">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (!sessionData) ? (
                        /* W A I T State */
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-4 w-full"
                        >
                            <div className="relative overflow-hidden w-full py-8 rounded-[2rem] bg-[#222222] shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-white/5 flex flex-col items-center justify-center gap-4">
                                <span className="relative z-10 text-white/50 font-black text-sm tracking-[0.15em] uppercase text-center px-4">
                                    Waiting for session activation...
                                </span>

                                {settings?.showUpcomingToUsers && (
                                    <div className="relative z-10 flex flex-col items-center gap-1 mt-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upcoming Period Number</span>
                                        <span className="text-xl font-black text-white tracking-[0.2em] font-mono">
                                            {settings?.upcomingPeriod || '-------'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* SESSION ACTIVE State */
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-6 w-full"
                        >
                            <div className="relative overflow-hidden w-full py-6 rounded-[2rem] bg-gradient-to-r from-green-500/10 to-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)] border border-green-500/20 flex items-center justify-center">
                                <div className="absolute top-0 left-0 w-2 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                <span className="relative z-10 text-green-500 font-black text-xl tracking-[0.2em] uppercase italic">
                                    Session Active
                                </span>
                            </div>

                            <button
                                onClick={() => router.push('/wingo/play')}
                                className="relative overflow-hidden w-full max-w-[280px] py-4 rounded-[1.5rem] bg-gradient-to-r from-[#facc15] to-[#ca8a04] shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all transform active:scale-95 group border border-[#facc15]/50 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 -translate-x-full group-hover:not-disabled:animate-[shimmer_1.5s_infinite]"></div>
                                <span className="relative z-10 text-black font-black text-lg tracking-[0.1em] uppercase">View Prediction →</span>
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* History Section */}
                <div className="mt-4">
                    <h3 className="font-display font-black text-lg mb-4 flex items-center gap-2 text-white">
                        <span className="w-1 h-5 bg-[#facc15] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"></span>
                        HISTORY
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => router.push('/wingo/result-history')} className="bg-[#111111] rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center justify-between text-center min-h-[160px] relative overflow-hidden group hover:border-[#facc15]/30 transition-colors cursor-pointer">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#facc15]/10 blur-xl rounded-full -mr-10 -mt-10 group-hover:bg-[#facc15]/20 transition-all"></div>
                            <h3 className="font-black text-white text-sm tracking-widest uppercase mt-4 relative z-10">Result<br />History</h3>
                            <div className="text-[#facc15] text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 mt-auto relative z-10 group-hover:translate-y-1 transition-transform">
                                <span>Click to open</span>
                                <span className="text-lg leading-none">&darr;</span>
                            </div>
                        </div>

                        <div onClick={() => router.push('/wingo/prediction-history')} className="bg-[#111111] rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center justify-between text-center min-h-[160px] relative overflow-hidden group hover:border-[#facc15]/30 transition-colors cursor-pointer">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#facc15]/10 blur-xl rounded-full -mr-10 -mt-10 group-hover:bg-[#facc15]/20 transition-all"></div>
                            <h3 className="font-black text-white text-sm tracking-widest uppercase mt-4 relative z-10">Prediction<br />History</h3>
                            <div className="text-[#facc15] text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 mt-auto relative z-10 group-hover:translate-y-1 transition-transform">
                                <span>Click to open</span>
                                <span className="text-lg leading-none">&darr;</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
