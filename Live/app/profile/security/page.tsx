'use client';

import { ChevronLeft, Lock, Key, Smartphone, Fingerprint, History, ShieldCheck, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function SecuritySettings() {
    const router = useRouter();

    const options = [
        { label: "Change Password", description: "Regularly update your login secret.", icon: Key, color: "#3b82f6", active: true },
        { label: "Two-Step Authentication", description: "Extra layer of phone verification.", icon: Smartphone, color: "#22c55e", active: false },
        { label: "Device History", description: "Review and manage other sessions.", icon: History, color: "#D4AF37", active: true },
        { label: "Withdrawal PIN", description: "Unique PIN for funds transfer.", icon: Lock, color: "#facc15", active: false }
    ];

    return (
        <div className="flex flex-col min-min-h-full bg-[#0A0A0A] text-white">
            <header className="pt-10 pb-4 px-5 flex items-center gap-4 shrink-0 border-b border-white/5">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center">
                    <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <h1 className="text-lg font-black tracking-wider uppercase">Security & Password</h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24">
                <div className="flex items-center gap-4 mb-8 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-2xl p-5">
                    <ShieldCheck size={32} className="text-green-500" />
                    <div>
                        <p className="text-white text-sm font-black tracking-wide">Account Status: SECURE</p>
                        <p className="text-green-500 text-[10px] uppercase tracking-widest font-bold">VIP Grade Protection Active</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {options.map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex items-center justify-between active:scale-[0.99] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <item.icon size={18} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold tracking-wide">{item.label}</p>
                                    <p className="text-gray-600 text-[10px] mt-0.5">{item.description}</p>
                                </div>
                            </div>
                            {item.active ? (
                                <div className="bg-[#22c55e]/20 text-green-500 text-[9px] font-black px-2 py-1 rounded-lg tracking-widest">ENABLED</div>
                            ) : (
                                <div className="bg-white/5 text-gray-700 text-[9px] font-black px-2 py-1 rounded-lg tracking-widest uppercase">Off</div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
