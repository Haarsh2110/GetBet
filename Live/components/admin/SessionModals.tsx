import { X, Activity, Save, PlusCircle, MinusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function CountdownTimer({ endTime, status, pausedTime }: { endTime: string | Date, status?: string, pausedTime?: string | Date }) {
    const [timeLeft, setTimeLeft] = useState('00:00');

    useEffect(() => {
        const updateTimer = () => {
            if (!endTime) return setTimeLeft('00:00');

            let referenceTime = new Date().getTime();
            if (status === 'Suspended' && pausedTime) {
                referenceTime = new Date(pausedTime).getTime();
            }

            const diff = new Date(endTime).getTime() - referenceTime;

            if (diff <= 0) {
                setTimeLeft('00:00');
                if (status === 'Running') {
                    // TODO: trigger session settle if it hits 0 and is still running
                }
                return;
            }

            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        updateTimer();
        if (status === 'Suspended') return;

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTime, status, pausedTime]);

    return <>{timeLeft}</>;
}

export function CreateSessionModal({
    isCreateModalOpen,
    setIsCreateModalOpen,
    newSessionData,
    setNewSessionData,
    handleCreateSession
}: any) {
    if (!isCreateModalOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative">
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                    <h3 className="font-display font-bold text-lg text-white">Create New Session</h3>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateSession} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Game Type</label>
                        <select
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            value={newSessionData.game}
                            onChange={(e) => setNewSessionData({ ...newSessionData, game: e.target.value })}
                            required
                        >
                            <option value="WinGo">Win Go</option>
                            <option value="Aviator">Aviator</option>
                            <option value="Limbo">Limbo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5 flex justify-between">
                            <span>Period Number</span>
                            <span className="text-[10px] text-white/40">Optional (leaves auto-generated if empty)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 1006664"
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            value={newSessionData.period || ''}
                            onChange={(e) => setNewSessionData({ ...newSessionData, period: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Timer Interval (Minutes)</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            value={newSessionData.timerIntervalMinutes}
                            onChange={(e) => setNewSessionData({ ...newSessionData, timerIntervalMinutes: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors border border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors"
                        >
                            Spawn Session
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AdvancedSettingsModal({
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    selectedSession,
    activeTab,
    setActiveTab,
    adjustTime,
    settingsForm,
    setSettingsForm,
    handleSaveSettings,
    totalLivePool,
    projection,
    poolDistribution,
    livePlayers,
    handlePlayerAction
}: any) {
    if (!isSettingsModalOpen || !selectedSession) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-white/5 shrink-0">
                    <div>
                        <h3 className="font-display font-bold text-lg text-white">Session Dashboard</h3>
                        <p className="text-xs text-white/50">{selectedSession.game} - {selectedSession.period}</p>
                    </div>
                    <button onClick={() => setIsSettingsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Custom Tabs Navigation */}
                <div className="flex border-b border-white/5 shrink-0">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white/80'}`}
                    >
                        Settings & Time
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white/80'}`}
                    >
                        <Activity size={14} /> Live Analytics & Players
                    </button>
                </div>

                <div className="p-5 overflow-y-auto w-full">
                    {activeTab === 'config' ? (
                        <div className="space-y-6">
                            {/* Live Time Adjuster */}
                            <div className="bg-background border border-white/5 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center justify-between">
                                    <span>Live Time Adjustment</span>
                                    <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded text-xs">
                                        <CountdownTimer endTime={selectedSession.endTime} status={selectedSession.status} pausedTime={selectedSession.pausedTime} />
                                    </span>
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => adjustTime(-60)} className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg flex flex-col items-center justify-center gap-1">
                                        <MinusCircle size={14} className="text-accent-red" /> 1 min
                                    </button>
                                    <button onClick={() => adjustTime(-30)} className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg flex flex-col items-center justify-center gap-1">
                                        <MinusCircle size={14} className="text-accent-red" /> 30 sec
                                    </button>
                                    <button onClick={() => adjustTime(30)} className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg flex flex-col items-center justify-center gap-1">
                                        <PlusCircle size={14} className="text-accent-green" /> 30 sec
                                    </button>
                                    <button onClick={() => adjustTime(60)} className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg flex flex-col items-center justify-center gap-1">
                                        <PlusCircle size={14} className="text-accent-green" /> 1 min
                                    </button>
                                </div>
                            </div>

                            <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-4">
                                {/* Total Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5 flex justify-between">
                                        <span>Total Duration Edit</span>
                                        <span className="text-[10px] text-white/40">Modifies base duration</span>
                                    </label>
                                    <div className="flex relative items-center">
                                        <input
                                            type="number"
                                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            value={settingsForm.durationEditMinutes}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, durationEditMinutes: Number(e.target.value) })}
                                        />
                                        <span className="absolute right-4 text-xs text-white/40">Minutes</span>
                                    </div>
                                </div>

                                {/* Betting Toggle */}
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div>
                                        <div className="text-sm font-medium text-white">Betting Enabled</div>
                                        <div className="text-xs text-white/50">Allow users to place bets</div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settingsForm.bettingEnabled ? 'bg-primary' : 'bg-white/10'}`} onClick={() => setSettingsForm({ ...settingsForm, bettingEnabled: !settingsForm.bettingEnabled })}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settingsForm.bettingEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>

                                {/* Auto Result Toggle */}
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div>
                                        <div className="text-sm font-medium text-white">Auto Result Engine</div>
                                        <div className="text-xs text-white/50">System calculates outcomes</div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settingsForm.autoResult ? 'bg-primary' : 'bg-white/10'}`} onClick={() => setSettingsForm({ ...settingsForm, autoResult: !settingsForm.autoResult })}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settingsForm.autoResult ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>

                                {/* Result Delay */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">Result Processing Delay (Seconds)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        value={settingsForm.resultDelaySeconds}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, resultDelaySeconds: Number(e.target.value) })}
                                    />
                                </div>

                                {/* Period Management */}
                                <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                                    <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center justify-between">
                                        <span>Period Tracking Control</span>
                                        <span className="text-[10px] text-white/40">Syncs to Frontend Play Area</span>
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-white/50 mb-1.5">Current Period</label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                                value={settingsForm.currentPeriod}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, currentPeriod: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-white/50 mb-1.5">Upcoming Period</label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                                value={settingsForm.upcomingPeriod}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, upcomingPeriod: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="pt-4 border-t border-white/5 flex gap-2">
                                <button
                                    type="submit"
                                    form="settings-form"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Apply Config Settings
                                </button>
                            </div>

                            {/* Manual Fast Result Submission */}
                            <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                                <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center justify-between">
                                    <span>Declare Action / Result Push</span>
                                    <span className="text-[10px] text-accent-green">Updates Frontend History instantly</span>
                                </h4>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const period = formData.get('period') as string;
                                    const result = formData.get('result') as string;
                                    const isRed = result === 'Big' || result === 'Red'; // Simple arbitrary logic for red styling

                                    try {
                                        const res = await fetch('/api/admin/sessions', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ id: selectedSession._id, action: 'addPastResult', period, result, isRed })
                                        });
                                        if (res.ok) alert('Result pushed successfully!');
                                    } catch (err) { alert('Failed to push result'); }
                                }} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-white/50 mb-1.5">Period</label>
                                        <input
                                            name="period"
                                            type="text"
                                            placeholder="e.g. 100888"
                                            className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white"
                                            value={settingsForm.currentPeriod || ''}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, currentPeriod: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-white/50 mb-1.5">Result</label>
                                        <select name="result" className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white" required>
                                            <option value="Small">Small</option>
                                            <option value="Big">Big</option>
                                            <option value="Green">Green</option>
                                            <option value="Red">Red</option>
                                            <option value="Violet">Violet</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="bg-accent-green hover:bg-accent-green/90 text-white py-2 px-4 rounded-xl font-bold transition-colors">
                                        Push Result
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Analytics Top Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background border border-white/5 rounded-xl p-4">
                                    <div className="text-xs text-white/40 uppercase mb-1">Total Live Pool</div>
                                    <div className="text-2xl font-sans font-bold text-white">₹ {(totalLivePool || 0).toLocaleString('en-IN')}</div>
                                </div>
                                <div className="bg-background border border-white/5 rounded-xl p-4">
                                    <div className="text-xs text-white/40 uppercase mb-1">P/L Projection (Vs Temp Result)</div>
                                    <div className={`text-2xl font-sans font-bold ${projection?.color}`}>
                                        {projection?.pnl >= 0 ? '+' : '-'} ₹ {Math.abs(projection?.pnl || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>

                            {/* Pool Distribution */}
                            <div className="bg-background border border-white/5 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-white/70 mb-3">Live Pool Distribution</h4>
                                {Object.keys(poolDistribution).length === 0 ? (
                                    <div className="text-xs text-white/40 text-center py-4">No active bets</div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(poolDistribution).map(([choice, amount]: [string, any]) => (
                                            <div key={choice} className="flex-1 min-w-[30%] bg-surface border border-white/5 p-2 rounded-lg">
                                                <div className="text-xs text-white/50">{choice}</div>
                                                <div className="text-sm font-bold text-white">₹ {amount.toLocaleString('en-IN')}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Live Players List */}
                            <div className="bg-background border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-white/5">
                                    <h4 className="text-sm font-medium text-white/70">Live Players ({livePlayers.length})</h4>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-black/40 text-white/50 uppercase text-[10px] sticky top-0 backdrop-blur-md">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Player</th>
                                                <th className="px-4 py-2 font-medium text-right">Bet Amnt</th>
                                                <th className="px-4 py-2 font-medium">Choice</th>
                                                <th className="px-4 py-2 font-medium text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {livePlayers.length > 0 ? livePlayers.map((player: any) => (
                                                <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-4 py-2 text-white">
                                                        <div className="font-semibold block truncate max-w-[100px]">{player.userName}</div>
                                                        <div className="text-[10px] text-white/40">{player.userId}</div>
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium text-accent-gold">
                                                        ₹ {player.amount}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <span className="px-2 py-0.5 rounded bg-white/10 text-xs">{player.choice}</span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handlePlayerAction('kick', player.id)} className="bg-white/5 hover:bg-white/10 text-white/70 p-1.5 rounded text-xs transition-colors" title="Kick (Remove Bet)">Kick</button>
                                                            <button onClick={() => handlePlayerAction('block', undefined, player.userId)} className="bg-accent-red/10 hover:bg-accent-red/20 text-accent-red p-1.5 rounded text-xs transition-colors" title="Block User Account">Block</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-white/40">No live players in this session.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
