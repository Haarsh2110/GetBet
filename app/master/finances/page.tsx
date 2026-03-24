'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Wallet, 
    ChevronLeft, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    Search,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Filter
} from 'lucide-react';

interface Transaction {
    _id: string;
    userId: string;
    amount: number;
    type: string;
    status: string;
    method: string;
    remark: string;
    createdAt: string;
}

export default function MasterFinances() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | 'Deposit' | 'Withdraw' | 'Manual'>('All');

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/master/transactions');
            const data = await res.json();
            if (data.success) {
                setTransactions(data.transactions);
            }
        } catch (err) {
            console.error('Master Finance Sync Fail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(t => {
        // Search Filter
        const matchesSearch = t.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (t.remark || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        // Tab Filter
        const typeMatch = (activeTab === 'All') || 
                         (activeTab === 'Deposit' && t.type === 'deposit') || 
                         (activeTab === 'Withdraw' && t.type === 'withdraw') || 
                         (activeTab === 'Manual' && t.method === 'admin_manual');

        return matchesSearch && typeMatch;
    });

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-primary text-[10px] font-black tracking-widest uppercase">Decryption In Progress...</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <button 
                        onClick={() => router.push('/master')}
                        className="hidden md:flex items-center gap-2 text-gray-400 hover:text-primary transition text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ChevronLeft size={14} /> Intelligence Hub
                    </button>
                    <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        Finance <span className="text-primary font-black italic">Hub</span>
                    </h1>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-4">Global Transaction Ledger & Audit Logs</p>
                </div>

                <div className="flex gap-3">
                     <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by UID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 outline-none focus:border-primary/40 transition text-sm font-black shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* Main Filter Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { id: 'All', label: 'All Logs' },
                    { id: 'Deposit', label: 'Deposits' },
                    { id: 'Withdraw', label: 'Withdrawals' },
                    { id: 'Manual', label: 'Manual Control' }
                ].map((tab) => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`p-5 rounded-[28px] text-[10px] font-black uppercase tracking-widest border transition-all ${
                            activeTab === tab.id 
                            ? 'bg-primary border-primary text-black shadow-gold' 
                            : 'bg-surface border-white/5 text-gray-500 hover:border-white/20'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Ledger Body */}
            <div className="bg-surface border border-white/5 rounded-[48px] shadow-2xl p-6 md:p-10 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5">
                                <th className="px-4 py-8">Ledger Integrity Timestamp</th>
                                <th className="px-4 py-8">Identity</th>
                                <th className="px-4 py-8">Action Protocol</th>
                                <th className="px-4 py-8">Remarks</th>
                                <th className="px-4 py-8 text-right">Value Asset (INR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((t, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.01 }} 
                                    key={t._id} 
                                    className="group hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition shadow-inner">
                                                <Clock size={14} className="text-gray-500" />
                                            </div>
                                            <div className="text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-white transition">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                                <p className="text-[9px] text-gray-600 font-bold">{new Date(t.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-8">
                                        <p className="text-sm font-black text-white italic group-hover:text-primary transition leading-none">{t.userId}</p>
                                        <p className="text-[9px] font-black text-gray-700 tracking-[0.2em] uppercase mt-2">Authenticated Identity</p>
                                    </td>
                                    <td className="px-4 py-8">
                                        <div className="flex items-center gap-3">
                                            {t.type === 'deposit' ? (
                                                <div className="p-2 rounded-xl bg-green-500/10 text-green-500 border border-green-500/10">
                                                    <ArrowUpCircle size={18} />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-xl bg-red-400/10 text-red-400 border border-red-400/10">
                                                    <ArrowDownCircle size={18} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none italic">{t.type}</p>
                                                <p className="text-[9px] text-gray-700 font-bold uppercase mt-1 italic">{t.method || 'sys_logic'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-8 max-w-[200px] truncate">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight italic">{t.remark || 'N/A SYSTEM SYMBOL'}</span>
                                    </td>
                                    <td className="px-4 py-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <p className={`text-xl font-black italic tracking-tighter ${t.type === 'deposit' ? 'text-green-500' : 'text-red-400'}`}>
                                                {t.type === 'deposit' ? '+' : '-'} ₹{(t.amount || 0).toLocaleString()}
                                            </p>
                                            <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition ${
                                                t.status === 'completed' || t.status === 'approved' || t.status === 'success'
                                                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}>
                                                { (t.status === 'completed' || t.status === 'approved' || t.status === 'success') ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                {t.status}
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {!filtered.length && (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center opacity-20 filter grayscale">
                                        <Wallet size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="italic text-xs font-black uppercase tracking-[0.4em]">Grid Analysis: Zero Transaction Integrity</p>
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

