'use client';

import { useWallet } from '@/hooks/use-wallet';
import { Download, Crown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const EstimatedBetModal = dynamic(() => import('@/components/EstimatedBetModal'), {
  ssr: false,
});

const bettingApps = [
    { id: 'wingo', name: 'WinGo', color: 'from-indigo-600 to-indigo-800', path: '/wingo' },
    { id: 'aviator', name: 'Aviator', color: 'from-surface to-surface-hover', path: '/aviator' },
    { id: 'limbo', name: 'Limbo', color: 'from-surface to-surface-hover', path: '/limbo' },
];

function GameIcon({ name }: { name: string }) {
    if (name === 'wingo') {
        return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="10" cy="16" r="8" fill="#FFD700" stroke="#FFA500" strokeWidth="1.5" />
                <circle cx="10" cy="16" r="4" fill="#FFA500" />
                <circle cx="22" cy="16" r="8" fill="#00CC44" stroke="#009933" strokeWidth="1.5" />
                <circle cx="22" cy="16" r="4" fill="#009933" />
                <circle cx="10" cy="10" r="3" fill="#40E0D0" />
            </svg>
        );
    }
    if (name === 'aviator') {
        return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 16 L16 8 L28 12 L22 16 L28 20 L16 24 Z" fill="white" fillOpacity="0.6" />
                <circle cx="16" cy="16" r="3" fill="white" />
            </svg>
        );
    }
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5">
            <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2" />
            <path d="M16 6 L22 16 L16 26 L10 16 Z" fill="white" fillOpacity="0.6" />
        </svg>
    );
}

const BettingAppsGrid = React.memo(() => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {bettingApps.map((app) => {
        const isActive = app.id === 'wingo';
        
        if (!isActive) {
            return (
                <div
                    key={app.id}
                    className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center p-3 cursor-not-allowed bg-surface/20 border border-white/5 grayscale group"
                >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md mb-2 border border-white/5 shadow-inner">
                        <GameIcon name={app.id} />
                    </div>
                    <span className="font-black tracking-[0.2em] text-[10px] text-white/40 uppercase">{app.name}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="px-3 py-1 border border-white/20 rounded-full">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Later</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
          <Link
            href={app.path}
            key={app.id}
            prefetch={true}
            className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center p-3 cursor-pointer bg-surface border border-white/10 shadow-[0_0_25px_rgba(212,175,55,0.05)] hover:border-primary/40 hover:shadow-gold translation-all duration-500 active:scale-95 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md mb-2 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform">
                <GameIcon name={app.id} />
            </div>
            <span className="font-black tracking-[0.2em] text-[10px] text-white uppercase group-hover:text-primary transition-colors">{app.name}</span>
          </Link>
        );
      })}
    </div>
  );
});

export default function Home() {
  const router = useRouter();
  const { wallet, transfer, prefetchGameData } = useWallet();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const criticalRoutes = ['/wingo', '/wallet', '/profile', '/add-funds', '/vip-plans'];
    criticalRoutes.forEach(route => {
      router.prefetch(route);
    });

    prefetchGameData('wingo', '/api/games/wingo/active');
    import('@/components/EstimatedBetModal').catch(() => { });
  }, [router, prefetchGameData]);

  const [showEstimatedDetails, setShowEstimatedDetails] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDownloadClick = async () => {
    if (!deferredPrompt) {
        alert('App is already installed or your browser does not support installation.');
        return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <header className="flex-none relative pt-10 pb-6 px-6 bg-background/95 backdrop-blur-xl z-40 relative border-b border-white/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-surface to-surface z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white opacity-5 z-0"></div>

        <div className="relative z-10 flex justify-between items-start mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1.5"
          >
            <h1 className="text-3xl font-black italic tracking-tighter text-white leading-none">
              GET<span className="text-primary">BET</span>
            </h1>


            <div className="flex items-center gap-2 mt-3 bg-black/40 px-2 py-1.5 rounded-md border border-white/5 w-fit">
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest uppercase italic">Welcome to VIP Dashboard</span>
            </div>
          </motion.div>

          <div className="flex flex-col items-end gap-5">
            <button 
              onClick={handleDownloadClick}
              className="standalone-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              <Download size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-bold">Download</span>
            </button>

            {wallet.vipPlan !== 'none' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-end mr-1"
              >
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1.5 italic">Elegible Value</span>
                <span className="text-2xl font-black text-white leading-none tracking-tight">₹{(wallet.vipBalance || 0).toLocaleString('en-IN')}</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-7 rounded-[2.5rem] overflow-hidden shadow-gold flex flex-col justify-between h-[150px] bg-primary-muted border border-white/20"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>

              <div className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center relative z-10">
                <div className="w-5 h-5 bg-black rounded-sm flex items-end justify-center gap-0.5 p-1">
                  <div className="w-1 h-2 bg-primary rounded-sm"></div>
                  <div className="w-1 h-3 bg-primary rounded-sm"></div>
                  <div className="w-1 h-1.5 bg-primary rounded-sm"></div>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.3em] mb-2 flex items-center gap-2 italic">
                   Active Stake
                </p>
                <div className="flex items-end justify-between text-black">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black tracking-tighter leading-none mb-1">
                      ₹{(wallet.bettingBalance || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] font-bold text-black/50 tracking-[0.1em] uppercase italic">Estimated Betting Amount</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 px-6 relative z-20 space-y-8 pt-4 pb-[20px] no-scrollbar">
        <section className="mb-8">
          <h3 className="font-display font-black text-lg mb-4 flex items-center gap-2 text-white">
            <span className="w-1.5 h-6 bg-primary rounded-full shadow-gold"></span>
            BETTING APPS
          </h3>
          <BettingAppsGrid />
        </section>

        <Link href="/vip-plans" className="relative block group overflow-hidden rounded-[2.5rem] bg-primary p-[1px] shadow-gold">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
          <div className="relative bg-surface group-hover:bg-surface/90 transition-colors h-full w-full rounded-[2.5rem] p-6 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Crown size={30} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide uppercase italic leading-none mb-1">Upgrade Access</h3>
                <p className="text-primary-light/60 text-[10px] font-black uppercase tracking-widest italic">VIP ACCESS PORTAL ENABLED</p>
              </div>
            </div>
            <div className="bg-primary p-2.5 rounded-full shadow-lg group-hover:translate-x-1 transition-transform">
              <ChevronRight className="text-white" size={20} strokeWidth={3} />
            </div>
          </div>
        </Link>
      </main>

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
