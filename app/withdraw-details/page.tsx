'use client';

import { useWallet } from '@/hooks/use-wallet';
import { ArrowLeft, ArrowRight, Wallet, Hash, Camera, AlertCircle, ClipboardPaste, CheckCircle2, Shield, Clock, X } from 'lucide-react';
import { useState, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';

function WithdrawDetailsContent() {
    const { withdraw } = useWallet();
    const searchParams = useSearchParams();
    const router = useRouter();

    const amountStr = searchParams.get('amount') || '0';
    const amount = parseFloat(amountStr);

    const [walletAddress, setWalletAddress] = useState('');
    const [utrNumber, setUtrNumber] = useState('');
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [addressValid, setAddressValid] = useState<boolean | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAddress = (val: string) => {
        setWalletAddress(val);
        if (val.length === 0) { setAddressValid(null); return; }
        setAddressValid(val.startsWith('T') && val.length >= 30);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            validateAddress(text);
        } catch {
            // clipboard not available
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setScreenshotPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        if (!walletAddress.trim() || !addressValid) {
            alert('Please enter a valid TRC20 wallet address (starts with T, min 30 chars).');
            return;
        }
        if (!utrNumber.trim()) {
            alert('Please enter UTR / Reference Number.');
            return;
        }

        setSubmitting(true);
        const success = await withdraw(amount, {
            method: 'USDT TRC20',
            walletAddress: walletAddress,
            txnId: utrNumber,
            screenshot: screenshotPreview
        });

        if (success) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push('/withdraw-history');
            }, 2200);
        } else {
            setSubmitting(false);
            alert('Withdrawal failed. Please check your balance and try again.');
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#0A0A0A] relative overflow-hidden">

            {/* Header */}
            <header className="px-5 pt-10 pb-3 flex items-center gap-4 relative z-10 shrink-0 border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition border border-white/10 shrink-0"
                >
                    <ArrowLeft size={18} className="text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-white text-lg font-black leading-tight">Withdrawal Details</h1>
                </div>
            </header>

            {/* Fee info strip */}
            <div className="flex items-center justify-between px-5 py-2 bg-[#111111] border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Shield size={11} className="text-green-500" />
                        <span className="text-[9px] text-green-500 font-bold uppercase tracking-wider">Secured</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-gray-500" />
                        <span className="text-[9px] text-gray-500 font-bold">10 min – 24 hrs</span>
                    </div>
                </div>
                <span className="text-[9px] text-gray-600 font-bold">Fee: 0% · USDT TRC20</span>
            </div>

            {/* Scrollable Content */}
            <main className="flex-1 px-5 pt-4 pb-[110px] flex flex-col gap-4 relative z-10 overflow-y-auto no-scrollbar">

                {/* Amount Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1a0c00 0%, #120800 100%)', border: '1px solid rgba(249,115,22,0.2)' }}
                >
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">You are withdrawing</p>
                            <p className="text-3xl font-black text-white">₹ {amount.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-gray-600 mt-1">≈ {(amount / 85).toFixed(2)} USDT</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[#f97316]/30" style={{ background: 'linear-gradient(135deg, #c2410c, #ea580c)' }}>
                            <Wallet size={22} className="text-white" strokeWidth={2} />
                        </div>
                    </div>
                    {/* Breakdown */}
                    <div className="border-t border-white/5 px-4 py-2 flex justify-between">
                        <span className="text-gray-600 text-[10px]">Processing fee</span>
                        <span className="text-green-500 font-black text-[10px]">FREE</span>
                    </div>
                </motion.div>

                {/* TRC20 Wallet Address */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-bold">TRC20 Wallet Address</label>
                        <button
                            onClick={handlePaste}
                            className="flex items-center gap-1 text-[#f97316] text-xs font-black active:scale-95 transition bg-[#f97316]/10 px-2 py-1 rounded-lg"
                        >
                            <ClipboardPaste size={12} />
                            PASTE
                        </button>
                    </div>
                    <div
                        className="bg-[#111111] rounded-2xl flex items-center px-4 py-3.5 gap-3 transition-colors"
                        style={{ border: `1px solid ${addressValid === null ? 'rgba(255,255,255,0.08)' : addressValid ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }}
                    >
                        {/* QR icon */}
                        <div className="grid grid-cols-2 gap-0.5 shrink-0">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-sm" style={{ background: addressValid === null ? '#4b5563' : addressValid ? '#22c55e' : '#ef4444' }} />
                            ))}
                        </div>
                        <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => validateAddress(e.target.value)}
                            placeholder="Starts with T..."
                            className="bg-transparent border-none text-white text-sm font-mono placeholder-gray-600 focus:ring-0 w-full p-0"
                        />
                        {addressValid === true && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                        {addressValid === false && <X size={16} className="text-red-500 shrink-0" />}
                    </div>
                    <p className={`text-[10px] px-1 font-semibold ${addressValid === false ? 'text-red-400' : 'text-gray-600'}`}>
                        {addressValid === false ? '⚠ Address must start with T and be at least 30 characters.' : 'Double check your address — transfers are irreversible.'}
                    </p>
                </motion.div>

                {/* UTR Number */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className="flex flex-col gap-2"
                >
                    <label className="text-white text-sm font-bold">UTR / Reference Number</label>
                    <div className="bg-[#111111] border border-white/10 rounded-2xl flex items-center px-4 py-3.5 gap-3 focus-within:border-[#f97316]/40 transition-colors">
                        <Hash size={16} className="text-gray-600 shrink-0" />
                        <input
                            type="text"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="Enter transaction reference no."
                            className="bg-transparent border-none text-white text-sm placeholder-gray-600 focus:ring-0 w-full p-0"
                        />
                    </div>
                </motion.div>

                {/* Screenshot Upload */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-bold">Payment Screenshot</label>
                        <span className="text-gray-600 text-[10px]">Optional</span>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
                        style={{
                            borderColor: screenshotPreview ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.1)',
                            background: screenshotPreview ? 'transparent' : 'rgba(255,255,255,0.02)',
                            minHeight: '80px',
                        }}
                    >
                        {screenshotPreview ? (
                            <img src={screenshotPreview} alt="Preview" className="w-full h-24 object-cover rounded-2xl" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Camera size={18} className="text-gray-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-xs font-bold">Tap to upload proof</p>
                                    <p className="text-gray-600 text-[9px] mt-0.5">JPG, PNG · Max 5MB</p>
                                </div>
                            </div>
                        )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </motion.div>

                {/* Warning box */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
                >
                    <AlertCircle size={14} className="text-[#f97316] shrink-0 mt-0.5" />
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                        Processing time: <span className="text-[#f97316] font-bold">10 min – 24 hours</span> based on network load. Ensure your wallet address is correct — incorrect addresses cannot be recovered.
                    </p>
                </motion.div>
            </main>

            {/* Submit Button */}
            <div className="absolute bottom-[80px] left-0 right-0 px-5 z-20">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-white text-sm uppercase tracking-widest shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                    style={{ background: 'linear-gradient(90deg, #FF8C42 0%, #E65100 100%)', boxShadow: '0 0 25px rgba(249,115,22,0.3)' }}
                >
                    {submitting ? (
                        <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> PROCESSING...</>
                    ) : (
                        <>SUBMIT WITHDRAWAL <ArrowRight size={20} strokeWidth={2.5} /></>
                    )}
                </motion.button>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center flex-col gap-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 120 }}
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 40px rgba(34,197,94,0.5)' }}
                        >
                            <CheckCircle2 size={40} className="text-white" />
                        </motion.div>
                        <div className="text-center">
                            <p className="text-white text-xl font-black">Request Submitted!</p>
                            <p className="text-gray-400 text-sm mt-1">Redirecting to history...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function WithdrawDetails() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#f97316] font-bold">Loading...</div>}>
            <WithdrawDetailsContent />
        </Suspense>
    );
}
