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
        <div className="flex flex-col h-[100dvh] relative overflow-hidden bg-[#0A0A0A]">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>

            {/* Custom Header */}
            <header className="relative z-10 pt-10 pb-2 px-6 flex justify-between items-center shrink-0">
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 shadow-sm">Current Balance</p>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-none">My Wallet</h1>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-colors">
                    <Bell size={18} className="text-white" />
                    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#f97316] rounded-full"></div>
                </button>
            </header>

            <main className="flex-1 px-5 relative z-10 pb-[90px] flex flex-col justify-evenly">
                {/* Main Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-5 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col items-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #1b1b1b 0%, #111111 100%)' }}
                >
                    {/* Subtle top right glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center mb-4 shadow-[0_5px_15px_rgba(249,115,22,0.1)] border border-[#f97316]/30" style={{ background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)' }}>
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
                        <div className="px-4 py-1.5 rounded-full border border-accent-green/30 flex items-center justify-center gap-1.5 shadow-[inset_0_0_10px_rgba(52,199,89,0.05)] bg-[#34C759]/5 w-fit mx-auto">
                            <TrendingUp size={12} className="text-accent-green" strokeWidth={3} />
                            <span className="text-[10px] font-black text-accent-green tracking-wide">+12% this week</span>
                        </div>

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
                        className="p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center"
                        style={{ background: '#111111' }}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-white/5 border border-white/5 shadow-[0_0_20px_rgba(249,115,22,0.05)]">
                            <Dices size={20} className="text-[#f97316]" strokeWidth={2} />
                        </div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Betting</p>
                        <p className="text-lg font-black text-white tabular-nums drop-shadow-sm">₹{wallet.bettingBalance.toLocaleString('en-IN')}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center"
                        style={{ background: '#111111' }}
                    >
                        <div 
                            onClick={() => wallet.reverseBalance > 0 && transfer(wallet.reverseBalance, 'from_reverse')}
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-white/5 border border-white/5 shadow-[0_0_20px_rgba(59,130,246,0.05)] cursor-pointer active:scale-95 transition-transform"
                        >
                            <RotateCcw size={18} className="text-[#3b82f6]" strokeWidth={2} />
                        </div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Reverse</p>
                        <p className="text-lg font-black text-white tabular-nums drop-shadow-sm">₹{wallet.reverseBalance.toLocaleString('en-IN')}</p>
                    </motion.div>
                </div>

                {/* Transfer Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    onClick={transferToMain}
                    className="w-full relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[#f97316] opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"></div>
                    <div className="py-4 border shadow-[0_0_15px_rgba(249,115,22,0.15)] rounded-2xl flex items-center justify-center gap-3 transition-colors border-[#ea580c] bg-[#111111]">
                        <ChevronUp size={12} className="text-[#ea580c]" strokeWidth={3} />
                        <span className="text-[#ea580c] text-[11px] font-black tracking-widest uppercase relative top-[1px]">Transfer All To Main Wallet</span>
                        <ChevronUp size={12} className="text-[#ea580c]" strokeWidth={3} />
                    </div>
                </motion.button>

                {/* Action Controls (Deposit/Withdraw) */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-3"
                >
                    <Link href="/add-funds" className="p-4 rounded-[1.5rem] shadow-[0_0_30px_rgba(249,115,22,0.2)] flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 border border-[#ea580c]/50 h-[100px]" style={{ background: 'linear-gradient(135deg, #fdba74 0%, #ea580c 100%)' }}>
                        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                            <Plus size={28} className="text-white drop-shadow-sm" strokeWidth={2} />
                        </div>
                        <span className="font-black text-white text-[13px] uppercase tracking-[0.15em] drop-shadow-md">Deposit</span>
                    </Link>

                    <Link href="/withdraw" className="p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 border border-white/5 shadow-xl h-[100px]" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #111111 100%)' }}>
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
                                    className="w-full py-4 rounded-full bg-[#f97316] text-white font-black uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:scale-95 transition-all disabled:opacity-50"
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

