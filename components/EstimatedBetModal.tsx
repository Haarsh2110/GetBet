'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Star, Plus, X } from 'lucide-react';

export default function EstimatedBetModal({
    wallet,
    onClose,
    onAddAmount,
    onAddFunds
}: {
    wallet: any;
    onClose: () => void;
    onAddAmount: (amount: number) => Promise<void>;
    onAddFunds: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const amountToTransfer = wallet?.bettingBalance || 0;

    const handleAdd = async () => {
        if (amountToTransfer <= 0) return alert('Betting balance is 0. Nothing to add.');
        if (amountToTransfer > wallet.vipBalance) return alert('Insufficient VIP balance');
        
        setLoading(true);
        await onAddAmount(amountToTransfer);
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#18181b] border border-yellow-500/20 p-8 rounded-[2rem] w-full max-w-[340px] shadow-[0_0_50px_rgba(234,179,8,0.1)] relative flex flex-col items-center"
                onClick={e => e.stopPropagation()}
            >
                {/* Subtle top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent blur-[2px]"></div>

                <div className="w-14 h-14 rounded-full border border-yellow-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                    <LineChart size={24} className="text-yellow-500" strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">Estimated Bet</h3>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-6">Based on your betting balance</p>

                {/* Big Display Amount (Mirroring Betting Balance) */}
                <div className="flex flex-col items-center mb-8 bg-black/20 w-full py-8 rounded-3xl border border-white/5 shadow-inner">
                    <div className="text-5xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #4ade80 0%, #86efac 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        <span className="text-3xl mr-1">₹</span>{(wallet?.bettingBalance || 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Estimated Bet Amount</p>
                </div>

                <div className="w-full space-y-3 mb-6">
                    <p className="text-[10px] text-gray-500 text-center italic">
                        Amount is automatically added to Estimated Bet whenever you transfer funds from Main to Betting wallet.
                    </p>
                </div>

                <button onClick={onClose} className="w-full py-4 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(249,115,22,0.2)]">
                    Got it <X size={16} className="text-white" />
                </button>
            </motion.div>
        </motion.div>
    );
}
