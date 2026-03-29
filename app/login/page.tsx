'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, ShieldCheck, Zap, ArrowRight, UserPlus, LogIn, Gift, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // For register: 1 = Phone/OTP, 2 = Password/Details

    // Form states
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [inviteCode, setInviteCode] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [agreed, setAgreed] = useState(true);

    // Handle Tab Switch
    const handleModeSwitch = (newMode: 'login' | 'register') => {
        setMode(newMode);
        setStep(1);
        setPassword('');
        setConfirmPassword('');
        setInviteCode('');
        setOtp(['', '', '', '', '', '']);
    };

    // OTP Logic (Shared)
    const handleSendOtp = async () => {
        if (phone.length < 10) return;
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.otp) setGeneratedOtp(data.otp);
                setStep(2); 
            } else {
                alert(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            alert('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    // Main Auth Call
    const handleSubmit = async () => {
        if (mode === 'register') {
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            if (!agreed) {
                alert('Please agree to privacy policy');
                return;
            }
        }

        setLoading(true);
        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const payload = mode === 'login' 
            ? { phone, password } 
            : { phone, password, otp: otp.join(''), inviteCode };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/');
                router.refresh();
            } else {
                alert(data.error || 'Authentication failed');
            }
        } catch (err) {
            alert('Request failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#050505] items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />

            {/* Logo */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="mb-8 text-center z-10"
            >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-black border border-primary/40 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(255,215,0,0.1)]">
                    <Zap size={28} className="text-primary fill-primary/30" />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary/80">
                    GET<span className="text-white">BET</span>
                </h1>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Professional Game Terminal</p>
            </motion.div>

            {/* Main Auth Container */}
            <div className="w-full max-w-sm z-10">
                {/* Tab Switcher */}
                <div className="bg-white/5 p-1.5 rounded-[1.5rem] flex mb-6 border border-white/5 backdrop-blur-xl">
                    <button 
                        onClick={() => handleModeSwitch('login')}
                        className={`flex-1 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'login' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                    >
                        <LogIn size={12} strokeWidth={3} />
                        Login
                    </button>
                    <button 
                        onClick={() => handleModeSwitch('register')}
                        className={`flex-1 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'register' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                    >
                        <UserPlus size={12} strokeWidth={3} />
                        Register
                    </button>
                </div>

                {/* Form Card */}
                <div className="glass-dark rounded-[2.5rem] p-6 border border-white/5 shadow-2xl flex flex-col min-h-[460px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${mode}-${step}`}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -10, opacity: 0 }}
                            className="space-y-5"
                        >
                            <div className="text-center mb-1">
                                <h2 className="text-xl font-black text-white">
                                    {mode === 'login' ? 'Welcome Back' : (step === 1 ? 'Verify Number' : 'Set Account')}
                                </h2>
                                <p className="text-white/40 text-[10px] mt-1 font-bold uppercase tracking-wider">
                                    {mode === 'login' ? 'Vip access portal' : 'Security registration'}
                                </p>
                            </div>

                            <div className="space-y-3.5">
                                {(mode === 'login' || (mode === 'register' && step === 1)) && (
                                    <div className="bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center px-4 py-3.5 gap-3 focus-within:border-primary/50 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Phone size={14} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-black text-xs">+91</span>
                                                <input 
                                                    type="tel"
                                                    placeholder="000 000 0000"
                                                    maxLength={10}
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="bg-transparent border-none outline-none text-white font-black w-full p-0 text-base placeholder-white/10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mode === 'login' && (
                                    <div className="bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center px-4 py-3.5 gap-3 focus-within:border-primary/50 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Lock size={14} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white font-black w-full p-0 text-base placeholder-white/10"
                                            />
                                        </div>
                                        <button onClick={() => setShowPassword(!showPassword)} className="text-white/20 hover:text-primary transition">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                )}

                                {mode === 'register' && step === 1 && (
                                    <button 
                                        onClick={handleSendOtp}
                                        disabled={loading || phone.length < 10}
                                        className="w-full py-4 rounded-[1.2rem] bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
                                    >
                                        {loading ? 'Sending...' : 'Send Verification OTP'}
                                        <ArrowRight size={14} strokeWidth={3} />
                                    </button>
                                )}

                                {mode === 'register' && step === 2 && (
                                    <div className="space-y-3.5">
                                        <div className="flex justify-between gap-1.5 mb-2">
                                            {otp.map((d, i) => (
                                                <input 
                                                    key={i} id={`otp-${i}`}
                                                    type="text" maxLength={1} value={d}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    className="w-9 h-11 bg-white/5 border border-white/10 rounded-lg text-center text-base font-black text-primary focus:border-primary outline-none"
                                                />
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center px-4 py-3 gap-3">
                                                <Lock size={14} className="text-primary/70" />
                                                <input 
                                                    type="password" placeholder="Set Password"
                                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                                    className="bg-transparent border-none outline-none text-white font-bold w-full text-sm"
                                                />
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center px-4 py-3 gap-3">
                                                <ShieldCheck size={14} className="text-primary/70" />
                                                <input 
                                                    type="password" placeholder="Confirm Password"
                                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="bg-transparent border-none outline-none text-white font-bold w-full text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center px-4 py-3 gap-3">
                                            <Gift size={14} className="text-primary/70" />
                                            <input 
                                                type="text" placeholder="Invite Code (Optional)"
                                                value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white font-bold w-full text-sm uppercase"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 px-1">
                                            <input 
                                                type="checkbox" 
                                                id="terms" 
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                                className="w-4 h-4 rounded-md accent-primary"
                                            />
                                            <label htmlFor="terms" className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                                                I agree to <span className="text-primary/60">Privacy Policy</span>
                                            </label>
                                        </div>

                                        <button 
                                            onClick={handleSubmit}
                                            disabled={loading || otp.includes('') || !password || !confirmPassword}
                                            className="w-full py-4 rounded-[1.2rem] bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
                                        >
                                            {loading ? 'Creating Account...' : 'Complete Registration'}
                                            <UserPlus size={14} strokeWidth={3} />
                                        </button>
                                        
                                        <button onClick={() => setStep(1)} className="w-full text-[9px] text-white/20 font-black uppercase tracking-widest text-center mt-2">
                                            Change Phone Number
                                        </button>
                                    </div>
                                )}

                                {mode === 'login' && (
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading || phone.length < 10 || !password}
                                        className="w-full py-4 rounded-[1.2rem] bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl hover:bg-primary transition-colors active:scale-[0.98]"
                                    >
                                        {loading ? 'Accessing...' : 'Secure Access'}
                                        <LogIn size={14} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* OTP Alert (Dev mode) */}
            <AnimatePresence>
                {generatedOtp && mode === 'register' && step === 2 && (
                    <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="fixed bottom-24 p-4 bg-[#111] border border-primary/30 rounded-[1.5rem] flex items-center gap-4 shadow-2xl z-50">
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Zap size={16} className="text-primary" /></div>
                         <div><p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Dev OTP Code</p><p className="text-lg font-black text-white tracking-[0.3em]">{generatedOtp}</p></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="mt-12 text-[9px] text-white/10 font-black uppercase tracking-[0.3em]">
                Encrypted by <span className="text-white/30">X-SHIELD KERNEL</span>
            </p>
        </div>
    );
}
