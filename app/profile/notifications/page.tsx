'use client';

import { ChevronLeft, Bell, MessageCircle, Mail, Smartphone, ToggleRight, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function NotificationSettings() {
    const router = useRouter();

    const [settings, setSettings] = useState({
        push: true,
        sms: false,
        email: true,
        marketing: true
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const options = [
        { key: 'push', label: "Push Notifications", description: "Get real-time bet updates.", icon: Bell },
        { key: 'sms', label: "SMS Alerts", description: "Direct alerts to your phone.", icon: Smartphone },
        { key: 'email', label: "Email Reports", description: "Weekly performance summaries.", icon: Mail },
        { key: 'marketing', label: "Offers & Bonus", description: "Personalized VIP rewards.", icon: MessageCircle }
    ];

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] text-white">
            <header className="pt-10 pb-4 px-5 flex items-center gap-4 shrink-0 border-b border-white/5">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center">
                    <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <h1 className="text-lg font-black tracking-wider uppercase">Notifications</h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24">
                <div className="bg-[#f97316]/10 border border-[#f97316]/20 rounded-2xl p-5 flex items-center gap-4 mb-8">
                    <Settings2 size={32} className="text-[#f97316]" />
                    <div>
                        <p className="text-white text-sm font-black tracking-wide">Preference Center</p>
                        <p className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">Manage how we contact you</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {options.map((item, i) => (
                        <div 
                            key={i}
                            className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex items-center justify-between"
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
                            <button 
                                onClick={() => toggle(item.key as any)}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${settings[item.key as keyof typeof settings] ? 'bg-[#f97316]' : 'bg-gray-800'}`}
                            >
                                <motion.div 
                                    animate={{ x: settings[item.key as keyof typeof settings] ? 24 : 0 }}
                                    className="w-4 h-4 bg-white rounded-full shadow-lg"
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
