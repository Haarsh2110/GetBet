'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, History, ArrowDownLeft, ArrowUpRight, Filter, Download, Loader2 } from 'lucide-react';

export default function UserHistory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    const fetchHistory = useCallback(async (reset = false) => {
        try {
            const currentPage = reset ? 1 : page;
            if (reset) {
                setLoading(true);
                setHistory([]);
            }

            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: '50',
                search: searchTerm,
                type: typeFilter,
                date: dateFilter,
            });

            const response = await fetch(`/api/admin/users/history?${queryParams}`);
            const result = await response.json();

            if (result.success) {
                setHistory(prev => reset ? result.data : [...prev, ...result.data]);
                setHasMore(currentPage < result.pagination.pages);
                setPage(currentPage + 1);
                setTotal(result.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, typeFilter, dateFilter, page]);

    useEffect(() => {
        fetchHistory(true);
    }, [searchTerm, typeFilter, dateFilter]); // Re-fetch on filter change

    const handleExportCSV = () => {
        const headers = ['Date & Time', 'User', 'Activity', 'Amount Impact', 'Details', 'Status'];
        const csvContent = [
            headers.join(','),
            ...history.map(item => `"${item.date}","${item.user}","${item.type}","${item.amount}","${item.detail}","${item.status}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'user_activity_history.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">User Activity History</h1>
                    <p className="text-sm text-white/50 mt-1">Detailed log of user participation, transactions, and outcomes.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="bg-surface border border-white/10 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors"
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by User ID, Name, Txn ID..."
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Activity Types</option>
                        <option value="Bet Placed">Bets Placed</option>
                        <option value="Win">Wins</option>
                        <option value="Deposit">Deposits</option>
                        <option value="Withdrawal">Withdrawals</option>
                    </select>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none flex-1 md:flex-none text-white/70"
                    />
                    <button
                        onClick={() => { setSearchTerm(''); setTypeFilter(''); setDateFilter(''); }}
                        className="bg-background border border-white/10 p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Clear Filters"
                    >
                        <Filter size={18} className="text-white/70" />
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-white/50 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 font-medium tracking-wider">User</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Activity</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-right">Amount Impact</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Details</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} /> Loading history...
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                                        No activity history found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{item.date.split(' ')[0]}</div>
                                            <div className="text-xs text-white/40">{item.date.split(' ')[1]}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-primary">{item.user.split(' ')[0]}</div>
                                            <div className="text-xs text-white/50">{item.user.split(' ')[1]}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {item.amount > 0 ? <ArrowDownLeft size={16} className="text-accent-green" /> : <ArrowUpRight size={16} className="text-accent-red" />}
                                                <span className="text-white/80">{item.type}</span>
                                            </div>
                                            <div className="text-xs text-white/40 mt-1">{item.game}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-display font-bold">
                                            <span className={item.amount > 0 ? 'text-accent-green' : 'text-accent-red'}>
                                                {item.amount > 0 ? '+' : ''}₹ {Math.abs(item.amount).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/60 text-xs">
                                            {item.detail}
                                            <div className="text-white/30 text-[10px] uppercase tracking-wider mt-1">{item.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.status.toLowerCase() === 'completed' || item.status.toLowerCase() === 'approved' ? 'bg-accent-green/10 text-accent-green' :
                                                    item.status.toLowerCase() === 'pending' ? 'bg-[#f07b22]/10 text-[#f07b22]' :
                                                        'bg-accent-red/10 text-accent-red'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-white/50 bg-black/20">
                    <div>Showing {history.length} of {total} entries</div>
                    {hasMore && (
                        <button
                            onClick={() => fetchHistory(false)}
                            disabled={loading}
                            className="text-primary hover:text-primary-light transition-colors text-xs uppercase tracking-wider font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : null}
                            Load More
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
