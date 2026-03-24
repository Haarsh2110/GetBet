'use client';

import { useWallet } from '@/hooks/use-wallet';
import { Download, Headphones, Crown, TrendingUp, TrendingDown, ChevronRight, LayoutGrid, Wallet, History, Users, Dices, PlaneTakeoff, BarChart2, ChevronDown, LineChart, Star, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const EstimatedBetModal = dynamic(() => import('@/components/EstimatedBetModal'), {
  ssr: false,
});

const bettingApps = [
  { id: 'wingo', name: 'WIN GO', color: 'from-[#e8701a] to-[#d35b0d]', path: '/wingo' },
  { id: 'aviator', name: 'AVIATOR', color: 'from-[#b9153a] to-[#8f0f2a]', path: '/aviator' },
  { id: 'limbo', name: 'LIMBO', color: 'from-[#23388e] to-[#152361]', path: '/limbo' },
];

const GamepadIcon = React.memo(function GamepadIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  )
});

const BettingAppsGrid = React.memo(() => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {bettingApps.map((app) => (
        <Link
          href={app.path}
          key={app.id}
          prefetch={true}
          className={`
            relative overflow-hidden rounded-xl aspect-square flex flex-col items-center justify-center p-4 cursor-pointer
            bg-gradient-to-br ${app.color} shadow-lg hover:scale-105 active:scale-95 transition-transform duration-300 border border-white/10
          `}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-3">
            <GamepadIcon size={28} className="text-white" />
          </div>
          <span className="font-display font-bold text-white tracking-widest text-sm">{app.name}</span>
        </Link>
      ))}
    </div>
  );
});

export default function Home() {
  const router = useRouter();
  const { wallet, transfer, prefetchGameData } = useWallet();

  // Redirect if not logged in & Manual Prefetch critical routes
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    // Proactively prefetch high-priority routes for instant navigation
    const criticalRoutes = ['/wingo', '/wallet', '/profile', '/add-funds', '/vip-plans'];
    criticalRoutes.forEach(route => {
      router.prefetch(route);
    });

    // Prefetch critical game data to global state before navigation
    prefetchGameData('wingo', '/api/games/wingo/active');

    // Background preload the dynamic modal component so it's ready before user clicks
    import('@/components/EstimatedBetModal').catch(() => { });
  }, [router, prefetchGameData]);

  const [showEstimatedDetails, setShowEstimatedDetails] = useState(false);
  // Removed recentPayouts state and live feed simulation effect

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
      {/* Premium Header (Fixed At Top) */}
      <header className="flex-none relative pt-10 pb-6 px-6 bg-background/95 backdrop-blur-xl z-40 relative border-b border-white/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white opacity-20 z-0"></div>

        <div className="relative z-10 flex justify-between items-start mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1.5"
          >
            <h1 className="text-3xl font-black italic tracking-tighter text-gradient-gold leading-none">
              GET<span className="text-white">BET</span>
            </h1>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37]">PREDICTION</span>
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37]">PARTNER</span>
            </div>

            <div className="flex items-center gap-2 mt-3 bg-black/40 px-2 py-1.5 rounded-md border border-white/5 w-fit">
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Welcome to VIP Dashboard</span>
            </div>
          </motion.div>

          <div className="flex flex-col items-end gap-5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Download size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-bold">Download</span>
            </button>

            {wallet.vipPlan !== 'none' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-end mr-1"
              >
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1.5">VIP Balance</span>
                <span className="text-2xl font-black text-white leading-none tracking-tight">₹{(wallet.vipBalance || 0).toLocaleString('en-IN')}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Balance Cards Container */}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col gap-3">
            {/* Estimated Bet Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-4 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between h-[120px]"
              style={{ background: 'linear-gradient(135deg, #e8c85c 0%, #d4af37 100%)' }}
            >
              {/* Highlight curve */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>

              <div className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center relative z-10">
                <div className="w-5 h-5 bg-black rounded-sm flex items-end justify-center gap-0.5 p-1">
                  <div className="w-1 h-2 bg-primary rounded-sm"></div>
                  <div className="w-1 h-3 bg-primary rounded-sm"></div>
                  <div className="w-1 h-1.5 bg-primary rounded-sm"></div>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-[9px] font-black text-black/70 uppercase tracking-widest mb-1">Estimated Bet</p>
                <div className="flex items-center justify-between text-black">
                  <span className="text-2xl font-black tracking-tight leading-none">
                    ₹{(wallet.bettingBalance || 0).toLocaleString('en-IN')}
                  </span>
                  <button onClick={() => setShowEstimatedDetails(true)} className="flex items-center gap-1 active:scale-95 transition-transform hover:opacity-80 text-[10px] font-black uppercase tracking-wider bg-black/10 px-2 py-1 rounded-md">
                    Details <ChevronDown size={12} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 relative z-20 space-y-8 pt-4 pb-[120px] no-scrollbar">

        {/* Betting Apps Section */}
        <section className="mb-8">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-white">
            <span className="w-1 h-5 bg-primary rounded-full"></span>
            BETTING APPS
          </h3>
          {/* Replaced direct mapping with memoized component */}
          <BettingAppsGrid />
        </section>

        {/* High Performance Banner */}
        <Link href="/vip-plans" className="relative block group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-muted p-[1px]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative bg-background group-hover:bg-background/90 transition-colors h-full w-full rounded-[2.5rem] p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-gold-bright rotate-3 group-hover:rotate-0 transition-transform">
                <Crown size={30} className="text-black" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide uppercase">Upgrade to Pro</h3>
                <p className="text-gray-400 text-xs font-medium">Unlock 99.9% Signal Accuracy</p>
              </div>
            </div>
            <div className="bg-primary/20 p-2.5 rounded-full border border-primary/30 group-hover:translate-x-1 transition-transform">
              <ChevronRight className="text-primary" size={20} strokeWidth={3} />
            </div>
          </div>
        </Link>

        {/* Real-time Activity (Removed) */}
      </main>

      {/* Estimated Bet Modal dynamically loaded */}
      <AnimatePresence>
        {showEstimatedDetails && (
          <EstimatedBetModal
            wallet={wallet}
            onClose={() => setShowEstimatedDetails(false)}
            onAddAmount={async (amount) => {
              const success = await transfer(amount, 'from_vip');
              if (success) {
                setShowEstimatedDetails(false);
                alert('Amount added to your estimated bet amount');
              }
            }}
            onAddFunds={() => {
              setShowEstimatedDetails(false);
              router.push('/add-funds');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

