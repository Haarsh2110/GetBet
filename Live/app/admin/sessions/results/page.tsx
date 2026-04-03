'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, Calendar, RefreshCcw } from 'lucide-react';

const mockResults = [
    { period: '1006678', game: 'Win Go 1M', resultTime: '2025-08-16 16:00', winner: 'Big', color: 'Green', status: 'Settled', appeals: 0 },
    { period: '3002214', game: 'Win Go 3M', resultTime: '2025-08-16 15:57', winner: 'Small', color: 'Red', status: 'Settled', appeals: 0 },
    { period: '#9944', game: 'Aviator', resultTime: '2025-08-16 15:55', winner: 'Crushed @ 2.45x', color: 'Neutral', status: 'Disputed', appeals: 3 },
    { period: '1006677', game: 'Win Go 1M', resultTime: '2025-08-16 15:59', winner: 'Number 5', color: 'Violet/Green', status: 'Settled', appeals: 1 },
];

export default function SessionResults() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalSessions, setTotalSessions] = useState(0);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (dateFilter) query.append('date', dateFilter);
            if (statusFilter) query.append('status', statusFilter);

            const res = await fetch(`/api/admin/sessions?${query.toString()}`);
            const json = await res.json();
            if (json.success) {
                setSessions(json.data);
                setTotalSessions(json.total || json.data.length);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [dateFilter, statusFilter]);

    const filteredSessions = sessions.filter(s =>
        !searchTerm ||
        s.period.includes(searchTerm) ||
        s.game.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Results & Appeals</h1>
                    <p className="text-sm text-white/50 mt-1">Track published session outcomes and review user appeals.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-surface border border-white/5 px-4 py-2 rounded-lg flex flex-col items-center shadow-lg">
                        <span className="text-xs text-white/50 uppercase">Total Sessions on Date</span>
                        <span className="font-bold text-accent-gold text-lg">{totalSessions}</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Period ID or Game..."
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            type="date"
                            className="bg-background border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Settled">Settled</option>
                        <option value="Disputed">Disputed</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                    <button onClick={fetchSessions} disabled={loading} className="bg-background border border-white/10 p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50">
                        <RefreshCcw size={18} className={`text-white/70 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/40 text-white/50 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">Game & Period</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Result Time</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Winning Outcome</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-center">Appeals</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && sessions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </td>
                                </tr>
                            ) : filteredSessions.length > 0 ? filteredSessions.map((session, i) => (
                                <tr key={session._id || i} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{session.game}</div>
                                        <div className="font-mono text-xs text-white/50 mt-1">{session.period}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">{new Date(session.endTime || session.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{session.winningOutcome || 'Pending'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${['Settled', 'Completed'].includes(session.status) ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                                                session.status === 'Disputed' ? 'bg-[#f07b22]/10 text-[#f07b22] border border-[#f07b22]/20' :
                                                    'bg-white/10 text-white border border-white/20'
                                            }`}>
                                            {['Settled', 'Completed'].includes(session.status) ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {session.appealsCount > 0 ? (
                                            <span className="bg-[#f07b22]/20 text-[#f07b22] px-2 py-0.5 rounded-full font-bold text-xs">
                                                {session.appealsCount}
                                            </span>
                                        ) : (
                                            <span className="text-white/20">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-primary hover:text-primary-light text-xs uppercase tracking-wider font-semibold transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                                        No sessions found for this date.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
