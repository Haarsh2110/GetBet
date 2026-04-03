'use client';

import { useWallet } from '@/hooks/use-wallet';
import { useState, useEffect } from 'react';
import { Crown, User, Lock, Bell, ShieldCheck, LogOut, ChevronRight, Diamond, Settings, FileText, HelpCircle, Gift, Star, TrendingUp, Wallet, Pencil, Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { userService, UserProfile } from '@/services/userService';
import ConfirmationModal from '@/components/ConfirmationModal';

const menuItems = [
  { icon: User, label: 'Account Details', href: '/profile/account', color: '#facc15' },
  { icon: Lock, label: 'Security & Password', href: '/profile/security', color: '#3b82f6' },
  { icon: Bell, label: 'Notification Settings', href: '/profile/notifications', color: '#f97316' },
  { icon: FileText, label: 'Terms & Conditions', href: '/terms', color: '#8b5cf6' },
  { icon: ShieldCheck, label: 'Privacy Policy', href: '/privacy', color: '#06b6d4' },
  { icon: HelpCircle, label: 'Help & FAQ', href: '/support', color: '#ec4899' },
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

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleAvatarClick = () => {
    document.getElementById('avatar-input')?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Local Preview for instant UI
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        
        // 2. Permanent Save to DB
        await userService.updateAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const data = await userService.getProfile();
      if (data) {
        setProfile(data);
        if (data.avatar) setAvatarPreview(data.avatar);
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
      <div className="flex flex-col min-min-h-full bg-background items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
        <p className="text-gray-500 text-xs mt-4 tracking-widest uppercase font-black">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-min-h-full bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>
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
          <div className="relative mb-4 cursor-pointer group" onClick={handleAvatarClick}>
            <input 
              type="file" 
              id="avatar-input" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
            {/* Glow ring */}
            <div className="absolute -inset-1.5 rounded-full opacity-40 blur-md bg-indigo-500/30 group-hover:bg-indigo-500/50 transition-all" />
            <div className="relative w-24 h-24 rounded-full border-2 border-primary p-1 bg-surface shadow-gold group-hover:scale-105 transition-transform duration-300">
              <Image
                src={avatarPreview || "https://picsum.photos/seed/vip/200/200"}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
              {/* Overlay for upload hint */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Pencil size={20} className="text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-lg">
              <Crown size={13} className="text-white" />
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
          <p className="text-primary/60 text-[10px] font-black tracking-[0.2em] uppercase mt-1 bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
            User ID: {profile?.id || 'NO_ID'}
          </p>


        </motion.div>





        {/* Menu Items */}
        <div className="mx-5 flex flex-col gap-2 mb-5">
          {menuItems.map((item, i) => (
            <Link key={item.label} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-white/5 active:scale-[0.99] transition-all hover:border-indigo-500/30 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
                    <item.icon size={16} className="text-indigo-400" />
                  </div>
                  <span className="text-slate-100 text-sm font-black uppercase tracking-wider">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="mx-5 mb-10">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-2 text-red-400 font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-all hover:bg-red-500/10 hover:border-red-500/40"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </main>

      <ConfirmationModal 
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        confirmColor="bg-red-500"
      />
    </div>
  );
}
