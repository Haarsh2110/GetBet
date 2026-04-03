'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Star, Plus, X, Laptop } from 'lucide-react';

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
        if (amountToTransfer > wallet.vipBalance) return alert('Insufficient Elegible Value');
        
        setLoading(true);
        await onAddAmount(amountToTransfer);
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-surface border border-indigo-500/20 p-8 rounded-[2.5rem] w-full max-w-[340px] shadow-gold relative flex flex-col items-center overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>
                
                {/* Top glow bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-[2px]"></div>

                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner relative group overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Laptop size={28} className="text-white relative z-10" />
                </div>

                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">Terminal Alert</h3>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Calculated Multiplier Sync</p>

                {/* Amount Display */}
                <div className="flex flex-col items-center mb-8 bg-background w-full py-8 rounded-[2rem] border border-white/5 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                    <div className="text-5xl font-black tracking-tighter text-white italic drop-shadow-sm">
                        <span className="text-3xl mr-1 text-primary">₹</span>{(wallet?.bettingBalance || 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-indigo-100/40 text-[9px] font-black uppercase tracking-[0.3em] mt-3 italic">Calculated Stake Value</p>
                </div>

                <div className="w-full space-y-3 mb-8">
                    <p className="text-[10px] text-slate-500 text-center font-bold leading-relaxed uppercase tracking-wider px-2">
                        System sync complete. Values are automatically updated from terminal log.
                    </p>
                </div>

                <button 
                    onClick={onClose} 
                    className="w-full py-4 bg-primary hover:bg-primary-muted text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-gold"
                >
                    Authorize <X size={16} strokeWidth={3} />
                </button>
            </motion.div>
        </motion.div>
    );
}
