'use client';

import Header from '@/components/Header';
import { useWallet } from '@/hooks/use-wallet';
import { Wallet, ArrowRight, Info } from 'lucide-react';
import { useState, Suspense } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';

function AddFundsContent() {
  const { wallet } = useWallet();
  const searchParams = useSearchParams();
  const initialAmount = searchParams.get('amount') || '';
  const plan = searchParams.get('plan') || '';
  const [amount, setAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (val > 0) {
      setLoading(true);
      router.push(`/deposit-details?amount=${val}${plan ? `&plan=${plan}` : ''}`);
      // Button will stay disabled as navigation happens
    } else {
      alert('Please enter a valid amount greater than 0');
    }
  };

  return (
    <div className="flex flex-col min-h-full relative overflow-hidden bg-background shrink-0">
      <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none" />
      <Header title="Add Funds" />

      <main className="flex-1 px-6 pt-4 pb-[120px] flex flex-col relative z-10 overflow-y-auto no-scrollbar">
        <div className="bg-surface rounded-3xl p-8 shadow-gold border border-white/5 relative">
          <div className="text-center mb-8">
            <label className="text-xs font-bold tracking-[0.15em] text-gray-500 uppercase">Enter Amount</label>
          </div>

          <div className="relative mb-6 bg-black/30 rounded-2xl p-6 flex justify-center items-center border border-white/5">
            <span className="text-primary text-3xl font-bold mr-2">₹</span>
            <input
              className="bg-transparent border-none text-4xl font-extrabold text-white placeholder-gray-600 focus:ring-0 text-center w-full max-w-[200px] p-0"
              placeholder="0"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex justify-between gap-3">
            {[500, 1000, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                className="flex-1 py-3 px-2 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-95 group"
              >
                <span className="text-sm font-bold text-gray-300 group-hover:text-primary transition-colors">+{val}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-auto pt-8 shrink-0 pb-4">
          <div className="flex items-center justify-between px-2 opacity-80 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet size={18} className="text-gray-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Current Balance</span>
                <span className="text-sm font-bold text-white">₹ {wallet.mainBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>CONFIRM AMOUNT</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="flex items-start gap-2 px-4 opacity-50 shrink-0 mt-2">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p className="text-center text-[10px] leading-relaxed">
              By proceeding, you agree to our terms of service and secure payment policies.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
export default function AddFunds() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-primary font-black uppercase tracking-widest italic">Loading...</div>}>
      <AddFundsContent />
    </Suspense>
  );
}
