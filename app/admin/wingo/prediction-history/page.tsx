'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

type PeriodResult = {
    period: string;
    result: string;
    createdAt: string;
};

type SessionData = {
    id: string;
    sessionNo: number;
    turnover: number;
    periods: PeriodResult[];
};

type ViewLevel = 'dates' | 'sessions' | 'periods' | 'detail';
type DetailSide = 'Small' | 'Big' | null;

export default function PredictionHistoryPage() {
    const [view, setView] = useState<ViewLevel>('dates');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [detailSide, setDetailSide] = useState<DetailSide>(null);
    const [loading, setLoading] = useState(true);

    const [sessionsByDate, setSessionsByDate] = useState<Record<string, SessionData[]>>({});
    const [dateList, setDateList] = useState<{ date: string; sessionCount: number; turnOver: number }[]>([]);

    const [periodDetail, setPeriodDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/admin/sessions');
                const json = await res.json();
                if (json.success) {
                    const dateGroups: Record<string, SessionData[]> = {};
                    const reversedSessions = [...json.data].reverse();

                    // Track session number per day (starting from 1)
                    const dayCounters: Record<string, number> = {};

                    reversedSessions.forEach((session: any) => {
                        if (session.game === 'WinGo') {
                            const d = new Date(session.createdAt);
                            const dateStr = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
                            
                            if (!dayCounters[dateStr]) dayCounters[dateStr] = 0;
                            dayCounters[dateStr]++;

                            const periods: PeriodResult[] = session.pastResults || [];
                            // Use the actual turnover calculated by the API
                            const sessionTurnover = session.totalTurnover || 0;

                            if (!dateGroups[dateStr]) dateGroups[dateStr] = [];
                            dateGroups[dateStr].push({
                                id: session._id,
                                sessionNo: dayCounters[dateStr],
                                turnover: sessionTurnover,
                                periods: periods
                            });
                        }
                    });

                    // Sort dates descending for the main list
                    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
                        const [da, ma, ya] = a.split('-').map(Number);
                        const [db, mb, yb] = b.split('-').map(Number);
                        return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
                    });

                    // For each date, sessions should be show in reverse order (highest session no first)
                    Object.keys(dateGroups).forEach(d => {
                        dateGroups[d].sort((a, b) => b.sessionNo - a.sessionNo);
                    });

                    setSessionsByDate(dateGroups);
                    setDateList(sortedDates.map(date => {
                        const sessions = dateGroups[date];
                        return { 
                            date, 
                            sessionCount: sessions.length,
                            turnOver: sessions.reduce((sum, s) => sum + s.turnover, 0)
                        };
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch prediction history', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const fetchDetail = async (period: string) => {
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/admin/sessions/predictions?period=${period}`);
            const json = await res.json();
            if (json.success) {
                setPeriodDetail(json.data);
            }
        } catch (error) {
            console.error('Fetch detail error:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const [periods, setPeriods] = useState<any[]>([]);
    const [sessionTotalTurnover, setSessionTotalTurnover] = useState(0);
    const [periodsLoading, setPeriodsLoading] = useState(false);

    const fetchSessionPeriods = async (sessionId: string) => {
        setPeriodsLoading(true);
        try {
            const res = await fetch(`/api/admin/wingo/result-history/session-details?sessionId=${sessionId}`);
            const json = await res.json();
            if (json.success) {
                setPeriods(json.data);
                setSessionTotalTurnover(json.totalTurnover || 0);
            }
        } catch (error) {
            console.error('Fetch periods error:', error);
        } finally {
            setPeriodsLoading(false);
        }
    };

    const handleOpenSession = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setView('periods');
        fetchSessionPeriods(sessionId);
    };

    const handleOpenPeriodDetail = (period: string) => {
        setSelectedPeriod(period);
        setView('detail');
        fetchDetail(period);
    };

    // Helper for currency formatting
    const formatAmount = (num: number) => {
        return num.toLocaleString();
    };

    // ------- USER LIST VIEW -------
    if (view === 'detail' && detailSide) {
        const pd = periodDetail || { smallUsers: [], bigUsers: [], smallVolume: 0, bigVolume: 0, smallCount: 0, bigCount: 0 };
        const users = detailSide === 'Small' ? pd.smallUsers : pd.bigUsers;
        const volume = detailSide === 'Small' ? pd.smallVolume : pd.bigVolume;
        const count = detailSide === 'Small' ? pd.smallCount : pd.bigCount;

        return (
            <div className="min-h-screen bg-background text-white pb-20">
                <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                    <button onClick={() => { setDetailSide(null); }} className="absolute left-6 text-primary hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-black text-lg tracking-widest uppercase text-center mt-1">PREDICTION HISTORY</h1>
                </div>

                <div className="flex justify-center mt-8">
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase">
                        DATE : {selectedDate}
                    </div>
                </div>

                <div className="px-6 mt-8">
                    <div className="bg-surface border border-primary/30 rounded-xl py-4 px-6 text-center text-[10px] font-black tracking-widest text-primary mb-8 shadow-lg">
                        PERIOD NUMBER - <span className="text-white text-base tracking-wider ml-2">{selectedPeriod}</span>
                    </div>

                    <div className="bg-surface rounded-2xl border border-white/5 p-6 mb-8 shadow-lg space-y-4">
                        <div className="flex justify-between items-center font-black text-xs uppercase tracking-widest border-b border-white/5 pb-4">
                            <span className="text-white/50">Prediction</span>
                            <span className={detailSide === 'Small' ? 'text-accent-green' : 'text-accent-red'}>{detailSide.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center font-black text-xs uppercase tracking-widest border-b border-white/5 pb-4">
                            <span className="text-white/50">Volume</span>
                            <span className="text-white text-lg tracking-wider">{volume.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center font-black text-xs uppercase tracking-widest">
                            <span className="text-white/50">User count</span>
                            <span className="text-white text-lg tracking-wider">{count}</span>
                        </div>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center text-white/50 text-xs font-black uppercase tracking-widest mt-10">
                            No bets placed
                        </div>
                    )}

                    <div className="space-y-3">
                        {users.map((u: any, i: number) => (
                            <div key={i} className="flex items-center bg-surface border border-white/5 py-3 px-4 rounded-xl shadow-md">
                                <div className="w-8 text-primary font-black text-sm">{i + 1}</div>
                                <div className="flex-1 flex items-center gap-3 border-l border-white/10 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-background border border-primary/20 flex items-center justify-center">
                                        <User size={14} className="text-primary" />
                                    </div>
                                    <span className="text-white/70 text-sm font-bold tracking-wider">User {u.id}</span>
                                </div>
                                <div className="text-primary font-black text-base tracking-wider">{u.amount.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ------- PERIOD DETAIL VIEW -------
    if (view === 'detail' && !detailSide) {
        if (detailLoading) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }

        const pd = periodDetail || { smallVolume: 0, bigVolume: 0, smallCount: 0, bigCount: 0 };
        return (
            <div className="min-h-screen bg-background text-white pb-20">
                <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                    <button onClick={() => { setView('periods'); setSelectedPeriod(''); }} className="absolute left-6 text-primary hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-black text-lg tracking-widest uppercase text-center mt-1">PREDICTION HISTORY</h1>
                </div>

                <div className="flex justify-center mt-8">
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase">
                        DATE : {selectedDate}
                    </div>
                </div>

                <div className="px-6 mt-8 space-y-4">
                    <div className="bg-surface border border-primary/30 rounded-xl py-4 px-6 text-center text-[10px] font-black tracking-widest text-primary shadow-lg">
                        PERIOD NUMBER - <span className="text-white text-base tracking-wider">{selectedPeriod}</span>
                    </div>
                    <div className="bg-surface border border-primary/30 rounded-xl py-4 px-6 text-center text-[10px] font-black tracking-widest text-primary shadow-glow">
                        TOTAL VOLUME - <span className="text-white text-base tracking-wider">{(pd.smallVolume + pd.bigVolume).toLocaleString()}</span>
                    </div>
                </div>

                <div className="px-6 mt-10">
                    <h3 className="text-primary font-black text-[13px] text-center mb-6 tracking-[0.2em] font-display">PREDICTION VOLUME</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-surface border border-white/5 rounded-2xl p-4 shadow-lg pb-6">
                            <div className="text-white/50 font-black text-[10px] tracking-widest uppercase text-center mb-4 border-b border-white/5 pb-2">Small</div>
                            <div className="text-accent-green text-3xl font-black text-center drop-shadow-[0_0_10px_rgba(52,199,89,0.3)] tracking-wider">
                                {pd.smallVolume.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-surface border border-white/5 rounded-2xl p-4 shadow-lg pb-6">
                            <div className="text-white/50 font-black text-[10px] tracking-widest uppercase text-center mb-4 border-b border-white/5 pb-2">Big</div>
                            <div className="text-accent-red text-3xl font-black text-center drop-shadow-[0_0_10px_rgba(255,59,48,0.3)] tracking-wider">
                                {pd.bigVolume.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-white font-black text-[11px] text-center uppercase tracking-widest mt-12 mb-6 opacity-80">USER COUNT</h3>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="text-center group">
                            <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green text-3xl font-black py-5 rounded-2xl shadow-lg shadow-accent-green/5 mb-4 group-hover:bg-accent-green/20 transition-colors">
                                {pd.smallCount}
                            </div>
                            <button
                                onClick={() => { setDetailSide('Small'); }}
                                className="text-primary text-[10px] font-black tracking-widest uppercase inline-flex items-center gap-1 hover:text-white transition-colors"
                            >
                                SHOW <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="text-center group">
                            <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-3xl font-black py-5 rounded-2xl shadow-lg shadow-accent-red/5 mb-4 group-hover:bg-accent-red/20 transition-colors">
                                {pd.bigCount}
                            </div>
                            <button
                                onClick={() => { setDetailSide('Big'); }}
                                className="text-primary text-[10px] font-black tracking-widest uppercase inline-flex items-center gap-1 hover:text-white transition-colors"
                            >
                                SHOW <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ------- PERIODS LIST VIEW (Level 3) -------
    if (view === 'periods') {
        const sessions = sessionsByDate[selectedDate] || [];
        const currentSession = sessions.find(s => s.id === selectedSessionId);

        return (
            <div className="min-h-screen bg-background text-white pb-20 font-display">
                <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                    <button onClick={() => setView('sessions')} className="absolute left-6 text-primary hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-black text-lg tracking-widest uppercase text-center mt-1">PREDICTION HISTORY</h1>
                </div>

                <div className="flex flex-col items-center gap-2 mt-8">
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase">
                        DATE : {selectedDate}
                    </div>
                    <div className="bg-surface border border-primary/30 text-primary px-8 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase mt-1">
                        SESSION NO. {currentSession?.sessionNo}
                    </div>
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase mt-1">
                        TOTAL TURNOVER - {formatAmount(sessionTotalTurnover)}
                    </div>
                </div>

                <div className="px-6 mt-12 space-y-4">
                    <div className="grid grid-cols-3 gap-x-4 mb-2 px-2">
                        <div className="text-primary font-black text-[10px] uppercase tracking-widest">PERIOD NO.</div>
                        <div className="text-primary font-black text-[10px] uppercase tracking-widest text-center">VOLUME</div>
                        <div></div>
                    </div>

                    {periodsLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        periods.map((p, i) => (
                            <div key={i} className="grid grid-cols-3 items-center bg-surface border border-white/5 py-3 px-4 rounded-xl shadow-lg hover:border-primary/30 transition-colors group">
                                <div className="text-white font-black text-sm tracking-widest pl-2">{p.period}</div>
                                <div className="text-white font-black text-sm text-center">{formatAmount(p.volume || 0)}</div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleOpenPeriodDetail(p.period)}
                                        className="text-primary text-[9px] font-black flex items-center gap-1 uppercase tracking-widest"
                                    >
                                        <span>Click to open</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {!periodsLoading && periods.length === 0 && (
                        <div className="text-center text-white/50 text-xs font-black uppercase tracking-widest mt-12 py-10">
                            No records found
                        </div>
                    )}

                    <div className="mt-12 flex justify-center">
                        <div className="bg-surface border border-white/5 text-white/30 px-10 py-3 rounded-full text-[10px] font-black tracking-widest uppercase shadow-inner">
                            All history
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ------- SESSIONS LIST VIEW (Level 2) -------
    if (view === 'sessions') {
        const sessions = sessionsByDate[selectedDate] || [];
        const totalTurnover = sessions.reduce((sum, s) => sum + s.turnover, 0);

        return (
            <div className="min-h-screen bg-background text-white pb-20 font-display">
                <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface text-center">
                    <button onClick={() => setView('dates')} className="absolute left-6 text-primary hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-black text-lg tracking-widest uppercase text-center mt-1">PREDICTION HISTORY</h1>
                </div>

                <div className="flex flex-col items-center gap-2 mt-8">
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase">
                        DATE : {selectedDate}
                    </div>
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase mt-1">
                        TOTAL TURNOVER {formatAmount(totalTurnover)}
                    </div>
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mt-1">
                        TOTAL SESSION - {sessions.length}
                    </div>
                </div>

                <div className="px-6 mt-12 space-y-4">
                    <div className="grid grid-cols-3 gap-x-4 mb-2 px-2">
                        <div className="text-primary font-black text-[10px] uppercase tracking-widest pl-2">SESSION NO.</div>
                        <div className="text-primary font-black text-[10px] uppercase tracking-widest text-center">TURNOVER</div>
                        <div></div>
                    </div>
                    
                    {sessions.map((s, i) => (
                        <div key={s.id} className="grid grid-cols-3 items-center bg-surface border border-white/5 py-3 px-4 rounded-xl shadow-lg hover:border-primary/30 transition-colors group">
                            <div className="text-white font-black text-sm tracking-widest pl-4">{s.sessionNo}</div>
                            <div className="text-white font-black text-sm text-center">{formatAmount(s.turnover)}</div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleOpenSession(s.id)}
                                    className="text-primary text-[9px] font-black flex items-center gap-1 uppercase tracking-widest"
                                >
                                    <span>Click to open</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="mt-12 flex justify-center">
                        <div className="bg-surface border border-white/5 text-white/30 px-10 py-3 rounded-full text-[10px] font-black tracking-widest uppercase shadow-inner">
                            NO MORE HISTORY
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ------- DATES VIEW (default) -------
    return (
        <div className="min-h-screen bg-background text-white pb-20">
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <Link href="/admin/wingo" className="absolute left-6 text-primary hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-white font-black text-lg tracking-widest uppercase text-center mt-1">PREDICTION HISTORY</h1>
            </div>

            <div className="px-6 mt-10 space-y-3">
                <div className="grid grid-cols-3 gap-x-4 mb-4 pb-4 border-b border-primary/20">
                    <div className="text-primary font-black text-[10px] tracking-widest uppercase">DATE:</div>
                    <div className="text-primary font-black text-[10px] tracking-widest uppercase text-center">SESSIONS:</div>
                    <div className="text-primary font-black text-[10px] tracking-widest uppercase text-right pr-2">TURN OVER:</div>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : dateList.length === 0 ? (
                    <div className="text-center text-white/50 font-black text-xs uppercase tracking-widest mt-10">
                        NO RESULTS
                    </div>
                ) : (
                    dateList.map((d, i) => (
                        <div key={i} className="flex items-center bg-surface border border-white/5 py-4 px-4 rounded-xl shadow-lg hover:border-primary/30 transition-colors group">
                            <div className="flex-[1.2] text-white font-bold text-[13px] tracking-wider">{d.date}</div>
                            <div className="w-12 text-white/70 font-bold text-sm text-center">{d.sessionCount}</div>
                            <div className="flex-1 flex items-center justify-end gap-3 text-right">
                                <span className="text-primary font-black text-sm tracking-wider">{formatAmount(d.turnOver)}</span>
                                <button
                                    onClick={() => { setSelectedDate(d.date); setView('sessions'); }}
                                    className="text-white/30 group-hover:text-primary transition-colors"
                                >
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
