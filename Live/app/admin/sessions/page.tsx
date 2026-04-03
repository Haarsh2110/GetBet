'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Clock, Play, Square, Settings, Users, Plus, X, Save, PlusCircle, MinusCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { CountdownTimer } from '@/components/admin/SessionModals';

const CreateSessionModal = dynamic(
    () => import('@/components/admin/SessionModals').then(mod => mod.CreateSessionModal),
    { ssr: false }
);

const AdvancedSettingsModal = dynamic(
    () => import('@/components/admin/SessionModals').then(mod => mod.AdvancedSettingsModal),
    { ssr: false }
);

export default function SessionsManagement() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSessionData, setNewSessionData] = useState({ game: 'WinGo', timerIntervalMinutes: 1, period: '' });

    // Settings Modal State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [settingsForm, setSettingsForm] = useState({
        bettingEnabled: true,
        autoResult: true,
        resultDelaySeconds: 0,
        tempResult: '',
        durationEditMinutes: 0,
        currentPeriod: '',
        upcomingPeriod: ''
    });

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/admin/sessions', { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                setSessions(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 15000);
        return () => clearInterval(interval);
    }, []);

    const toggleStatus = async (sessionId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Running' ? 'Suspended' : 'Running';
        try {
            const res = await fetch('/api/admin/sessions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sessionId, status: newStatus })
            });
            const json = await res.json();
            if (json.success && json.data) {
                setSessions(prev => prev.map(s => s._id === sessionId ? json.data : s));
            }
        } catch (error) {
            console.error('Failed to change session status:', error);
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const timerMs = newSessionData.timerIntervalMinutes * 60 * 1000;
            const payload = {
                sessionId: `${newSessionData.game.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                game: newSessionData.game,
                period: newSessionData.period || `${Math.floor(Date.now() / 1000)}`,
                timerIntervalMs: timerMs,
                startTime: new Date(),
                endTime: new Date(Date.now() + timerMs),
                status: 'Running'
            };
            const res = await fetch('/api/admin/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                setSessions([json.data, ...sessions]);
                setIsCreateModalOpen(false);
            } else {
                alert('Failed to create session: ' + json.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error creating session');
        }
    };

    // State for Settings Modal Extended
    const [activeTab, setActiveTab] = useState<'config' | 'analytics'>('config');
    const [livePlayers, setLivePlayers] = useState<any[]>([]);
    const [poolDistribution, setPoolDistribution] = useState<any>({});
    const [totalLivePool, setTotalLivePool] = useState(0);

    const openSettings = (session: any) => {
        setSelectedSession(session);
        setSettingsForm({
            bettingEnabled: session.bettingEnabled ?? true,
            autoResult: session.autoResult ?? true,
            resultDelaySeconds: session.resultDelaySeconds ?? 0,
            tempResult: session.winningOutcome || '',
            durationEditMinutes: Math.round(session.timerIntervalMs / 60000),
            currentPeriod: session.currentPeriod || '',
            upcomingPeriod: session.upcomingPeriod || ''
        });
        setActiveTab('config');
        setIsSettingsModalOpen(true);
        fetchLiveAnalytics(session._id);
    };

    const fetchLiveAnalytics = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/admin/sessions/live-players?sessionId=${sessionId}`);
            const json = await res.json();
            if (json.success) {
                setLivePlayers(json.data.players || []);
                setPoolDistribution(json.data.distribution || {});
                setTotalLivePool(json.data.totalPool || 0);
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    };

    const handlePlayerAction = async (action: 'kick' | 'block', betId?: string, userId?: string) => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            const res = await fetch('/api/admin/sessions/live-players', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, betId, userId })
            });
            const json = await res.json();
            if (json.success) {
                // Refresh analytics
                fetchLiveAnalytics(selectedSession._id);
            } else alert(json.error);
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;

        try {
            const payload = {
                id: selectedSession._id,
                bettingEnabled: settingsForm.bettingEnabled,
                autoResult: settingsForm.autoResult,
                resultDelaySeconds: settingsForm.resultDelaySeconds,
                winningOutcome: settingsForm.tempResult || undefined,
                totalDurationMs: settingsForm.durationEditMinutes * 60 * 1000,
                currentPeriod: settingsForm.currentPeriod || undefined,
                upcomingPeriod: settingsForm.upcomingPeriod || undefined
            };

            const res = await fetch('/api/admin/sessions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success && json.data) {
                setSessions(prev => prev.map(s => s._id === selectedSession._id ? json.data : s));
                // Do not close modal, so the admin can keep editing
                // setIsSettingsModalOpen(false);
                alert('Settings saved successfully!');
            } else {
                alert('Failed to update session settings');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving settings');
        }
    };

    const adjustTime = async (seconds: number) => {
        if (!selectedSession) return;
        try {
            const newEndTime = new Date(new Date(selectedSession.endTime).getTime() + (seconds * 1000));

            const res = await fetch('/api/admin/sessions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedSession._id, endTime: newEndTime.toISOString() })
            });
            const json = await res.json();
            if (json.success && json.data) {
                setSessions(prev => prev.map(s => s._id === selectedSession._id ? json.data : s));
                setSelectedSession(json.data); // Update modal view
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Helper: Profit/Loss calculation based on tempResult
    const calculateProjection = () => {
        if (!settingsForm.tempResult || Object.keys(poolDistribution).length === 0) return { pnl: totalLivePool, color: 'text-accent-green' };

        const outcome = settingsForm.tempResult;
        let payout = 0;

        // Simple mock calculation logic: if tempResult matches a key, we pay 2x (just for demo purposes)
        if (poolDistribution[outcome]) {
            payout += poolDistribution[outcome] * 2;
        } else if (outcome === 'Green' || outcome === 'Red') {
            // Check numbers that match colors potentially, just simple mock
            payout += (poolDistribution[outcome] || 0) * 2;
        }

        const pnl = totalLivePool - payout;
        return {
            pnl,
            color: pnl >= 0 ? 'text-accent-green' : 'text-accent-red'
        };
    };

    const projection = calculateProjection();

    return (
        <div className="space-y-6 max-w-7xl mx-auto position-relative">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Active Sessions Control</h1>
                    <p className="text-sm text-white/50 mt-1">Monitor real-time game participation, pool sizes, and manage session lifecycles.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> New Session
                </button>
            </div>

            {loading && sessions.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center text-white/50 py-12 bg-surface rounded-2xl border border-white/5">
                    No active sessions found. The system will create them automatically or you can force start a session.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
                    {sessions.map(session => (
                        <div key={session._id} className="bg-surface border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                            {/* Live Glow */}
                            {session.status === 'Running' && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors pointer-events-none"></div>
                            )}

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                                        {session.game}
                                        {session.bettingEnabled === false && <span className="text-[10px] bg-accent-red/20 text-accent-red px-2 py-0.5 rounded-full">Betting Closed</span>}
                                    </h3>
                                    <div className="text-sm text-white/50 mt-1 flex items-center gap-2">
                                        Period <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{session.period}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${session.status === 'Running' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-accent-red/10 text-accent-red border border-accent-red/20'}`}>
                                    {session.status === 'Running' ? <Activity size={12} className="animate-pulse" /> : <Square size={12} fill="currentColor" />}
                                    {session.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
                                <div className="bg-background rounded-xl p-3 border border-white/5">
                                    <div className="text-xs text-white/40 uppercase mb-1 flex items-center gap-1"><Clock size={12} /> Time Left</div>
                                    <div className="text-lg font-mono font-bold text-white">
                                        <CountdownTimer endTime={session.endTime} status={session.status} pausedTime={session.pausedTime} />
                                    </div>
                                </div>
                                <div className="bg-background rounded-xl p-3 border border-white/5">
                                    <div className="text-xs text-white/40 uppercase mb-1 flex items-center gap-1"><Users size={12} /> Players</div>
                                    <div className="text-lg font-sans font-bold text-white">{session.participantsCount || 0}</div>
                                </div>
                                <div className="bg-background rounded-xl p-3 border border-white/5">
                                    <div className="text-xs text-white/40 uppercase mb-1">Total Pool</div>
                                    <div className="text-lg font-sans font-bold text-accent-gold">₹ {((session.totalPool || 0) / 1000).toFixed(1)}k</div>
                                </div>
                            </div>

                            <div className="flex gap-3 relative z-10 border-t border-white/5 pt-6">
                                {session.status === 'Running' ? (
                                    <button onClick={() => toggleStatus(session._id, session.status)} className="flex-1 bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/20 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors">
                                        <Square size={16} fill="currentColor" /> Suspend
                                    </button>
                                ) : (
                                    <button onClick={() => toggleStatus(session._id, session.status)} className="flex-1 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/20 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors">
                                        <Play size={16} fill="currentColor" /> Resume
                                    </button>
                                )}
                                <button onClick={() => openSettings(session)} className="px-4 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-lg flex items-center justify-center transition-colors border border-white/5">
                                    <Settings size={18} />
                                </button>
                                <Link href="/admin/sessions/results" className="px-4 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-lg flex items-center justify-center transition-colors border border-white/5">
                                    Results
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Session Modal dynamically loaded */}
            <CreateSessionModal
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
                newSessionData={newSessionData}
                setNewSessionData={setNewSessionData}
                handleCreateSession={handleCreateSession}
            />

            {/* Advanced Settings Modal dynamically loaded */}
            <AdvancedSettingsModal
                isSettingsModalOpen={isSettingsModalOpen}
                setIsSettingsModalOpen={setIsSettingsModalOpen}
                selectedSession={selectedSession}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                adjustTime={adjustTime}
                settingsForm={settingsForm}
                setSettingsForm={setSettingsForm}
                handleSaveSettings={handleSaveSettings}
                totalLivePool={totalLivePool}
                projection={projection}
                poolDistribution={poolDistribution}
                livePlayers={livePlayers}
                handlePlayerAction={handlePlayerAction}
            />
        </div>
    );
}


