'use client';

import { useWallet } from '@/hooks/use-wallet';
import { useState } from 'react';
import { Landmark, Dices, RotateCcw, Plus, ArrowUp, Bell, ChevronUp, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export default function WalletPage() {
    const { wallet, transferToMain, transfer } = useWallet();
    const router = useRouter();
    const [showTransfer, setShowTransfer] = useState(false);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTransfer = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) return alert('Enter valid amount');
        if (numAmount > wallet.mainBalance) return alert('Insufficient balance');

        // Plan Validation
        const isPlanActive = wallet.vipPlan && wallet.vipPlan !== 'none' && (!wallet.vipExpiresAt || new Date(wallet.vipExpiresAt) > new Date());
        if (!isPlanActive) {
            alert('Please purchase a plan to start betting');
            setShowTransfer(false);
            router.push('/#plans');
            return;
        }

        setLoading(true);
        const success = await transfer(numAmount, 'to_betting');
        setLoading(false);
        if (success) {
            setShowTransfer(false);
            setAmount('');
        }
    };

    return (
        <div className="flex flex-col min-h-full relative overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>

            {/* Custom Header */}
            <header className="relative z-10 pt-10 pb-2 px-6 flex justify-between items-center shrink-0">
                <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 shadow-sm">Current Balance</p>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-none">My Wallet</h1>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-colors shadow-sm">
                    <Bell size={18} className="text-white" />
                    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                </button>
            </header>

            <main className="flex-1 px-5 relative z-10 pb-[90px] flex flex-col justify-evenly">
                {/* Main Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-5 rounded-[2rem] border border-white/20 shadow-gold flex flex-col items-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)' }}
                >
                    {/* Subtle top right glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center mb-4 shadow-gold border border-white/20 bg-surface">
                        <Landmark size={24} className="text-white shadow-sm" strokeWidth={2} />
                    </div>

                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Main Wallet</p>

                    <div className="flex items-start justify-center gap-1 mb-4">
                        <span className="text-xl font-bold text-gray-400 mt-2">₹</span>
                        <span className="text-5xl font-black text-white tracking-tight tabular-nums drop-shadow-lg">
                            {wallet.mainBalance.toLocaleString('en-IN')}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 w-full">


                        <button
                            onClick={() => setShowTransfer(true)}
                            className="mt-2 w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                            Transfer To Betting
                        </button>
                    </div>
                </motion.div>

                {/* Sub-account Allocation (Side by side) */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center shadow-sm"
                        style={{ background: '#0F172A' }}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-white/5 border border-white/5 shadow-sm">
                            <Dices size={20} className="text-indigo-400" strokeWidth={2} />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Betting</p>
                        <p className="text-lg font-black text-white tabular-nums drop-shadow-sm">₹{wallet.bettingBalance.toLocaleString('en-IN')}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center shadow-sm"
                        style={{ background: '#0F172A' }}
                    >
                        <div 
                            onClick={() => wallet.reverseBalance > 0 && transfer(wallet.reverseBalance, 'from_reverse')}
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-white/5 border border-white/5 shadow-sm cursor-pointer active:scale-95 transition-transform"
                        >
                            <RotateCcw size={18} className="text-indigo-400" strokeWidth={2} />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Reverse</p>
                        <p className="text-lg font-black text-white tabular-nums drop-shadow-sm">₹{wallet.reverseBalance.toLocaleString('en-IN')}</p>
                    </motion.div>
                </div>



                {/* Action Controls (Deposit/Withdraw) */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-3"
                >
                    <Link href="/add-funds" className="p-4 rounded-[1.5rem] shadow-gold flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 border border-white/20 h-[100px] bg-primary">
                        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                            <Plus size={28} className="text-white drop-shadow-sm" strokeWidth={2} />
                        </div>
                        <span className="font-black text-white text-[13px] uppercase tracking-[0.15em] drop-shadow-md">Deposit</span>
                    </Link>

                    <Link href="/withdraw" className="p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 border border-white/5 shadow-gold h-[100px] bg-surface">
                        <div className="w-[40px] h-[40px] rounded-full border border-white/5 bg-white/5 flex items-center justify-center mb-1">
                            <ArrowUp size={20} className="text-white opacity-80" strokeWidth={1.5} />
                        </div>
                        <span className="font-black text-white text-[12px] uppercase tracking-[0.15em]">Withdraw</span>
                    </Link>
                </motion.div>
            </main>

            {/* Transfer Modal */}
            <AnimatePresence>
                {showTransfer && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowTransfer(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-[340px] bg-[#161616] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <button
                                onClick={() => setShowTransfer(false)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                            >
                                <X size={18} />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-1">Transfer Funds</h3>
                            <p className="text-xs text-gray-500 mb-6">Move money from Main to Betting Wallet</p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white font-bold outline-none focus:border-[#f97316]/50 transition-colors"
                                    />
                                    <p className="mt-2 text-[10px] text-gray-500 pl-1">Available: ₹{wallet.mainBalance.toLocaleString('en-IN')}</p>
                                </div>

                                <button
                                    onClick={handleTransfer}
                                    disabled={loading}
                                    className="w-full py-4 rounded-full bg-primary text-white font-black uppercase tracking-widest text-sm shadow-gold active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

