'use client';

import { ChevronLeft, ShieldCheck, Lock, Eye, FileText, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
    const router = useRouter();

    const sections = [
        {
            title: "Data Collection",
            icon: Eye,
            content: "We collect information you provide directly to us, such as when you create an account, make a deposit, or contact support. This includes your name, phone number, and transaction history."
        },
        {
            title: "Data Usage",
            icon: Globe,
            content: "Your data is used to provide and maintain our services, process transactions, and notify you about changes to our platform. We do not sell your personal information to third parties."
        },
        {
            title: "Security Measures",
            icon: Lock,
            content: "We implement industry-standard security protocols to protect your data from unauthorized access, loss, or misuse. This includes end-to-end encryption for all sensitive transactions."
        }
    ];

    return (
        <div className="flex flex-col min-min-h-full bg-[#0A0A0A] text-white">
            <header className="pt-10 pb-4 px-5 flex items-center gap-4 shrink-0 border-b border-white/5">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center">
                    <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <h1 className="text-lg font-black tracking-wider uppercase">Privacy Policy</h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center mb-4">
                        <ShieldCheck size={32} className="text-[#06b6d4]" />
                    </div>
                    <p className="text-gray-500 text-xs text-center uppercase tracking-widest font-bold">Last Updated: March 2026</p>
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
                                <section.icon size={18} className="text-[#06b6d4]" />
                                <h3 className="font-bold text-sm tracking-wide">{section.title}</h3>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">{section.content}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-[#06b6d4]/5 border border-[#06b6d4]/10">
                    <p className="text-[#06b6d4] text-[10px] font-black uppercase tracking-widest text-center">
                        Need more details? Contact our 24/7 VIP support.
                    </p>
                </div>
            </main>
        </div>
    );
}
