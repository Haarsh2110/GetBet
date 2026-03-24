'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldCheck } from 'lucide-react';

export default function SplashScreen() {
    const [show, setShow] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const hasShown = sessionStorage.getItem('splash_shown');
        if (hasShown) {
            setShow(false);
            return;
        }

        setShow(true);
        // Simulate loading progress
        const duration = 400; // Reduced from 2500 for faster load
        const intervalTime = 20;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setProgress((currentStep / steps) * 100);

            if (currentStep >= steps) {
                clearInterval(timer);
                sessionStorage.setItem('splash_shown', 'true');
                setTimeout(() => setShow(false), 200); // Small delay before animating out
            }
        }, intervalTime);

        return () => {
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] flex flex-col items-center justify-between overflow-hidden shadow-2xl"
                    style={{
                        background: 'linear-gradient(145deg, #e88d26 0%, #d87114 100%)'
                    }}
                >
                    {/* Subtle light effect across the background */}
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[linear-gradient(-45deg,transparent_40%,rgba(255,255,255,0.08)_50%,transparent_60%)] z-0"></div>

                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mt-12 pb-10">
                        {/* Logo Box */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="bg-white rounded-[2rem] w-[130px] h-[130px] mb-8 flex items-center justify-center shadow-lg"
                        >
                            <Zap size={72} strokeWidth={0} fill="#e88d26" className="rotate-[15deg]" />
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-white text-[4rem] font-black tracking-tight mb-4 drop-shadow-sm leading-none"
                            style={{ fontFamily: 'var(--font-display, Inter)' }}
                        >
                            GETBET
                        </motion.h1>

                        {/* Separator Line */}
                        <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="w-14 h-1 bg-white/60 rounded-full mb-8"
                        />

                        {/* Subtitle */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="text-center flex flex-col gap-2"
                        >
                            <p className="text-white font-bold tracking-[0.25em] text-[15px] drop-shadow-sm">HIGH PERFORMANCE</p>
                            <p className="text-white font-bold tracking-[0.25em] text-[15px] drop-shadow-sm">BETTING</p>
                        </motion.div>
                    </div>

                    {/* Bottom Loading Area */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="w-full px-12 pb-12 relative z-10 flex flex-col items-center"
                    >
                        <p className="text-white text-[13px] font-semibold mb-4 text-center">Connecting to secure servers...</p>

                        {/* Loading Bar */}
                        <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden mb-12">
                            <motion.div
                                className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Version Badge */}
                        <div className="bg-black/10 px-5 py-2.5 rounded-full flex items-center justify-center gap-2">
                            <ShieldCheck size={14} className="text-white/90" />
                            <span className="text-white/90 text-[10px] font-bold tracking-widest uppercase">Version 1.0.4 • Stable</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
