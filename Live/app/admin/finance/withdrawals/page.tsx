'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Clock, FileText, Image as ImageIcon } from 'lucide-react';

export default function WithdrawalsQueue() {
    const [searchTerm, setSearchTerm] = useState('');
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });
            if (statusFilter) query.append('status', statusFilter.toLowerCase());

            const res = await fetch(`/api/admin/finance/withdrawals?${query.toString()}`);
            const json = await res.json();
            if (json.success) {
                setWithdrawals(json.data);
                setTotalItems(json.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [page, statusFilter]);

    const handleAction = async (transactionId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;

        let reason = '';
        if (action === 'reject') {
            const inputReason = prompt('Please enter a reason for rejection (optional):');
            if (inputReason === null) return; // Cancelled
            reason = inputReason.trim();
        }

        try {
            const res = await fetch('/api/admin/finance/withdrawals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId, action, reason })
            });
            const json = await res.json();
            if (json.success) {
                // Remove or update the item in the list
                setWithdrawals(prev => prev.map(w => w._id === transactionId ? { ...w, status: action === 'approve' ? 'approved' : 'rejected' } : w));
            } else {
                alert(json.error || `Failed to ${action}`);
            }
        } catch (error) {
            console.error(`Failed to ${action} withdrawal:`, error);
        }
    };

    // Filter locally by search term for now, since API doesn't support complex joins on search yet
    const filteredWithdrawals = withdrawals.filter(w =>
        !searchTerm ||
        w._id.includes(searchTerm) ||
        (w.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.method?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    const todayPayouts = withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Withdrawal Requests</h1>
                    <p className="text-sm text-white/50 mt-1">Manage, approve, or deny user withdrawal requests.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-surface border border-white/5 px-4 py-2 rounded-lg flex flex-col items-center shadow-lg">
                        <span className="text-xs text-white/50 uppercase">Loaded Pending</span>
                        <span className="font-bold text-accent-gold text-lg">{pendingCount}</span>
                    </div>
                    <div className="bg-surface border border-white/5 px-4 py-2 rounded-lg flex flex-col items-center shadow-lg">
                        <span className="text-xs text-white/50 uppercase">Loaded Payouts</span>
                        <span className="font-bold text-accent-green text-lg">₹ {todayPayouts.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, User, or Method..."
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none text-white capitalize"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button onClick={fetchWithdrawals} className="bg-background border border-white/10 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <Filter size={18} className="text-white/70" />
                    </button>
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-2xl w-full bg-[#111] p-2 rounded-xl border border-white/10 flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button className="absolute -top-10 right-0 text-white/50 hover:text-white" onClick={() => setPreviewImage(null)}>
                            Close
                        </button>
                        <img src={previewImage} alt="Payment Screenshot" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                    </div>
                </div>
            )}

            {/* Withdrawals Table */}
            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/40 text-white/50 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">Request Details</th>
                                <th className="px-6 py-4 font-medium tracking-wider">User</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Payout Method</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((req) => (
                                <tr key={req._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white truncate max-w-[150px]">{req._id}</div>
                                        <div className="text-xs text-white/40 flex items-center gap-1 mt-1">
                                            <Clock size={12} /> {new Date(req.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white/90">{req.user?.name || req.userId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white/80 flex items-center gap-2">
                                            {req.method || 'Unknown'}
                                            {req.screenshot && (
                                                <button onClick={() => setPreviewImage(req.screenshot)} className="text-[#f97316] hover:text-[#ea580c] transition-colors" title="View Screenshot">
                                                    <ImageIcon size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-xs text-white/50 truncate max-w-[200px]">
                                            {req.walletAddress || req.bankDetails?.accountNumber || 'N/A'}
                                        </div>
                                        <div className="text-xs text-white/40 mt-1">
                                            UTR: {req.txnId || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-lg text-white">₹ {(req.amount || 0).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${req.status === 'pending' ? 'bg-[#f07b22]/10 text-[#f07b22] border border-[#f07b22]/20' :
                                            req.status === 'approved' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                                                'bg-accent-red/10 text-accent-red border border-accent-red/20'
                                            }`}>
                                            {req.status === 'pending' && <Clock size={12} />}
                                            {req.status === 'approved' && <CheckCircle2 size={12} />}
                                            {req.status === 'rejected' && <XCircle size={12} />}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {req.status === 'pending' ? (
                                                <>
                                                    <button onClick={() => handleAction(req._id, 'approve')} className="p-1.5 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green rounded transition-colors" title="Approve">
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleAction(req._id, 'reject')} className="p-1.5 bg-accent-red/10 hover:bg-accent-red/20 text-accent-red rounded transition-colors" title="Reject">
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => req.screenshot && setPreviewImage(req.screenshot)} className={`p-1.5 rounded transition-colors ${req.screenshot ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'bg-transparent text-white/20'}`} title={req.screenshot ? "View Screenshot" : "No Screenshot"} disabled={!req.screenshot}>
                                                    <ImageIcon size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                                        No withdrawal requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-white/50">
                    <div>Showing limit 20 out of {totalItems} total requests</div>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 transition-colors">Prev</button>
                        <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors" onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            </div>

        </div>
    );
}
