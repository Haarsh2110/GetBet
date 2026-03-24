'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function WinGoControlPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pushing, setPushing] = useState<string | null>(null);
    const [sessionMode, setSessionMode] = useState<'active' | 'inactive'>('inactive');
    const [upcomingPeriod, setUpcomingPeriod] = useState('1000667');
    const [showUpcomingToUsers, setShowUpcomingToUsers] = useState(false);
    const [isEditingUpcoming, setIsEditingUpcoming] = useState(false);
    const [editUpcomingValue, setEditUpcomingValue] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [manualPeriod, setManualPeriod] = useState('1000666');
    const [isEditingPeriod, setIsEditingPeriod] = useState(false);
    const [editPeriodValue, setEditPeriodValue] = useState('');
    const [sessionCount, setSessionCount] = useState(0);
    const [sessionActivating, setSessionActivating] = useState(false);
    const [isSessionEnabled, setIsSessionEnabled] = useState(false);
    const [isTogglingUserView, setIsTogglingUserView] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [recentPeriods, setRecentPeriods] = useState<any[]>([]);
    const [updatingPeriodId, setUpdatingPeriodId] = useState<string | null>(null);

    const fetchStats = async (period: string) => {
        try {
            const res = await fetch(`/api/admin/games/wingo/period-stats?period=${period}`, { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                setStats(json.data);
            }
        } catch (err) {
            console.error('Failed to fetch period stats:', err);
        }
    };

    const fetchRecentPeriods = async (sId: string) => {
        try {
            const res = await fetch(`/api/admin/wingo/result-history/session-details?sessionId=${sId}`, { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                setRecentPeriods(json.data.slice(0, 5)); // Top 5 recent
            }
        } catch (err) {
            console.error('Failed to fetch recent periods:', err);
        }
    };

    const handleUpdateResult = async (periodId: string, result: string) => {
        try {
            const res = await fetch('/api/admin/wingo/result-history/update-period', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ periodId, result })
            });
            const json = await res.json();
            if (json.success && session?._id) {
                fetchRecentPeriods(session._id);
            }
        } catch (err) {
            console.error('Failed to update result:', err);
        } finally {
            setUpdatingPeriodId(null);
        }
    };

    const fetchData = async () => {
        console.log("[AdminWinGo] Fetching settings & current session in parallel");
        try {
            const [settingsRes, sessionRes] = await Promise.all([
                fetch('/api/admin/games/wingo/settings', { cache: 'no-store' }),
                fetch('/api/admin/sessions', { cache: 'no-store' }) // Fetch latest sessions instead of just Running
            ]);

            const [settingsJson, sessionJson] = await Promise.all([
                settingsRes.json(),
                sessionRes.json()
            ]);

            if (settingsJson.success) {
                const settings = settingsJson.data;
                const now = new Date();
                const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();
                const diffMs = currentMinuteStart - new Date(settings.periodRefTime).getTime();
                const periodsPassed = Math.floor(diffMs / 60000);
                setManualPeriod((settings.periodRef + periodsPassed).toString());
                setSessionCount(settings.todaySessionCount || 0);
                setIsSessionEnabled(settings.sessionActive || false);
                setUpcomingPeriod(settings.upcomingPeriod?.toString() || (settings.periodRef + periodsPassed + 1).toString());
                setShowUpcomingToUsers(settings.showUpcomingToUsers || false);
                (window as any).wingo_ref = settings;
            }

            if (sessionJson.success && sessionJson.data.length > 0) {
                const winGoSession = sessionJson.data.find((s: any) => s.game === 'WinGo' || s.sessionId?.includes('WG'));
                if (winGoSession) {
                    setSession(winGoSession);
                    fetchRecentPeriods(winGoSession._id);
                }
            } else {
                setSession(null);
            }
        } catch (err) {
            console.error('[AdminWinGo] Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const sessionInterval = setInterval(() => {
            fetch('/api/admin/sessions', { cache: 'no-store' })
                .then(r => r.json())
                .then(json => {
                    if (json.success && json.data.length > 0) {
                        const winGoSession = json.data.find((s: any) => s.game === 'WinGo' || s.sessionId?.includes('WG'));
                        if (winGoSession) setSession(winGoSession);
                    } else setSession(null);
                });
        }, 5000);

        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            const ref = (window as any).wingo_ref;
            if (ref) {
                const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();
                const diffMs = currentMinuteStart - new Date(ref.periodRefTime).getTime();
                const periodsPassed = Math.floor(diffMs / 60000);
                setManualPeriod((ref.periodRef + periodsPassed).toString());
            }
        }, 1000);

        const statsTimer = setInterval(() => {
            if (manualPeriod) fetchStats(manualPeriod);
            if (session?._id) fetchRecentPeriods(session._id);
        }, 3000);

        return () => {
            clearInterval(sessionInterval);
            clearInterval(timer);
            clearInterval(statsTimer);
        };
    }, [manualPeriod, session?._id]);

    const handleResultPush = async (result: 'Big' | 'Small') => {
        if (!session) return;
        setPushing(result);
        try {
            const res = await fetch('/api/admin/sessions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: session._id,
                    action: 'addPastResult',
                    period: manualPeriod,
                    result: result,
                    isRed: result === 'Big' // Just an example logic
                })
            });
            const json = await res.json();
            if (json.success) {
                setSession(json.data);
                fetchRecentPeriods(session._id); // Refresh table after push
            }
        } catch (error) {
            console.error('Failed to push result:', error);
        } finally {
            setPushing(null);
        }
    };

    const handleActivateSession = async () => {
        if (sessionActivating) return;
        console.log('[UI] Activate Session button clicked');
        setSessionActivating(true);
        try {
            console.log('[API] Calling /api/admin/games/wingo/activate...');
            const res = await fetch('/api/admin/games/wingo/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();

            console.log('[API] Response received:', json);

            if (json.success) {
                const { sessionCount, sessionActive, session: newSession } = json.data;
                setSessionCount(sessionCount);
                setSessionMode('active');
                setIsSessionEnabled(sessionActive);

                if (newSession) {
                    setSession(newSession);
                }
            }
        } catch (err) {
            console.error('[UI Error] Failed to activate session:', err);
        } finally {
            setSessionActivating(false);
        }
    };

    const handleDeactivateSession = async () => {
        console.log('[UI] Stop Session button clicked');
        try {
            const res = await fetch('/api/admin/games/wingo/deactivate', { method: 'POST' });
            const json = await res.json();
            if (json.success) {
                setSessionMode('inactive');
                setIsSessionEnabled(false);
                console.log('[API] Session deactivated');
            }
        } catch (err) {
            console.error('[UI Error] Failed to deactivate session');
        }
    };

    const handleToggleUserView = async () => {
        if (isTogglingUserView) return;
        console.log('[UI] Eye icon clicked. Current state:', showUpcomingToUsers);
        setIsTogglingUserView(true);
        try {
            const res = await fetch('/api/wingo/toggle-visibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();
            console.log('[API] Toggle Visibility Response:', json);
            if (json.success) {
                setShowUpcomingToUsers(json.data.showUpcomingToUsers);
            }
        } catch (err) {
            console.error('[UI Error] Failed to toggle user view:', err);
        } finally {
            setIsTogglingUserView(false);
        }
    };

    const handleUpdateUpcomingPeriod = async () => {
        console.log('[UI] OK button clicked. New value:', editUpcomingValue);
        const val = parseInt(editUpcomingValue);
        if (isNaN(val)) {
            console.warn('[UI] Invalid upcoming period value');
            return;
        }
        try {
            const res = await fetch('/api/wingo/update-upcoming', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ upcomingPeriod: val })
            });
            const json = await res.json();
            console.log('[API] Update Upcoming Response:', json);
            if (json.success) {
                setUpcomingPeriod(json.data.upcomingPeriod.toString());
                setIsEditingUpcoming(false);
            }
        } catch (err) {
            console.error('[UI Error] Failed to update upcoming period:', err);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', { hour12: false });
    };
    const getSessionNumber = () => sessionCount;

    if (loading && !session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white pb-20">
            {/* Dark Golden Header */}
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <Link href="/admin" className="absolute left-6 text-primary hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-white font-black text-lg tracking-widest uppercase text-center mt-1">WIN GO - 1 MINUTE</h1>
            </div>

            {/* Period & Time */}
            <div className="m-6 flex justify-between items-center bg-surface border border-white/5 p-5 rounded-2xl shadow-lg">
                <div>
                    <div className="font-black text-white/50 text-[10px] uppercase tracking-widest">PERIOD NUMBER</div>
                    {isEditingPeriod ? (
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="text"
                                value={editPeriodValue}
                                onChange={(e) => setEditPeriodValue(e.target.value)}
                                className="bg-background border border-primary/50 text-white font-black text-xl w-32 px-2 py-1 rounded outline-none focus:border-primary transition-colors"
                            />
                            <button
                                onClick={async () => {
                                    const typedVal = parseInt(editPeriodValue);
                                    if (!isNaN(typedVal)) {
                                        try {
                                            const res = await fetch('/api/admin/games/wingo/settings', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ periodRef: typedVal })
                                            });
                                            const json = await res.json();
                                            if (json.success) {
                                                (window as any).wingo_ref = json.data;
                                                const now = new Date();
                                                const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();
                                                const diffMs = currentMinuteStart - new Date(json.data.periodRefTime).getTime();
                                                const periodsPassed = Math.floor(diffMs / 60000);
                                                setManualPeriod((json.data.periodRef + periodsPassed).toString());
                                            }
                                        } catch (err) {
                                            console.error('Failed to save period');
                                        }
                                    }
                                    setIsEditingPeriod(false);
                                }}
                                className="bg-primary text-black text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest hover:bg-white transition-colors"
                            >
                                SAVE
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="font-black text-primary text-2xl mt-1 tracking-wider">{manualPeriod}</div>
                            <button
                                onClick={() => {
                                    setEditPeriodValue(manualPeriod);
                                    setIsEditingPeriod(true);
                                }}
                                className="bg-primary/20 border border-primary/30 text-primary text-[9px] font-black px-3 py-1 mt-2 rounded uppercase tracking-widest hover:bg-primary hover:text-black transition-colors"
                            >
                                EDIT
                            </button>
                        </>
                    )}
                </div>
                <div className="text-right">
                    <div className="font-black text-white/50 text-[10px] uppercase tracking-widest">TIME</div>
                    <div className="font-black text-white text-2xl mt-1 tracking-wider">{formatTime(currentTime)}</div>
                </div>
            </div>

            {/* Session Control Area */}
            <div className="px-6 mt-6 flex flex-col items-center">
                {isSessionEnabled ? (
                    <div className="w-full flex flex-col items-center">
                        <button
                            onClick={handleActivateSession}
                            disabled={sessionActivating || isSessionEnabled}
                            className={`bg-gradient-to-r ${isSessionEnabled ? 'from-primary/50 to-primary-muted/50 cursor-not-allowed' : 'from-primary to-primary-muted'} text-black font-black text-[11px] px-8 py-3 rounded-full mb-4 tracking-widest uppercase active:scale-95 transition-transform shadow-glow flex items-center gap-2`}
                        >
                            {sessionActivating ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    ACTIVATING...
                                </>
                            ) : (
                                `ACTIVATED - ${getSessionNumber()}`
                            )}
                        </button>
                        <button
                            onClick={handleDeactivateSession}
                            className="bg-accent-green/20 border border-accent-green/50 text-accent-green font-black tracking-widest text-[11px] px-6 py-2 rounded-full mb-10 shadow-lg"
                        >
                            STOP SESSION
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center">
                        <div className="bg-surface rounded-2xl shadow-lg border border-primary/20 p-6 w-full flex flex-col items-center mb-0 relative overflow-hidden min-h-[280px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full"></div>

                            {/* User Visibility Toggle */}
                            <button
                                onClick={handleToggleUserView}
                                disabled={isTogglingUserView}
                                className={`absolute top-4 right-4 p-2 rounded-full border transition-all ${showUpcomingToUsers ? 'bg-primary/20 border-primary text-primary shadow-glow' : 'bg-surface border-white/10 text-white/30'}`}
                                title={showUpcomingToUsers ? "Visible to Users" : "Hidden from Users"}
                            >
                                {isTogglingUserView ? <Loader2 size={16} className="animate-spin" /> : (showUpcomingToUsers ? <Eye size={16} /> : <EyeOff size={16} />)}
                            </button>

                            <button
                                onClick={handleActivateSession}
                                disabled={sessionActivating || isSessionEnabled}
                                className={`bg-gradient-to-r ${isSessionEnabled ? 'from-primary/50 to-primary-muted/50 cursor-not-allowed' : 'from-primary to-primary-muted'} text-black font-black text-[11px] px-8 py-4 rounded-xl shadow-glow tracking-widest uppercase active:scale-95 transition-transform mb-8 flex items-center gap-2 mt-4`}
                            >
                                {sessionActivating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        ACTIVATING...
                                    </>
                                ) : (
                                    `ACTIVATE SESSION - ${getSessionNumber()}`
                                )}
                            </button>

                            <div className="font-black text-white/50 text-[10px] uppercase mb-1 tracking-widest">
                                UPCOMING PERIOD NUMBER
                            </div>
                            <div className="flex flex-col items-center gap-3 mb-8">
                                {isEditingUpcoming ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={editUpcomingValue}
                                            onChange={(e) => setEditUpcomingValue(e.target.value)}
                                            className="bg-background border border-primary/50 text-white font-black text-xl w-32 px-2 py-1 rounded outline-none focus:border-primary transition-colors text-center"
                                        />
                                        <button
                                            onClick={handleUpdateUpcomingPeriod}
                                            className="bg-primary text-black text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest hover:bg-white transition-colors"
                                        >
                                            OK
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="font-black text-white text-xl tracking-widest font-mono">
                                            {upcomingPeriod}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditUpcomingValue(upcomingPeriod);
                                                setIsEditingUpcoming(true);
                                            }}
                                            className="bg-primary/20 border border-primary/30 text-primary text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest hover:bg-primary hover:text-black transition-colors"
                                        >
                                            EDIT
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-background border border-primary/20 p-2.5 rounded-xl flex gap-2 items-center shadow-inner mb-2 opacity-50">
                                <div className="bg-primary/20 text-primary font-black text-sm px-3.5 py-1.5 rounded-lg">3</div>
                                <div className="bg-primary/20 text-primary font-black text-sm px-3.5 py-1.5 rounded-lg">6</div>
                                <div className="text-primary/30 font-black px-1 text-sm tracking-widest">&gt;&gt;</div>
                                <div className="bg-primary/20 text-primary font-black text-sm px-3.5 py-1.5 rounded-lg">138</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Always Visible Stats & History Section */}
                <div className="w-full flex flex-col items-center">
                    <div className="font-black text-white/50 text-[10px] uppercase tracking-widest flex items-center gap-2 mb-2 mt-10">
                        <span className="w-8 h-px bg-white/20"></span>
                        PREVIEW {manualPeriod}
                        <span className="w-8 h-px bg-white/20"></span>
                    </div>

                    {/* LIVE Volume Stats */}
                    <div className="grid grid-cols-2 gap-4 w-full mb-4 px-2">
                        <div className="text-center">
                            <div className="text-accent-green font-black text-[13px] tracking-widest">
                                {stats?.totalSmallVolume ? `₹${stats.totalSmallVolume.toLocaleString()}` : "₹0"}
                            </div>
                            <div className="text-white/30 font-black text-[9px] uppercase tracking-tighter">
                                {stats?.totalSmallUsers ? `${stats.totalSmallUsers} USERS` : "0 USERS"}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-accent-red font-black text-[13px] tracking-widest">
                                {stats?.totalBigVolume ? `₹${stats.totalBigVolume.toLocaleString()}` : "₹0"}
                            </div>
                            <div className="text-white/30 font-black text-[9px] uppercase tracking-tighter">
                                {stats?.totalBigUsers ? `${stats.totalBigUsers} USERS` : "0 USERS"}
                            </div>
                        </div>
                    </div>

                    {/* Result Push Header */}
                    <div className="text-center text-primary font-black text-[10px] uppercase tracking-widest mb-6 border-b border-primary/20 pb-4 inline-block px-4 mt-6">
                        PUSH RESULT FOR {manualPeriod}
                    </div>

                    {/* SMALL / BIG Push Buttons (Always Visible) */}
                    <div className="flex gap-4 w-full mb-10">
                        <button
                            onClick={() => handleResultPush('Small')}
                            disabled={pushing !== null}
                            className={`flex-1 font-black py-4 rounded-xl shadow-lg transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 ${session?.winningOutcome === 'Small'
                                ? 'bg-accent-green text-black shadow-[0_0_20px_rgba(52,199,89,0.5)]'
                                : 'bg-surface border border-accent-green/30 text-accent-green hover:bg-accent-green/10'
                                }`}
                        >
                            {pushing === 'Small' && <Loader2 size={16} className="animate-spin" />}
                            SMALL
                        </button>
                        <button
                            onClick={() => handleResultPush('Big')}
                            disabled={pushing !== null}
                            className={`flex-1 font-black py-4 rounded-xl shadow-lg transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 ${session?.winningOutcome === 'Big'
                                ? 'bg-accent-red text-white shadow-[0_0_20px_rgba(255,59,48,0.5)]'
                                : 'bg-surface border border-accent-red/30 text-accent-red hover:bg-accent-red/10'
                                }`}
                        >
                            {pushing === 'Big' && <Loader2 size={16} className="animate-spin" />}
                            BIG
                        </button>
                    </div>

                    {/* PAST Results Table */}
                    <div className="w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-5 bg-primary rounded-full shadow-gold"></div>
                            <h3 className="font-black text-white uppercase tracking-widest text-xs">PAST RESULTS</h3>
                        </div>
                        <table className="w-full text-center border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="py-2 text-primary font-black text-[10px] tracking-widest border-b border-primary/20 w-1/3">PERIOD NO.</th>
                                    <th className="py-2 text-primary font-black text-[10px] tracking-widest border-b border-primary/20 w-1/3">RESULT</th>
                                    <th className="py-2 border-b border-primary/20 w-1/3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(recentPeriods || []).slice(0, 5).map((item: any, i: number) => (
                                    <tr key={item._id} className="bg-surface border-y border-white/5 transition-colors group">
                                        <td className="py-4 text-white font-bold text-xs tracking-wider rounded-l-xl">{item.period}</td>
                                        <td className={`py-4 font-bold text-sm tracking-widest ${item.status === 'completed'
                                            ? (item.result === 'BIG' ? 'text-accent-green' : 'text-accent-red')
                                            : 'text-white/30 italic'
                                            }`}>
                                            {updatingPeriodId === item._id ? (
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={() => handleUpdateResult(item._id, 'BIG')} className="bg-accent-green text-[9px] px-2 py-1 rounded-md text-black font-black uppercase tracking-tighter">Big</button>
                                                    <button onClick={() => handleUpdateResult(item._id, 'SMALL')} className="bg-accent-red text-[9px] px-2 py-1 rounded-md text-white font-black uppercase tracking-tighter">Small</button>
                                                </div>
                                            ) : (
                                                item.status === 'completed' ? (item.result === 'BIG' ? 'Big' : 'Small') : 'WAITING'
                                            )}
                                        </td>
                                        <td className="py-4 flex justify-center rounded-r-xl pr-4">
                                            {updatingPeriodId === item._id ? (
                                                <button onClick={() => setUpdatingPeriodId(null)} className="text-white/30 text-[9px] font-black underline uppercase tracking-widest">CANCEL</button>
                                            ) : (
                                                <button
                                                    onClick={() => setUpdatingPeriodId(item._id)}
                                                    className="text-black text-[9px] font-black px-4 py-1.5 rounded uppercase tracking-widest bg-primary shadow-gold active:scale-95 transition-transform"
                                                >
                                                    EDIT
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(!recentPeriods || recentPeriods.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="py-10 text-center text-white/30 text-[10px] uppercase tracking-widest">NO PERIODS FOUND IN THIS SESSION</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="px-6 mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-5 bg-primary rounded-full shadow-gold"></div>
                    <h3 className="font-black text-white uppercase tracking-widest text-xs">HISTORY VIEWS</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        href="/admin/wingo/result-history"
                        className="bg-surface rounded-2xl border border-primary/20 p-5 text-center group hover:scale-[1.02] transition-transform active:scale-95 shadow-lg relative overflow-hidden"
                    >
                        <div className="font-black text-white text-[11px] uppercase tracking-widest mb-6 leading-relaxed relative z-10">
                            RESULT<br />HISTORY
                        </div>
                        <div className="text-primary text-[10px] font-black flex items-center justify-center gap-1 uppercase tracking-widest relative z-10">
                            Open <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                    <Link
                        href="/admin/wingo/prediction-history"
                        className="bg-surface rounded-2xl border border-primary/20 p-5 text-center group hover:scale-[1.02] transition-transform active:scale-95 shadow-lg relative overflow-hidden"
                    >
                        <div className="font-black text-white text-[11px] uppercase tracking-widest mb-6 leading-relaxed relative z-10">
                            PREDICTION<br />HISTORY
                        </div>
                        <div className="text-primary text-[10px] font-black flex items-center justify-center gap-1 uppercase tracking-widest relative z-10">
                            Open <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
