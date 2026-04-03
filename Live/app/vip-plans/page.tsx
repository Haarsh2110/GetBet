'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Headphones, Wallet, Shield, CheckCircle2, Crown, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/use-wallet';


const features = [
  { icon: TrendingUp, label: '90%+ WIN' },
  { icon: Headphones, label: '24/7 HELP' },
  { icon: Wallet, label: 'FAST PAY' },
  { icon: Shield, label: 'SECURE' },
];

export default function VIPPlans() {
  const router = useRouter();
  const { wallet, buyPlan } = useWallet();
  const [plans, setPlans] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans');
        const data = await res.json();
        if (data.success && data.plans.length > 0) {
          setPlans(data.plans);
          setSelected(data.plans[0].planId);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setFetching(false);
      }
    }
    fetchPlans();
  }, []);

  const activePlan = plans.find((p) => p.planId === selected);

  const handleActivate = async () => {
    if (!activePlan) return;
    if (wallet.mainBalance >= activePlan.price) {
      if (window.confirm(`Buy ${activePlan.name} for ₹${activePlan.price.toLocaleString('en-IN')}?`)) {
        setLoading(true);
        const success = await buyPlan(activePlan.planId);
        setLoading(true); 
        if (success) {
          alert('Plan activated successfully!');
          window.location.href = '/';
        } else {
          setLoading(false);
        }
      }
    } else {
      router.push(`/add-funds?plan=${activePlan.planId}&amount=${activePlan.price}`);
    }
  };

  if (fetching) {
     return (
       <div className="flex flex-col min-min-h-full bg-background items-center justify-center">
         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
         <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Loading VIP Plans...</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col min-min-h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-10 pb-2 flex items-center justify-between relative z-10 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white shadow-sm rounded-2xl flex items-center justify-center active:scale-95 transition-transform border border-indigo-100"
        >
          <ArrowLeft size={18} className="text-slate-800" />
        </button>
        <h1 className="text-sm font-black tracking-[0.2em] uppercase text-indigo-500">
           VIP MEMBERSHIP
        </h1>
        <div className="w-10" />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 px-5 pb-36 overflow-y-auto no-scrollbar">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center pt-6 pb-6"
        >
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-indigo-500" />
            <div className="w-16 h-16 rounded-full border border-indigo-500/30 flex items-center justify-center relative bg-white/5">
              <Star size={30} className="text-indigo-400" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 leading-tight uppercase">
             PRO PLAYER TOOLS
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed px-4">
            Get highly accurate game signals and expert tools to recover your losses and win more every day.
          </p>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2 mb-6"
        >
          {features.map((f) => (
            <div key={f.label} className="bg-surface border border-white/5 shadow-sm rounded-2xl p-3 flex flex-col items-center gap-1.5">
              <f.icon size={18} className="text-indigo-400" />
              <span className="text-[8px] font-black text-indigo-400 tracking-widest text-center uppercase">{f.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Plan selector pills */}
        {plans.length > 0 && (
          <div className="bg-surface rounded-full p-1 flex border border-white/5 mb-5 max-w-full overflow-x-auto no-scrollbar">
            {plans.map((p) => (
              <button
                key={p.planId}
                onClick={() => setSelected(p.planId)}
                className="flex-1 min-w-[100px] py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300"
                style={
                  selected === p.planId
                    ? { background: '#6366F1', color: '#FFF' }
                    : { color: '#475569' }
                }
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Active Plan Card */}
        {activePlan ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activePlan.planId}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="rounded-[2.5rem] p-7 border relative overflow-hidden bg-surface shadow-gold"
              style={{
                borderColor: 'rgba(99,102,241,0.2)',
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none"></div>

              {/* Plan header */}
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Crown size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl leading-none italic uppercase tracking-tighter">{activePlan.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20 leading-none">
                        VIP ACCESS
                     </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-6 mt-3 px-1 italic">
                 {activePlan.tagline ? 'BEST CHOICE TO WIN BIG' : 'ESSENTIAL TOOLS FOR PLAYERS'}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6 bg-black/20 p-5 rounded-[2rem] border border-white/5">
                <span className="text-5xl font-black text-white italic tracking-tighter leading-none">
                  ₹{activePlan.price.toLocaleString('en-IN')}
                </span>
                {activePlan.oldPrice > 0 && (
                  <span className="text-lg text-slate-700 font-bold line-through">₹{activePlan.oldPrice.toLocaleString('en-IN')}</span>
                )}
              </div>

              {/* Reward Bonus Highlight */}
              <div className="mb-8 p-5 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                 <div className="flex items-center gap-3">
                    <Zap size={20} className="text-indigo-400" />
                    <div>
                       <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1 leading-none">ELEGIBLE VALUE</p>
                       <p className="text-2xl font-black text-white italic tracking-tighter leading-none mt-1">₹{activePlan.vipBonus.toLocaleString('en-IN')}</p>
                    </div>
                 </div>
              </div>

              {/* Features List */}
              <div className="space-y-3.5 mb-8">
                {(activePlan.features || []).map((feat: string) => (
                  <div key={feat} className="flex items-center gap-4 group">
                    <CheckCircle2 size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" strokeWidth={3} />
                    <span className="text-slate-300 text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleActivate}
                disabled={loading}
                className="w-full py-5 rounded-[1.5rem] font-black text-base uppercase tracking-[0.2em] transition-all disabled:opacity-50 bg-primary text-white shadow-gold active:shadow-none"
              >
                {loading ? 'PROCESSING...' : 'ACTIVATE NOW'}
              </motion.button>

              <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-600 mt-5 italic">
                 Secure Payment · Instant Activation · 24/7 Support
              </p>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="p-10 text-center bg-surface rounded-[2.5rem] border border-white/5">
             <Headphones size={40} className="text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">No Active Plans Available</p>
             <p className="text-slate-700 text-[9px] mt-2 italic">Please contact support or check back later.</p>
          </div>
        )}

        {/* Static Info Card */}
        <div className="mt-8 bg-surface border border-indigo-500/10 rounded-[2.5rem] p-6 flex items-start gap-4 shadow-sm">
          <Shield size={20} className="text-indigo-400 shrink-0 mt-1" />
          <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic">
            All plans include <span className="text-indigo-300 font-black">EXPERT LOSS RECOVERY TOOLS</span> and highly accurate game prediction systems for maximum profit.
          </p>
        </div>
      </main>
    </div>
  );
}
