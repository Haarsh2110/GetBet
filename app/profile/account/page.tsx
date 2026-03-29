'use client';

import { ChevronLeft, User, Phone, Mail, IdCard, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { userService, UserProfile } from '@/services/userService';

export default function AccountDetails() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            const data = await userService.getProfile();
            if (data) setProfile(data);
            setLoading(false);
        }
        fetchProfile();
    }, []);

    if (loading) return null;

    const details = [
        { label: "USER ID", value: profile?.id || 'N/A', icon: IdCard },
        { label: "FULL NAME", value: profile?.name || 'User', icon: User },
        { label: "PHONE NUMBER", value: `+91 ${profile?.phone}` || 'N/A', icon: Phone },
        { label: "MEMBERSHIP", value: profile?.vipPlan?.toUpperCase() || 'FREE', icon: ShieldCheck },
        { label: "MEMBER SINCE", value: "January 2026", icon: Calendar },
        { label: "COUNTRY", value: "India", icon: MapPin }
    ];

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] text-white">
            <header className="pt-10 pb-4 px-5 flex items-center gap-4 shrink-0 border-b border-white/5">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center">
                    <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <h1 className="text-lg font-black tracking-wider uppercase">Account Details</h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24">
                <div className="grid grid-cols-1 gap-4">
                    {details.map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <item.icon size={18} className="text-[#D4AF37]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5">{item.label}</p>
                                <p className="text-white text-sm font-bold tracking-wide">{item.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        To update verified details, please contact <br/> our dedicated VIP support team.
                    </p>
                </div>
            </main>
        </div>
    );
}
