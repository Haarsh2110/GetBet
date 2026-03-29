'use client';

import { ChevronLeft, FileText, CheckCircle2, User, Globe, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function TermsConditions() {
    const router = useRouter();

    const sections = [
        {
            title: "Eligibility",
            icon: User,
            content: "You must be at least 18 years of age and reside in a jurisdiction where online gambling is legal to use this platform. All accounts must be verified with a valid phone number."
        },
        {
            title: "Fair Play",
            icon: CheckCircle2,
            content: "We use a certified Random Number Generator (RNG) to ensure all game outcomes are fair. Any attempt to manipulate results or use automated scripts will result in immediate account termination."
        },
        {
            title: "Withdrawals",
            icon: Globe,
            content: "Withdrawal requests are processed within 2-24 hours. Minimum and maximum limits apply based on your VIP tier status. All funds must be requested using the original deposit method where possible."
        }
    ];

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] text-white">
            <header className="pt-10 pb-4 px-5 flex items-center gap-4 shrink-0 border-b border-white/5">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center">
                    <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <h1 className="text-lg font-black tracking-wider uppercase">Terms & Conditions</h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center justify-center mb-4">
                        <FileText size={32} className="text-[#8b5cf6]" />
                    </div>
                    <p className="text-gray-500 text-xs text-center uppercase tracking-widest font-bold">Effective Date: January 1, 2026</p>
                </div>

                <div className="flex flex-col gap-6">
                    {sections.map((section, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#111111] border border-white/5 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <section.icon size={18} className="text-[#8b5cf6]" />
                                <h3 className="font-bold text-sm tracking-wide">{section.title}</h3>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">{section.content}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 text-center">
                    <HelpCircle size={16} className="text-[#8b5cf6] mx-auto mb-2" />
                    <p className="text-[#8b5cf6] text-[10px] font-black uppercase tracking-widest">
                        By using GetBet VIP, you agree to these legal terms.
                    </p>
                </div>
            </main>
        </div>
    );
}
