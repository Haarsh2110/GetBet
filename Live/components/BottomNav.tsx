'use client';

import { Home, User, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Wallet, label: 'Wallet', href: '/wallet' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <>
      {/* Background fade to prevent text collision */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background via-background/95 to-transparent z-40 pointer-events-none"></div>

      <nav className="absolute pb-[env(safe-area-inset-bottom)] bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-50">
        <div className="bg-[#111111]/80 backdrop-blur-2xl rounded-[2.5rem] h-[76px] px-2 flex items-center justify-between border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] relative">

          {/* Subtle top highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

          <div className="w-full h-full flex items-center justify-around px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link key={item.label} href={item.href} prefetch={true} className="flex flex-col items-center justify-center gap-1.5 w-16 relative h-full group py-2 flex-shrink-0">
                  <item.icon
                    size={24}
                    className={`transition-all duration-300 ${isActive ? 'text-primary scale-[1.15] drop-shadow-md' : 'text-gray-500 group-hover:text-gray-300'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-bottom"
                      className="absolute bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

