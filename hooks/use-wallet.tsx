'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface WalletState {
  mainBalance: number;
  bettingBalance: number;
  reverseBalance: number;
  vipBalance: number;
  estimatedBet: number;
  vipPlan: string;
  vipExpiresAt: string | null;
  name: string;
  userId: string | null; // Track logged in user
  loading: boolean;
  error: string | null;
  gameCache: Record<string, any>; // Global cache for prefetched game data
}

interface WalletContextType {
  wallet: WalletState;
  deposit: (amount: number, txnId?: string, method?: string, plan?: string) => Promise<boolean>;
  withdraw: (amount: number, details?: any) => Promise<boolean>;
  transfer: (amount: number, direction: 'to_betting' | 'to_main' | 'from_vip' | 'from_reverse') => Promise<boolean>;
  transferToMain: () => void;
  placeReverseBet: (amount: number, type: 'big' | 'small') => void;
  refreshWallet: () => Promise<void>;
  buyPlan: (planId: string) => Promise<boolean>;
  logout: () => void;
  prefetchGameData: (gameId: string, endpoint: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("[WalletProvider] MOUNTED");
    return () => console.log("[WalletProvider] UNMOUNTED");
  }, []);

  const [wallet, setWallet] = useState<WalletState>(() => {
    // Attempt to pre-warm from localStorage for instant render
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wallet_cache');
      if (stored) {
        try {
          const cached = JSON.parse(stored);
          return { ...cached, loading: false, error: null, gameCache: {} };
        } catch (e) {}
      }
    }
    return {
      mainBalance: 0,
      bettingBalance: 0,
      reverseBalance: 0,
      vipBalance: 0,
      estimatedBet: 0,
      vipPlan: 'none',
      vipExpiresAt: null,
      name: '',
      userId: null,
      loading: true,
      error: null,
      gameCache: {},
    };
  });

  // ─── Background wallet refresh (non-blocking) ────────────────────────────
  // Page renders instantly from localStorage. API call happens silently.
  const lastRefreshRef = React.useRef<number>(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const refreshWallet = useCallback(async (force = false) => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!storedUser) {
      setWallet(prev => ({ ...prev, loading: false }));
      return;
    }

    // Debounce: Don't re-fetch if fetched within last 3 seconds (unless forced)
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < 3000) return;
    lastRefreshRef.current = now;

    const user = JSON.parse(storedUser);
    const userId = user.id || user.userId;

    if (!userId) {
      setWallet(prev => ({ ...prev, loading: false }));
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/wallet?userId=${userId}`, { 
        signal: abortControllerRef.current.signal
      });
      if (res.status === 404) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load wallet');
      const data = await res.json();
      
      const payload = {
        mainBalance: data.mainBalance,
        bettingBalance: data.bettingBalance,
        reverseBalance: data.reverseBalance || 0,
        vipBalance: data.vipBalance || 0,
        estimatedBet: data.estimatedBet || 0,
        vipPlan: data.vipPlan || 'none',
        vipExpiresAt: data.vipExpiresAt || null,
        name: data.name,
        userId,
      };
      
      localStorage.setItem('wallet_cache', JSON.stringify(payload));
      setWallet(prev => ({ ...prev, ...payload, loading: false }));
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setWallet(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    // Immediately show cached data (already loaded from localStorage in useState init)
    // Then refresh in background — page is already visible, no blocking
    refreshWallet();
  }, [refreshWallet]);

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Deposit, Withdraw, etc. (They now need userId)
  const deposit = async (amount: number, txnId?: string, method = 'USDT TRC20', plan?: string) => {
    let currentUserId = wallet.userId;
    if (!currentUserId) {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        currentUserId = parsed.id || parsed.userId;
      }
    }

    if (!currentUserId) {
      alert("Error: User session not found. Please logout and login again.");
      return false;
    }

    try {
      console.log(`[useWallet] Sending deposit request...`, { amount, userId: currentUserId, txnId });
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, txnId, method, userId: currentUserId, plan }),
      });

      const data = await res.json();
      console.log(`[useWallet] Deposit API response:`, data);

      if (res.ok && data.success) {
          if (data.alreadyProcessed) {
              alert(`Info: ${data.message || 'This payment was already added to your wallet.'}`);
          }
          await refreshWallet();
          return true;
      }

      alert(`Deposit Error: ${data.error || 'Server rejected the request'}`);
      return false;
    } catch (e: any) {
      console.error('[useWallet] Network error during deposit:', e);
      alert(`Network Error: ${e.message}`);
      return false;
    }
  };

  const withdraw = async (amount: number, details: any) => {
    if (!wallet.userId) return false;
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, ...details, userId: wallet.userId }),
      });
      if (res.ok) {
        await refreshWallet();
        return true;
      }
      return false;
    } catch { return false; }
  };

  const transfer = async (amount: number, direction: 'to_betting' | 'to_main' | 'from_vip' | 'from_reverse') => {
    if (!wallet.userId) return false;
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: wallet.userId, amount, direction }),
      });
      if (res.ok) {
        await refreshWallet();
        return true;
      }
      const data = await res.json();
      alert(data.error || 'Transfer failed');
      return false;
    } catch {
      alert('Network error');
      return false;
    }
  };

  const transferToMain = () => {
    const total = wallet.bettingBalance + wallet.reverseBalance;
    if (total > 0) {
      transfer(total, 'to_main');
    }
  };

  const placeReverseBet = () => { };

  const buyPlan = async (planId: string) => {
    if (!wallet.userId) return false;
    try {
      const res = await fetch('/api/wallet/buy-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: wallet.userId, planId }),
      });
      if (res.ok) {
        await refreshWallet();
        return true;
      }
      const data = await res.json();
      alert(data.error || 'Failed to purchase plan');
      return false;
    } catch { 
      alert('Network error. Please try again.');
      return false; 
    }
  };

  const prefetchGameData = useCallback(async (gameId: string, endpoint: string) => {
    try {
        console.log(`[useWallet] Prefetching game data for ${gameId}...`);
        const res = await fetch(endpoint, { cache: 'no-store' });
        const json = await res.json();
        if (json.success) {
            setWallet(prev => ({
                ...prev,
                gameCache: {
                    ...prev.gameCache,
                    [gameId]: json.data
                }
            }));
        }
    } catch (e) {
        console.error(`[useWallet] Failed to prefetch ${gameId}:`, e);
    }
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, deposit, withdraw, transfer, transferToMain, placeReverseBet, refreshWallet, buyPlan, logout, prefetchGameData }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
