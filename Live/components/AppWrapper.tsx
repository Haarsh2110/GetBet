'use client';

import { WalletProvider } from '@/hooks/use-wallet';
import BottomNav from '@/components/BottomNav';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="flex flex-col min-h-screen pb-24">
        {children}
        <BottomNav />
      </div>
    </WalletProvider>
  );
}
