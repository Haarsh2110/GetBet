'use client';

import { useRouter } from 'next/navigation';
import { Dices, PlaneTakeoff, LayoutGrid, CircleDot, Club, Bomb, Star, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const allGames = [
  { name: 'WIN GO', icon: Dices, color: '#f97316', status: 'LIVE', players: '5.2K', multiplier: null, path: '/wingo' },
  { name: 'AVIATOR', icon: PlaneTakeoff, color: '#ef4444', status: 'LIVE', players: '2.4K', multiplier: '23.4x', path: '#' },
  { name: 'LIMBO', icon: LayoutGrid, color: '#3b82f6', status: 'LIVE', players: '1.2K', multiplier: null, path: '#' },
];

const categories = ['All', 'Live', 'Popular', 'New'];

export default function GamesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'Live'
    ? allGames.filter(g => g.status === 'LIVE')
    : allGames;

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <header className="pt-10 pb-4 px-5 shrink-0 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">GetBet VIP</p>
            <h1 className="text-2xl font-black text-[#facc15] uppercase tracking-widest">All Games</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 text-[10px] font-black uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${activeCategory === c
                ? 'bg-[#facc15] text-black'
                : 'bg-white/5 text-gray-500 border border-white/5'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-5 pt-4 pb-[100px] overflow-y-auto no-scrollbar flex flex-col gap-4">

        {/* VIP Signal Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111111] border border-[#facc15]/20 rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1a1500 0%, #111100 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#facc15]/15 border border-[#facc15]/30 flex items-center justify-center">
              <Zap size={18} className="text-[#facc15]" />
            </div>
            <div>
              <p className="text-white font-black text-sm">VIP Signal Accuracy</p>
              <p className="text-green-500 text-[10px] font-black tracking-widest">98.4% SUCCESS RATE</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#facc15]">
            <Star size={12} fill="#facc15" />
            <ChevronRight size={16} strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((game, i) => (
            <motion.button
              key={game.name}
              onClick={() => game.path !== '#' && router.push(game.path)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative bg-[#111111] border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-3 overflow-hidden group active:border-white/20 transition-all"
            >
              {/* BG glow */}
              <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity rounded-2xl" style={{ background: `radial-gradient(circle at center, ${game.color}15 0%, transparent 70%)` }} />

              {/* Live dot */}
              {game.status === 'LIVE' && (
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                </div>
              )}

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                style={{ background: game.color + '15', borderColor: game.color + '40' }}
              >
                <game.icon size={28} style={{ color: game.color }} strokeWidth={1.5} />
              </div>

              <div className="text-center">
                <p className="text-white font-black text-sm tracking-wider">{game.name}</p>
                <p className="text-gray-600 text-[9px] mt-0.5">{game.players} playing</p>
              </div>

              {game.multiplier && (
                <div className="bg-[#f97316]/20 border border-[#f97316]/30 px-2 py-0.5 rounded-full">
                  <p className="text-[#f97316] text-[9px] font-black">{game.multiplier}</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Players', value: '10.4K', icon: TrendingUp, color: '#facc15' },
            { label: 'Jackpot Pool', value: '₹2.1Cr', icon: Star, color: '#22c55e' },
            { label: 'Daily Winners', value: '3,241', icon: Zap, color: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} className="bg-[#111111] border border-white/5 rounded-2xl p-3 flex flex-col gap-1 items-center">
              <s.icon size={14} style={{ color: s.color }} />
              <p className="text-white font-black text-xs">{s.value}</p>
              <p className="text-gray-600 text-[8px] uppercase tracking-wider text-center leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
