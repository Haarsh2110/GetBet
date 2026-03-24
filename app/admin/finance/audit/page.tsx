'use client';

import { Search, Filter, Activity, DollarSign, ArrowRightLeft } from 'lucide-react';

const mockAuditTrail = [
    { id: 'AUD-1044', timestamp: '2025-08-16 14:22:10', eventUser: 'System', eventType: 'Settlement', description: 'Win Go Period 1006675 settled. Total Payout: ₹45,000 to 12 users.', balanceImpact: -45000 },
    { id: 'AUD-1043', timestamp: '2025-08-16 14:20:05', eventUser: 'USR-1002', eventType: 'Bet Placement', description: 'Bet placed on Win Go Period 1006675 (Small)', balanceImpact: 5000 }, // From system perspective, user bet is system gain until settled
    { id: 'AUD-1042', timestamp: '2025-08-16 14:15:00', eventUser: 'Admin-Master', eventType: 'Manual Adjustment', description: 'Credited bonus to USR-1005 for promotion', balanceImpact: -500 },
    { id: 'AUD-1041', timestamp: '2025-08-16 14:00:12', eventUser: 'USR-1009', eventType: 'Deposit', description: 'UPI deposit via Gateway-A', balanceImpact: 10000 },
    { id: 'AUD-1040', timestamp: '2025-08-16 13:45:30', eventUser: 'System', eventType: 'Reversal', description: 'Auto-reversal for failed game round Aviator #992', balanceImpact: -2500 },
];

export default function FinancialAudit() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Financial Audit Trail</h1>
                    <p className="text-sm text-white/50 mt-1">Immutable record of all fund flows, system balances, and reversals.</p>
                </div>
            </div>

            {/* System Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface border border-white/5 rounded-xl p-5 shadow-lg">
                    <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2"><DollarSign size={14} /> Total System Liability</div>
                    <div className="text-2xl font-bold text-white mb-1">₹ 4,350,000</div>
                    <div className="text-xs text-white/40">Total active user balances</div>
                </div>
                <div className="bg-surface border border-white/5 rounded-xl p-5 shadow-lg">
                    <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2"><ArrowRightLeft size={14} /> 24h Flow (Net)</div>
                    <div className="text-2xl font-bold text-accent-green mb-1">+ ₹ 125,000</div>
                    <div className="text-xs text-white/40">Deposits - Withdrawals</div>
                </div>
                <div className="bg-surface border border-white/5 rounded-xl p-5 shadow-lg">
                    <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2"><Activity size={14} /> 24h Game GGR</div>
                    <div className="text-2xl font-bold text-accent-gold mb-1">₹ 48,500</div>
                    <div className="text-xs text-white/40">Gross Gaming Revenue</div>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden mt-6">
                <div className="p-4 border-b border-white/5 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input type="text" placeholder="Search Audit Logs..." className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                    <button className="bg-background border border-white/10 px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Filter size={16} /> Filter Events
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-white/50 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Trigger Identity</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Event Type</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Description</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-right">System Balance Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                            {mockAuditTrail.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white/60">{log.timestamp}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded ${log.eventUser === 'System' ? 'bg-[#23388e]/30 text-[#6082ff]' : log.eventUser.startsWith('Admin') ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/80'}`}>
                                            {log.eventUser}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/80">{log.eventType}</td>
                                    <td className="px-6 py-4 text-white/60 font-sans text-sm max-w-md truncate">{log.description}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${log.balanceImpact > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {log.balanceImpact > 0 ? '+' : ''}{log.balanceImpact.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
