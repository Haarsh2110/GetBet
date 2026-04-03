'use client';

import { ChevronLeft, MoreVertical, Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showSupport?: boolean;
  showMore?: boolean;
}

export default function Header({ title, showBack = true, showSupport = false, showMore = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="relative z-50 shrink-0 glass-dark border-b border-white/5 pt-12 pb-5 px-6">
      <div className="flex items-center justify-between h-10">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl glass border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
        ) : <div className="w-10" />}

        <h1 className="text-sm font-black tracking-[0.2em] uppercase text-center flex-1 text-gradient-gold">{title}</h1>

        {showSupport ? (
          <button className="w-10 h-10 rounded-2xl glass border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all active:scale-90 group">
            <Headphones size={20} strokeWidth={2.5} />
          </button>
        ) : showMore ? (
          <button className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-primary/80">
            <MoreVertical size={24} />
          </button>
        ) : <div className="w-10" />}
      </div>
    </header>
  );
}

