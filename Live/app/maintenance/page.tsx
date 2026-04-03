'use client';

import { motion } from 'motion/react';
import { Wrench, ShieldAlert, Clock, LayoutDashboard } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full opacity-20" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10 space-y-8"
            >
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-[32px] bg-surface border border-white/5 flex items-center justify-center shadow-2xl relative">
                        <Wrench size={40} className="text-primary animate-pulse" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 border-4 border-background shadow-lg">
                        <ShieldAlert size={16} className="text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
                        Under <span className="text-primary">Maintenance</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] font-black underline decoration-primary/40 underline-offset-8">
                        System Update
                    </div>
                </div>

                <div className="bg-surface/50 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 space-y-4 shadow-2xl">
                    <p className="text-gray-400 text-sm font-bold leading-relaxed italic">
                        "The platform is currently down for a quick update to improve your experience. We will be back shortly."
                    </p>
                    <div className="h-0.5 w-12 bg-primary/20 mx-auto rounded-full" />
                    <div className="flex items-center justify-center gap-3 text-white/40">
                        <Clock size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Expected Restoration: T-60 Min</span>
                    </div>
                </div>

                <div className="pt-8">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] mb-4">Official Project Status</p>
                    <div className="flex justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                        <div className="w-2 h-2 rounded-full bg-primary/10" />
                    </div>
                </div>
            </motion.div>

            {/* Subtle branding footer */}
            <div className="absolute bottom-10 left-0 right-0 text-center">
                <div className="flex items-center justify-center gap-3 opacity-20 grayscale">
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                        <LayoutDashboard size={10} className="text-black" />
                    </div>
                    <span className="text-[10px] font-black tracking-tighter uppercase italic text-white flex gap-1">
                        GetBet <span className="text-white font-bold">VIP</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

