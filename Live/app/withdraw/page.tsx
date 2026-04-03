'use client';

import Header from '@/components/Header';
import { useWallet } from '@/hooks/use-wallet';
import { Wallet, ArrowRight, Landmark, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';

export default function Withdraw() {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const data = await userService.getProfile();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, []);

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (!profile?.bankDetails?.accountNumber) {
        alert('Please add bank details in Profile -> Account Details first.');
        router.push('/profile/account');
        return;
    }
    if (val > 0 && val <= wallet.mainBalance) {
      setLoading(true);
      router.push(`/withdraw-details?amount=${val}`);
    } else {
      alert('Insufficient balance or invalid amount.');
    }
  };

  const maskedAccount = profile?.bankDetails?.accountNumber 
    ? `**** ${profile.bankDetails.accountNumber.slice(-4)}`
    : 'No Bank Linked';

  return (
    <div className="flex flex-col min-h-full relative overflow-hidden bg-background shrink-0 text-white">
      <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none" />
      <Header title="Withdraw" showSupport={true} />

      <main className="flex-1 px-5 pt-4 pb-[120px] flex flex-col relative z-10 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-4">
          <div className="bg-surface rounded-full p-1 flex border border-white/5 relative">
            <button className="flex-1 py-3 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-gold transition-all">
              Withdraw Funds
            </button>
            <button
              onClick={() => router.push('/withdraw-history')}
              className="flex-1 py-3 rounded-full text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
            >
              History
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-[2rem] p-6 text-center relative overflow-hidden border border-white/5 shadow-gold"
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-2 flex items-center gap-2">
                <Wallet size={14} className="text-primary" />
                <h2 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">Available Balance</h2>
              </div>
              <div className="flex items-center justify-center space-x-1 py-2">
                <span className="text-3xl font-black text-white/50 mt-1">₹</span>
                <span className="text-5xl font-black text-white tracking-tight drop-shadow-lg">{wallet.mainBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-2 text-[10px] text-primary/60 font-black uppercase tracking-[0.3em] bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                Main Wallet Terminal
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase ml-1">Withdrawal Amount</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                <div className="relative bg-[#0F172A] border border-white/10 rounded-2xl flex items-center px-4 py-4 focus-within:border-primary/50 transition-all">
                  <span className="text-2xl font-black text-slate-700 mr-2">₹</span>
                  <input
                    className="w-full bg-transparent border-none text-white text-2xl font-black placeholder-slate-800 focus:ring-0 p-0"
                    placeholder="0.00"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <button
                    onClick={() => setAmount(wallet.mainBalance.toString())}
                    className="ml-2 text-[10px] font-black bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl uppercase tracking-widest transition-colors border border-primary/20"
                  >
                    Max
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Min: <span className="text-slate-400 ml-1 font-bold">₹500</span></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Max: <span className="text-slate-400 ml-1 font-bold">₹{wallet.mainBalance.toLocaleString('en-IN')}</span></span>
              </div>
            </div>

            <motion.div 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="pt-2"
            >
              <div 
                onClick={() => router.push('/profile/account')}
                className="bg-surface border border-white/5 rounded-[2rem] p-5 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer group shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-all">
                    <Landmark size={22} className="text-slate-500 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black uppercase tracking-wider group-hover:text-primary transition-colors">
                        {profile?.bankDetails?.bankName || 'Link Bank Account'}
                    </p>
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                        {profile?.bankDetails?.accountHolderName ? `${profile.bankDetails.accountHolderName} • ${maskedAccount}` : 'Verify Security Credentials'}
                    </p>
                  </div>
                </div>
                <ChevronDown size={20} className="text-slate-700 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto pt-8 shrink-0 pb-2">
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full relative group h-16 overflow-hidden rounded-[1.5rem] shadow-gold active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed bg-primary"
          >
            <div className="relative h-full flex items-center justify-center space-x-3">
              {loading ? (
                <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-black text-white text-base tracking-[0.2em] uppercase">Confirm Withdrawal</span>
                  <ArrowRight size={20} className="text-white animate-pulse" />
                </>
              )}
            </div>
          </button>

          <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 px-6 leading-relaxed">
            Secure Terminal Sync 24H. Ensure node details are verified before process.
          </p>
        </div>
      </main>
    </div>
  );
}
