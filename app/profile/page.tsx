'use client';

import { useWallet } from '@/hooks/use-wallet';
import { useState, useEffect } from 'react';
import { Crown, User, Lock, Bell, ShieldCheck, LogOut, ChevronRight, Diamond, Settings, FileText, HelpCircle, Gift, Star, TrendingUp, Wallet, Pencil, Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { userService, UserProfile } from '@/services/userService';

const menuItems = [
  { icon: User, label: 'Account Details', href: '/profile/account', color: '#facc15' },
  { icon: Lock, label: 'Security & Password', href: '/profile/security', color: '#3b82f6' },
  { icon: Bell, label: 'Notification Settings', href: '/profile/notifications', color: '#f97316' },
  { icon: FileText, label: 'Terms & Conditions', href: '/terms', color: '#8b5cf6' },
  { icon: ShieldCheck, label: 'Privacy Policy', href: '/privacy', color: '#06b6d4' },
  { icon: HelpCircle, label: 'Help & FAQ', href: '/support', color: '#ec4899' },
];

const stats = [
  { label: 'Total Bets', value: '1,248', icon: TrendingUp },
  { label: 'Win Rate', value: '74%', icon: Star },
  { label: 'Net P&L', value: '+₹24K', icon: Wallet },
];

const VIP_PLANS: Record<string, string> = {
  'none': 'FREE MEMBER',
  'starter': 'STARTER VIP',
  'growth': 'GROWTH VIP',
  'elite': 'ELITE VIP',
  'PLATINUM VIP': 'PLATINUM VIP' // Keeping for backward compatibility or demo
};

export default function Profile() {
  const { wallet } = useWallet();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [tempName, setTempName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const data = await userService.getProfile();
      if (data) {
        setProfile(data);
      } else {
        setError('Failed to load profile. Please login again.');
        router.push('/login');
      }
      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  const handleSaveName = async () => {
    const trimmed = tempName.trim();
    if (!trimmed || trimmed.length < 2) {
      setSaveError('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    setSaveError('');
    
    if (!profile?.phone) return;

    const res = await userService.updateName(profile.phone, trimmed);
    if (res.success) {
      setProfile(prev => prev ? ({ ...prev, name: res.name }) : null);
      setEditMode(false);
    } else {
      setSaveError(res.error || 'Failed to save');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('wallet');
    await userService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] items-center justify-center">
        <Loader2 className="text-[#D4AF37] animate-spin" size={40} />
        <p className="text-gray-500 text-xs mt-4 tracking-widest uppercase">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <header className="relative pt-10 pb-4 px-5 flex items-center justify-between shrink-0 z-10">
        <h2 className="text-white text-lg font-black tracking-wider uppercase">Profile</h2>
        <button className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 transition">
          <Settings size={16} className="text-gray-400" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-[100px]">

        {/* Avatar + Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center px-5 pb-6 pt-2"
        >
          <div className="relative mb-4">
            {/* Glow ring */}
            <div className="absolute -inset-1.5 rounded-full opacity-50 blur-md" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
            <div className="relative w-24 h-24 rounded-full border-2 border-[#D4AF37] p-1 bg-[#0a0a0a]">
              <Image
                src="https://picsum.photos/seed/vip/200/200"
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center border-2 border-[#0A0A0A]">
              <Crown size={13} className="text-black" />
            </div>
          </div>

          {editMode ? (
            <div className="w-full px-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-2xl px-4 py-2">
                <input
                  autoFocus
                  type="text"
                  value={tempName}
                  onChange={(e) => { setTempName(e.target.value); setSaveError(''); }}
                  maxLength={30}
                  placeholder="Enter your name"
                  className="flex-1 bg-transparent outline-none text-white font-black text-base placeholder-gray-600"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="w-8 h-8 rounded-xl bg-[#D4AF37] flex items-center justify-center active:scale-90 transition"
                >
                  {saving ? <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Check size={14} className="text-black" strokeWidth={3} />}
                </button>
                <button
                  onClick={() => { setEditMode(false); setSaveError(''); }}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 transition"
                >
                  <X size={14} className="text-gray-400" strokeWidth={3} />
                </button>
              </div>
              {saveError && <p className="text-red-400 text-[10px] text-center mt-1 font-bold">{saveError}</p>}
            </div>
          ) : (
            <button
              onClick={() => { setTempName(profile?.name || ''); setEditMode(true); }}
              className="flex items-center gap-2 group"
            >
              <h1 className="text-xl font-black text-white">{profile?.name || 'User'}</h1>
              <Pencil size={13} className="text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
            </button>
          )}
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-0.5">{profile?.phone ? `+91 ${profile.phone}` : 'GetBet VIP Member'}</p>

          {/* VIP Badge */}
          <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
            <Diamond size={12} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-black tracking-widest uppercase">
              {VIP_PLANS[profile?.vipPlan || 'none']}
            </span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 grid grid-cols-3 gap-3 mb-5"
        >
          {stats.map((s, i) => (
            <div key={i} className="bg-[#111111] border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-1">
              <s.icon size={14} className="text-[#D4AF37]" />
              <p className="text-white font-black text-sm">{s.value}</p>
              <p className="text-gray-600 text-[9px] uppercase tracking-wider text-center">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mx-5 mb-5 rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #B07D10 0%, #D4AF37 50%, #9e8508 100%)' }}
        >
          <div className="relative p-5 flex items-center justify-between">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10">
              <p className="text-black/70 text-[9px] font-black uppercase tracking-widest mb-1">Membership Status</p>
              <p className="text-black text-2xl font-black">{VIP_PLANS[profile?.vipPlan || 'none']}</p>
              <p className="text-black/60 text-[10px] font-bold mt-1">Tier 1 • All Benefits Unlocked</p>
            </div>
            <div className="relative z-10 flex flex-col items-end gap-2">
              <Diamond size={32} className="text-black/50" />
              <div className="bg-black/20 px-2 py-1 rounded-lg">
                <p className="text-black font-black text-[9px] tracking-widest">ACTIVE</p>
              </div>
            </div>
          </div>

          {/* Balance Row */}
          <div className="bg-black/20 px-5 py-3 flex justify-between items-center">
            <span className="text-black/70 text-xs font-bold">Wallet Balance</span>
            <span className="text-black font-black text-sm">₹{wallet.mainBalance.toLocaleString('en-IN')}</span>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="mx-5 flex flex-col gap-2 mb-5">
          {menuItems.map((item, i) => (
            <Link key={item.label} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#111111] border border-white/5 active:scale-[0.99] transition-all hover:border-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.color + '15', border: `1px solid ${item.color}30` }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <span className="text-gray-200 text-sm font-semibold">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="mx-5 mb-10">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-2 text-red-400 font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-all hover:bg-red-500/10 hover:border-red-500/40"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
