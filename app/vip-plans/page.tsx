'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Headphones, Wallet, Shield, CheckCircle2, Crown, Star, Zap, GraduationCap, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';

const plans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    tagline: 'Casual player essentials for getting started.',
    price: 999,
    oldPrice: 1499,
    duration: '30 Days',
    icon: GraduationCap,
    color: '#facc15',
    gradient: 'linear-gradient(135deg, #1a1a00 0%, #111100 100%)',
    borderColor: 'rgba(250,204,21,0.3)',
    badge: null,
    features: [
      'Basic Prediction Access',
      '10% Reversal Bonus',
      'Standard Customer Support',
      'Daily Tips & Tricks',
      'Access to 3 Betting Markets',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    tagline: 'Advanced tools for serious bettors.',
    price: 2499,
    oldPrice: 3999,
    duration: '60 Days',
    icon: Flame,
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #110800 100%)',
    borderColor: 'rgba(249,115,22,0.35)',
    badge: 'POPULAR',
    badgeColor: '#f97316',
    features: [
      'Advanced AI Predictions',
      '25% Reversal Bonus',
      'Priority Customer Support',
      'Live Match Strategies',
      'Access to 10 Betting Markets',
      'Weekly Expert Reports',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    tagline: 'Maximum edge for professional players.',
    price: 4999,
    oldPrice: 7999,
    duration: '90 Days',
    icon: Crown,
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #0f0020 0%, #090010 100%)',
    borderColor: 'rgba(168,85,247,0.35)',
    badge: 'BEST VALUE',
    badgeColor: '#a855f7',
    features: [
      'Full AI Prediction Suite',
      '50% Reversal Bonus',
      '24/7 VIP Concierge Support',
      'Live Match + Pre-match Strategy',
      'Unlimited Betting Markets',
      'Daily Expert Consultation',
      'Exclusive Insider Tips',
      'Dedicated Account Manager',
    ],
  },
];

const features = [
  { icon: TrendingUp, label: '90%+ ACC.' },
  { icon: Headphones, label: '24/7 VIP' },
  { icon: Wallet, label: 'FAST PAY' },
  { icon: Shield, label: 'SAFE' },
];

export default function VIPPlans() {
  const router = useRouter();
  const { wallet, buyPlan } = useWallet();
  const [selected, setSelected] = useState('starter');
  const [loading, setLoading] = useState(false);

  const activePlan = plans.find((p) => p.id === selected)!;

  const handleActivate = async () => {
    if (wallet.mainBalance >= activePlan.price) {
      if (window.confirm(`Buy ${activePlan.name} for ₹${activePlan.price.toLocaleString('en-IN')}?`)) {
        setLoading(true);
        const success = await buyPlan(activePlan.id);
        setLoading(false);
        if (success) {
          alert('Plan activated successfully!');
          router.push('/');
        }
      }
    } else {
      router.push(`/add-funds?plan=${activePlan.id}&amount=${activePlan.price}`);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] relative overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-10 pb-2 flex items-center justify-between relative z-10 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition-transform border border-white/10"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: '#facc15' }}>
          VIP PLANS
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
            <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: '#facc15' }} />
            <div className="w-16 h-16 rounded-full border border-yellow-500/30 flex items-center justify-center relative"
              style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 70%)' }}>
              <Star size={30} className="text-[#facc15]" fill="#facc15" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 leading-tight">
            Ultimate Betting<br />Intelligence
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed px-4">
            Elevate your strategy with high-accuracy prediction algorithms and professional loss recovery tools.
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
            <div key={f.label} className="bg-[#111111] border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-1.5">
              <f.icon size={18} className="text-[#facc15]" />
              <span className="text-[8px] font-black text-[#facc15] tracking-widest text-center">{f.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Plan selector pills */}
        <div className="bg-[#111111] rounded-full p-1 flex border border-white/5 mb-5">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200"
              style={
                selected === p.id
                  ? { background: p.color, color: '#000' }
                  : { color: '#6b7280' }
              }
            >
              {p.id === 'starter' ? 'Starter' : p.id === 'growth' ? 'Growth' : 'Elite'}
            </button>
          ))}
        </div>

        {/* Active Plan Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlan.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="rounded-[2rem] p-6 border relative overflow-hidden"
            style={{
              background: activePlan.gradient,
              borderColor: activePlan.borderColor,
              boxShadow: `0 0 40px ${activePlan.color}22`,
            }}
          >
            {/* Popular / Best Value badge */}
            {activePlan.badge && (
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                style={{ background: activePlan.color, color: '#000' }}
              >
                {activePlan.badge}
              </div>
            )}

            {/* Plan header */}
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: activePlan.color + '22', border: `1px solid ${activePlan.color}44` }}
              >
                <activePlan.icon size={18} style={{ color: activePlan.color }} />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">{activePlan.name}</h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: activePlan.color + '22', color: activePlan.color }}
                >
                  {activePlan.duration}
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-xs mb-4 mt-2">{activePlan.tagline}</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-black" style={{ color: activePlan.color }}>
                ₹{activePlan.price.toLocaleString('en-IN')}
              </span>
              <span className="text-base text-gray-600 line-through">₹{activePlan.oldPrice.toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                {Math.round((1 - activePlan.price / activePlan.oldPrice) * 100)}% OFF
              </span>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {activePlan.features.map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <CheckCircle2 size={16} style={{ color: activePlan.color }} strokeWidth={2.5} className="shrink-0" />
                  <span className="text-gray-300 text-sm">{feat}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleActivate}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50"
              style={{
                background: activePlan.color,
                color: '#000',
                boxShadow: `0 0 20px ${activePlan.color}55`,
              }}
            >
              {loading ? 'PROCESSING...' : 'ACTIVATE NOW'}
            </motion.button>

            <p className="text-center text-[10px] text-gray-600 mt-3">
              Secure payment · Instant activation · Cancel anytime
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Compare Plans Note */}
        <div className="mt-6 bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
          <Zap size={16} className="text-[#facc15] shrink-0 mt-0.5" />
          <p className="text-gray-400 text-[11px] leading-relaxed">
            All plans include <span className="text-white font-bold">loss recovery tools</span>, real-time alerts, and access to the GetBet VIP dashboard. Upgrade or cancel at any time.
          </p>
        </div>
      </main>
    </div>
  );
}
