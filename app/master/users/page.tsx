'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Search,
    Download,
    Filter,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    Loader2,
    Clock,
    UserPlus,
    Zap,
    Shield
} from 'lucide-react';

interface User {
    _id: string;
    userId: string;
    phone: string;
    name: string;
    vipBalance: number;
    vipPlan: string;
    createdAt: string;
}

export default function MasterUsers() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalAction, setModalAction] = useState<'add' | 'subtract' | null>(null);
    const [amount, setAmount] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/master/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (err) {
            console.error('Master User Sync Fail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBalanceUpdate = async () => {
        if (!selectedUser || !amount || parseFloat(amount) <= 0) return;
        
        setActionLoading(true);
        try {
            const res = await fetch('/api/master/users/balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: selectedUser.phone, 
                    amount: parseFloat(amount), 
                    action: modalAction 
                })
            });

            const data = await res.json();
            if (data.success) {
                await fetchUsers();
                setSelectedUser(null);
                setModalAction(null);
                setAmount('');
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Balance update failed:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const toggleVip = async (phone: string) => {
        try {
            const res = await fetch('/api/master/users/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (data.success) {
                await fetchUsers();
            }
        } catch (err) {
            console.error('VIP toggle failed:', err);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.phone || '').includes(searchTerm) || 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.userId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-primary text-[10px] font-black tracking-widest uppercase">Decryption In Progress...</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                     <button 
                        onClick={() => router.push('/master')}
                        className="hidden md:flex items-center gap-2 text-gray-400 hover:text-primary transition text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ChevronLeft size={14} /> Intelligence Overview
                    </button>
                    <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        User <span className="text-primary font-black italic">Intelligence</span>
                    </h1>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-4">Platform Identity & Asset Management</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find by Phone/UID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 outline-none focus:border-primary/40 transition text-sm font-black"
                        />
                    </div>
                </div>
            </div>

            {/* Matrix Result Body */}
            <div className="bg-surface border border-white/5 overflow-hidden rounded-[48px] shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] border-b border-white/5 px-8">
                                <th className="px-8 py-8">Project Identity</th>
                                <th className="px-8 py-8">Status</th>
                                <th className="px-8 py-8">Global Assets</th>
                                <th className="px-8 py-8">Registration</th>
                                <th className="px-8 py-8 text-right">Overrides</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={user._id} 
                                    className="group hover:bg-white/5 transition duration-300"
                                >
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:scale-110 transition duration-500 shadow-inner">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic text-white group-hover:text-primary transition leading-none">{user.name || 'ANONYMOUS'}</p>
                                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-2">{user.phone} ({user.userId})</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <button 
                                            onClick={() => toggleVip(user.phone)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${user.vipPlan === 'elite' ? 'bg-primary/20 text-primary border border-primary/20 shadow-gold' : 'bg-white/5 text-gray-500 border border-transparent blur-[0.3px] grayscale'}`}
                                        >
                                            <Zap size={12} className={user.vipPlan === 'elite' ? 'fill-primary' : ''} /> {user.vipPlan === 'elite' ? 'VIP ACTIVE' : 'STANDARD'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-xl font-black italic tracking-tighter text-white">₹{(user.vipBalance || 0).toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-gray-700 tracking-widest uppercase mt-1">Available Points</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition">
                                            <Clock size={14} className="opacity-30" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter italic">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                         <div className="flex justify-end gap-3 translate-x-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                            <button 
                                                onClick={() => { setSelectedUser(user); setModalAction('add'); }}
                                                className="w-12 h-12 rounded-2xl bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black transition shadow-lg flex items-center justify-center"
                                            >
                                                <ArrowUpCircle size={22} />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedUser(user); setModalAction('subtract'); }}
                                                className="w-12 h-12 rounded-2xl bg-red-400/10 hover:bg-red-400 text-red-400 hover:text-black transition shadow-lg flex items-center justify-center"
                                            >
                                                <ArrowDownCircle size={22} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {!filteredUsers.length && (
                        <div className="py-24 text-center">
                            <Shield size={48} className="mx-auto mb-4 text-white/5" />
                            <p className="text-xs font-black uppercase text-gray-700 tracking-[0.4em]">Grid Analysis: Zero Identites Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Overwrite Modal */}
            <AnimatePresence>
                {(selectedUser && modalAction) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setSelectedUser(null); setModalAction(null); }}
                            className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface border border-white/5 w-full max-w-xl rounded-[48px] p-8 md:p-14 shadow-2xl relative z-10 overflow-hidden"
                        >
                            {/* Modal Background Decor */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                            
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                                Asset <span className={modalAction === 'add' ? 'text-green-500' : 'text-red-400'}>{modalAction === 'add' ? 'Injection' : 'Extraction'}</span>
                            </h2>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-10 italic">Modify Balance for: <span className="text-white">{selectedUser.name || selectedUser.phone}</span></p>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-3 block">Transaction Value (INR)</label>
                                    <input 
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black/40 border border-white/5 rounded-[32px] p-8 text-3xl font-black italic outline-none focus:border-primary/40 focus:bg-black/60 transition shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-4">
                                     <button 
                                        onClick={() => { setSelectedUser(null); setModalAction(null); }}
                                        className="flex-1 p-6 rounded-[28px] bg-white/5 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition"
                                    >
                                        Cancel Protocol
                                    </button>
                                    <button 
                                        onClick={handleBalanceUpdate}
                                        disabled={actionLoading}
                                        className={`flex-1 p-6 rounded-[28px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition active:scale-95 disabled:opacity-50 ${modalAction === 'add' ? 'bg-primary text-black shadow-gold' : 'bg-red-500 text-white'}`}
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (modalAction === 'add' ? <CheckCircle2 size={18} /> : <XCircle size={18} />)}
                                        {modalAction === 'add' ? 'Commit Injection' : 'Commit Extraction'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
