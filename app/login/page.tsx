'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [otp, setOtp] = useState(['', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Generate random OTP when moving to step 2
    const handleSendOtp = () => {
        if (phone.length < 10) return;
        setLoading(true);
        setTimeout(() => {
            const code = Math.floor(1000 + Math.random() * 9000).toString();
            setGeneratedOtp(code);
            setStep(2);
            setLoading(false);
        }, 800);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleVerify = async () => {
        const entered = otp.join('');
        if (entered !== generatedOtp) {
            alert('Invalid OTP! Please check the code on your screen.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();

            if (data.success) {
                // Save to localStorage for the session
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/');
            }
        } catch (err) {
            alert('Login failed. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] items-center justify-center px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />

            {/* Logo Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-gold">
                    <Zap size={36} className="text-primary fill-primary" />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-gradient-gold">
                    GET<span className="text-white">BET</span>
                </h1>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">VIP Intelligence Terminal</p>
            </motion.div>

            {/* Main Card */}
            <div className="w-full max-w-sm glass-dark rounded-[3rem] p-8 border border-white/5 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="phone-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-black text-white">Welcome Back</h2>
                                <p className="text-gray-500 text-xs">Enter your phone number to continue</p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-4 gap-3 focus-within:border-primary/50 transition-all">
                                    <Phone size={18} className="text-gray-500" />
                                    <span className="text-gray-400 font-bold border-r border-white/10 pr-3">+91</span>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-transparent border-none outline-none text-white font-bold w-full p-0 placeholder-gray-600 focus:ring-0"
                                    />
                                </div>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={phone.length < 10 || loading}
                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${phone.length === 10
                                        ? 'bg-primary text-black shadow-gold'
                                        : 'bg-white/5 text-gray-600 border border-white/5'
                                        }`}
                                >
                                    {loading ? 'Processing...' : 'Secure Login'}
                                    <ArrowRight size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-black text-white">Verify Identity</h2>
                                <p className="text-gray-500 text-xs">Security code sent to +91 {phone}</p>
                            </div>

                            {/* Code Inputs */}
                            <div className="flex justify-between gap-3 my-8">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        className="w-14 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-primary focus:border-primary focus:bg-primary/5 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={otp.some(d => !d) || loading}
                                className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
                            >
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                                <ShieldCheck size={18} strokeWidth={2.5} />
                            </button>

                            <button onClick={() => setStep(1)} className="w-full text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-gray-400 transition">
                                Change Number
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* OTP Alert (The "Magic" Box) */}
            <AnimatePresence>
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-24 px-6 py-4 bg-[#1a1a1a] border border-primary/30 rounded-3xl flex items-center gap-4 shadow-2xl z-50 animate-float"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Zap size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Your Private OTP</p>
                            <p className="text-xl font-black text-white tracking-[0.4em]">{generatedOtp}</p>
                        </div>
                        <div className="ml-4 pl-4 border-l border-white/10">
                            <CheckCircle2 size={24} className="text-green-500" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                Protected by <span className="text-gray-400">GetBet Shield</span>
            </p>
        </div>
    );
}
