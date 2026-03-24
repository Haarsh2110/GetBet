'use client';

import Header from '@/components/Header';
import { useWallet } from '@/hooks/use-wallet';
import { Wallet, ArrowRight, Landmark, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function Withdraw() {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (val > 0 && val <= wallet.mainBalance) {
      setLoading(true);
      router.push(`/withdraw-details?amount=${val}`);
    } else {
      alert('Insufficient balance or invalid amount.');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden bg-[#0A0A0A] shrink-0">
      <Header title="Withdraw" showSupport={true} />

      <main className="flex-1 px-5 pt-4 pb-[120px] flex flex-col relative z-10 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-4">
          <div className="bg-[#1E1E1E] rounded-full p-1 flex border border-white/5 relative">
            <button className="flex-1 py-3 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all">
              Withdraw Funds
            </button>
            <button
              onClick={() => router.push('/withdraw-history')}
              className="flex-1 py-3 rounded-full text-gray-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              History
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-[2rem] p-6 text-center relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-2 flex items-center gap-2">
                <Wallet size={14} className="text-accent-gold" />
                <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Available Balance</h2>
              </div>
              <div className="flex items-center justify-center space-x-1 py-2">
                <span className="text-3xl font-bold text-accent-gold/80 mt-1">₹</span>
                <span className="text-5xl font-black text-accent-gold tracking-tight drop-shadow-lg">{wallet.mainBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-2 text-[10px] text-gray-500 font-medium bg-black/20 px-3 py-1 rounded-full border border-white/5">
                Main Wallet
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-3">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase ml-1">Withdrawal Amount</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                <div className="relative bg-[#1E1E22] border border-white/10 rounded-2xl flex items-center px-4 py-4 focus-within:border-primary/50 transition-all">
                  <span className="text-2xl font-bold text-gray-500 mr-2">₹</span>
                  <input
                    className="w-full bg-transparent border-none text-white text-2xl font-bold placeholder-gray-600 focus:ring-0 p-0"
                    placeholder="0.00"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <button
                    onClick={() => setAmount(wallet.mainBalance.toString())}
                    className="ml-2 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-primary px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-xs text-gray-500">Min: <span className="text-gray-300 ml-1">₹500</span></span>
                <span className="text-xs text-gray-500">Max: <span className="text-gray-300 ml-1">₹{wallet.mainBalance.toLocaleString('en-IN')}</span></span>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-[#1E1E22]/70 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Landmark size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold group-hover:text-primary transition-colors">Bank Transfer</p>
                    <p className="text-gray-500 text-xs">Primary Account **** 8832</p>
                  </div>
                </div>
                <ChevronDown size={20} className="text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto pt-8 shrink-0 pb-2">
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full relative group h-14 overflow-hidden rounded-2xl shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C42] to-[#E65100]"></div>
            <div className="relative h-full flex items-center justify-center space-x-2">
              {loading ? (
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-black text-white text-lg tracking-wider uppercase">Proceed to Withdraw</span>
                  <ArrowRight size={20} className="text-white" />
                </>
              )}
            </div>
          </button>

          <p className="text-center text-[10px] text-gray-600 px-8 leading-relaxed">
            Withdrawals are processed within 24 hours. Ensure your bank details are correct before proceeding.
          </p>
        </div>
      </main>
    </div>
  );
}
