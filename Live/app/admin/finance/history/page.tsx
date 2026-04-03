'use client';

import { useState } from 'react';
import { Search, Filter, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';

const mockLedger = [
    { id: 'PAY-9012', date: '2025-08-16 11:30', user: 'USR-1002 (Jane)', type: 'Deposit', method: 'UPI', amount: 5000, status: 'Completed', ref: 'UPI/50123910293' },
    { id: 'PAY-9011', date: '2025-08-16 10:45', user: 'USR-1004 (Harvey)', type: 'Deposit', method: 'Bank Transfer', amount: 50000, status: 'Completed', ref: 'IMPS/99882211' },
    { id: 'PAY-9010', date: '2025-08-15 09:20', user: 'USR-1005 (Rachel)', type: 'Withdrawal', method: 'UPI', amount: -3000, status: 'Completed', ref: 'WD-5080' },
    { id: 'PAY-9009', date: '2025-08-15 08:15', user: 'USR-1008 (Admin)', type: 'Adjustment (Credit)', method: 'Manual', amount: 1500, status: 'Completed', ref: 'Ticket #402 Refund' },
    { id: 'PAY-9008', date: '2025-08-14 20:00', user: 'USR-1001 (John)', type: 'Deposit', method: 'Crypto (USDT)', amount: 150000, status: 'Completed', ref: 'TxHash: 0x99a...' },
];

export default function PaymentLedger() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Payment Ledger</h1>
                    <p className="text-sm text-white/50 mt-1">Full history of external deposits, withdrawals, and manual adjustments.</p>
                </div>
                <button className="bg-surface border border-white/10 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
                    <Download size={18} /> Export Report
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Txn ID, User, or Ref..."
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none">
                        <option value="">All Transaction Types</option>
                        <option value="Deposit">Deposits</option>
                        <option value="Withdrawal">Withdrawals</option>
                        <option value="Adjustment">Adjustments</option>
                    </select>
                    <input type="date" className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none flex-1 md:flex-none text-white/70" />
                    <button className="bg-background border border-white/10 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <Filter size={18} className="text-white/70" />
                    </button>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-white/50 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                                <th className="px-6 py-4 font-medium tracking-wider">User</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Type & Method</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Reference Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockLedger.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white/90">{item.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-white">{item.user}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {item.amount > 0 ? <ArrowDownLeft size={16} className="text-accent-green" /> : <ArrowUpRight size={16} className="text-accent-red" />}
                                            <span className="font-medium text-white/90">{item.type}</span>
                                        </div>
                                        <div className="text-xs text-white/40 mt-1">{item.method}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold ${item.amount > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                            {item.amount > 0 ? '+' : ''}₹ {Math.abs(item.amount).toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded inline-block">
                                            {item.ref}
                                        </div>
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
