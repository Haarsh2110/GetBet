'use client';

import Header from '@/components/Header';
import { useWallet } from '@/hooks/use-wallet';
import { TrendingUp, Plus, Star, X, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function ReverseBetting() {
  const { wallet, placeReverseBet } = useWallet();
  const [showPopup, setShowPopup] = useState(false);
  const [betAmount, setBetAmount] = useState(10000);

  const handlePlaceBet = (type: 'big' | 'small') => {
    placeReverseBet(betAmount, type);
    setShowPopup(false);
    // Custom toast or better alert would be better here, but sticking to basic for now
    alert(`Reverse bet of ₹${betAmount} placed on ${type.toUpperCase()}!`);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/5 blur-3xl rounded-full -ml-32 -mb-32"></div>

      <Header title="Intelligence Terminal" showSupport={true} />

      <main className="flex-1 px-6 pt-8 space-y-8 relative z-10">
        {/* Balance Status */}
        <div className="relative overflow-hidden p-6 rounded-[2.5rem] glass-dark border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={80} className="text-primary" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Available to Recover</p>
              <h2 className="text-3xl font-black text-white tracking-tight">
                <span className="text-primary mr-1">₹</span>
                {wallet.reverseBalance.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/50 transition-colors">
              <TrendingUp size={24} className="text-primary" />
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Signal Execution</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setBetAmount(10000); setShowPopup(true); }}
              className="relative overflow-hidden group h-40 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-emerald-900 p-[1px]"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="flex flex-col items-center justify-center h-full w-full bg-emerald-950/40 rounded-[2.5rem] backdrop-blur-sm group-hover:bg-emerald-950/20 transition-colors">
                <span className="text-3xl font-black text-white tracking-tighter mb-1">LONG</span>
                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/30">2.0x Signal</span>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setBetAmount(10000); setShowPopup(true); }}
              className="relative overflow-hidden group h-40 rounded-[2.5rem] bg-gradient-to-br from-rose-500 to-rose-900 p-[1px]"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="flex flex-col items-center justify-center h-full w-full bg-rose-950/40 rounded-[2.5rem] backdrop-blur-sm group-hover:bg-rose-950/20 transition-colors">
                <span className="text-3xl font-black text-white tracking-tighter mb-1">SHORT</span>
                <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest bg-rose-900/50 px-3 py-1 rounded-full border border-rose-500/30">2.0x Signal</span>
              </div>
            </motion.button>
          </div>
        </section>

        {/* Preset Amounts */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Quick Recovery</h3>
            <span className="text-[10px] font-bold text-primary">MANUAL OVERRIDE</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[2000, 5000, 10000].map((val) => (
              <button
                key={val}
                onClick={() => { setBetAmount(val); setShowPopup(true); }}
                className="glass-dark py-5 rounded-3xl border-white/5 hover:border-primary/50 transition-all flex flex-col items-center gap-1 group active:scale-95"
              >
                <span className="text-[9px] font-black text-gray-600 transition-colors group-hover:text-primary uppercase tracking-tighter">Liquidate</span>
                <span className="text-lg font-black text-white tracking-tighter">₹{(val / 1000).toFixed(0)}K</span>
              </button>
            ))}
          </div>
        </section>

        {/* Intelligence Badge */}
        <div className="glass-gold p-5 rounded-[2rem] border-primary/20 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
              <ShieldCheck size={26} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-black text-white tracking-wide uppercase">AI Engine Active</p>
              <p className="text-[10px] text-accent-green font-bold tracking-widest uppercase">Accuracy 98.4% Verified</p>
            </div>
          </div>
          <div className="p-2 rounded-full border border-primary/30 text-primary">
            <ChevronRight size={18} strokeWidth={3} />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-sm glass-dark rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

              <div className="p-10 flex flex-col items-center text-center">
                <div className="mb-6 w-16 h-16 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Zap size={32} className="text-primary" />
                </div>

                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Order Confirmation</h2>

                <div className="my-4 flex flex-col items-center w-full">
                  <div className="flex items-baseline justify-center gap-1 group">
                    <span className="text-xl font-black text-primary mb-2">₹</span>
                    <span className="text-5xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform duration-500">
                      {betAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="mt-6 glass py-2 px-5 rounded-full flex items-center gap-2 text-[10px] font-black tracking-widest text-primary hover:bg-white/5 transition-colors border-primary/30"
                  >
                    <Plus size={14} strokeWidth={3} />
                    ADJUST LIQUIDITY
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-3 w-full mt-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlaceBet('big')}
                    className="bg-primary text-black font-black py-4 rounded-[1.5rem] tracking-widest text-xs uppercase shadow-gold hover:bg-primary-light transition-colors"
                  >
                    Execute Signal
                  </motion.button>

                  <button
                    onClick={() => setShowPopup(false)}
                    className="py-4 text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel Order
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

