'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SessionDetailsList() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId') || '';
    const sessionNo = searchParams.get('sessionNo') || '';
    const dateStr = searchParams.get('date') || '';

    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<string>('');
    const [updatingPeriodId, setUpdatingPeriodId] = useState<string | null>(null);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`/api/admin/wingo/result-history/session-details?sessionId=${sessionId}`);
            const json = await res.json();
            if (json.success) {
                setPeriods(json.data);
                if (json.session) {
                    setSessionStatus(json.session.status);
                }
            }
        } catch (err) {
            console.error('Failed to fetch details', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!sessionId) return;
        fetchDetails();

        // Listen for new periods ONLY if session is active
        const interval = setInterval(() => {
            if (['active', 'Running'].includes(sessionStatus)) {
                fetchDetails();
            }
        }, 30000); // 30s auto-refresh

        return () => clearInterval(interval);
    }, [sessionId, sessionStatus]);

    const handleUpdateResult = async (periodId: string, result: string) => {
        // Optimistic UI state preservation: leave updatingPeriodId as is until we get success or failure
        // Actually, user wants it to NOT reset, so we handle it carefully.
        try {
            console.log(`[ResultUpdate] Starting update for ${periodId} with result: ${result}`);
            const res = await fetch('/api/admin/wingo/result-history/update-period', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ periodId, result })
            });
            const json = await res.json();
            console.log('[ResultUpdate] API Response:', json);

            if (json.success) {
                // Update local state immediately
                setPeriods(prev => prev.map(p => p._id === periodId ? { ...p, ...json.data } : p));
                setUpdatingPeriodId(null);
                // Also refetch to ensure everything is perfectly synced
                await fetchDetails();
            } else {
                console.error('[ResultUpdate] API Error:', json.error);
                setUpdatingPeriodId(null);
            }
        } catch (err) {
            console.error('[ResultUpdate] Fetch failed', err);
            setUpdatingPeriodId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white pb-20">
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <Link href={`/admin/wingo/sessions?date=${dateStr}`} className="absolute left-6 text-primary hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-white font-black text-lg tracking-widest uppercase">RESULT HISTORY</h1>
            </div>

            <div className="flex flex-col items-center mt-8 gap-3">
                <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase">
                    DATE : {dateStr}
                </div>
                <div className="text-white/50 font-black text-[10px] tracking-widest uppercase mt-2">
                    SESSION NO. {sessionNo}
                </div>
            </div>

            <div className="px-4 mt-8">
                <table className="w-full text-center border-separate border-spacing-y-2">
                    <thead>
                        <tr>
                            <th className="py-2 text-primary font-black text-[10px] tracking-widest uppercase border-b border-primary/20">PERIOD NO.</th>
                            <th className="py-2 text-primary font-black text-[10px] tracking-widest uppercase border-b border-primary/20">RESULT</th>
                            <th className="py-2 text-primary font-black text-[10px] tracking-widest uppercase border-b border-primary/20">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary inline-block" />
                                </td>
                            </tr>
                        ) : periods.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-20 text-center text-white/50 font-black text-xs tracking-widest uppercase">
                                    NO RECORDS FOUND
                                </td>
                            </tr>
                        ) : (
                            periods.map((item, i) => (
                                <tr key={item._id} className="bg-surface border-y border-white/5 transition-colors relative">
                                    <td className="py-5 text-white/90 font-black text-sm tracking-wider rounded-l-xl opacity-90">{item.period}</td>
                                    <td className={`py-5 font-black text-sm tracking-widest opacity-90`}>
                                        {updatingPeriodId === item._id ? (
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => handleUpdateResult(item._id, 'BIG')} className="bg-accent-green text-[10px] px-3 py-1 rounded-full text-white">Big</button>
                                                <button onClick={() => handleUpdateResult(item._id, 'SMALL')} className="bg-accent-red text-[10px] px-3 py-1 rounded-full text-white">Small</button>
                                            </div>
                                        ) : (
                                            <span className={`${item.status === 'completed'
                                                    ? (item.result === 'BIG' ? 'text-accent-green' : 'text-accent-red')
                                                    : 'text-white/40' // Yellow/Neutral for Pending
                                                }`}>
                                                {item.status === 'completed' ? (item.result === 'BIG' ? 'Big' : 'Small') : 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-5 flex justify-center rounded-r-xl pr-4">
                                        {updatingPeriodId === item._id ? (
                                            <button onClick={() => setUpdatingPeriodId(null)} className="text-white/40 text-[9px] font-black underline uppercase tracking-widest">CANCEL</button>
                                        ) : (
                                            item.status === 'completed' ? (
                                                <button
                                                    onClick={() => setUpdatingPeriodId(item._id)}
                                                    className="text-white text-[9px] font-black px-4 py-1.5 rounded uppercase tracking-widest bg-accent-red shadow-[0_0_10px_rgba(255,59,48,0.3)] active:scale-95 transition-transform"
                                                >
                                                    EDIT
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setUpdatingPeriodId(item._id)}
                                                    className="text-white text-[9px] font-black px-4 py-1.5 rounded uppercase tracking-widest bg-accent-green shadow-[0_0_10px_rgba(52,199,89,0.3)] active:scale-95 transition-transform"
                                                >
                                                    UPDATE
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-12 flex justify-center">
                <Link href={`/admin/wingo/sessions?date=${dateStr}`} className="bg-surface border border-primary/20 text-primary/70 px-12 py-3.5 rounded-full text-[10.5px] font-black tracking-widest uppercase hover:bg-primary hover:text-black transition-all shadow-glow">
                    All history
                </Link>
            </div>
        </div>
    );
}

export default function SessionDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <SessionDetailsList />
        </Suspense>
    );
}
