import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/hooks/use-wallet';
import BottomNav from '@/components/BottomNav';
import SplashScreen from '@/components/SplashScreen';
import AppLayout from '@/components/AppLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'GetBet VIP - High Performance Betting',
  description: 'Premium betting dashboard and prediction partner.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} dark`}>
      <body className="bg-background text-white antialiased" suppressHydrationWarning>
        <WalletProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </WalletProvider>
      </body>
    </html>
  );
}
