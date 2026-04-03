'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldCheck, Gamepad2 } from 'lucide-react';

export default function SplashScreen() {
    const [show, setShow] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        console.log("[DEBUG] SplashScreen Mounting...");
        setShow(true);
        // Simulate loading progress
        const duration = 400; 
        const intervalTime = 20;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setProgress((currentStep / steps) * 100);

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(() => setShow(false), 200);
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
                    className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[414px] z-[100] flex flex-col items-center justify-between overflow-hidden shadow-2xl bg-background"
                >
                    {/* Professional Terminal Background Effects */}
                    <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none"></div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mt-12 pb-10">
                        {/* Logo Box */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="bg-surface rounded-3xl w-[140px] h-[140px] mb-8 flex items-center justify-center shadow-gold border border-white/10 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Gamepad2 size={72} strokeWidth={2.5} className="text-white relative z-10" />
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-center"
                        >
                            <h1 className="text-white text-[4.5rem] font-black tracking-tighter mb-1 leading-none italic">
                                GET<span className="text-primary">BET</span>
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="h-[2px] w-8 bg-primary/30 rounded-full"></div>
                                <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">Safe & Secure</span>
                                <div className="h-[2px] w-8 bg-primary/30 rounded-full"></div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Loading Area */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="w-full px-12 pb-16 relative z-10 flex flex-col items-center"
                    >
                        <div className="flex items-center justify-between w-full mb-3 px-1">
                            <p className="text-primary-light/60 text-[10px] font-black uppercase tracking-widest italic animate-pulse">Loading Secure App...</p>
                            <p className="text-white text-[10px] font-black italic">{Math.round(progress)}%</p>
                        </div>

                        {/* Loading Bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-12 border border-white/5 p-[1px]">
                            <motion.div
                                className="h-full bg-primary rounded-full shadow-gold"
                                transition={{ type: "spring", stiffness: 50 }}
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Version Badge */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="bg-surface/50 border border-white/10 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-md shadow-lg"
                        >
                            <ShieldCheck size={16} className="text-primary" />
                            <span className="text-white text-[10px] font-black tracking-widest uppercase">Verified & Secure</span>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
