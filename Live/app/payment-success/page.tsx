'use client';

import { Check, LayoutGrid, Copy, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const amountStr = searchParams.get('amount') || '10000';
    const txnIdStr = searchParams.get('txnId') || 'GB987654321';

    const amount = parseFloat(amountStr);
    const formattedAmount = amount.toLocaleString('en-IN');
    const [copied, setCopied] = useState(false);
    const [isUpdating, setIsUpdating] = useState(true);
    const [isAlreadyProcessed, setIsAlreadyProcessed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasUpdated = useRef(false);

    // Generate today's date formatted like '24 Oct, 2023'
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    useEffect(() => {
        const verifySession = async () => {
            // Get userId from localStorage just to verify login
            const userJson = localStorage.getItem('user');
            if (!userJson) {
                setError('Session expired. Please login again.');
                setIsUpdating(false);
                return;
            }
            // We don't need to call the deposit API here anymore 
            // because deposit() was already called on the previous page.
            setIsUpdating(false);
        };
        verifySession();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(txnIdStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUpdating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-full bg-[#0A0A0A] p-6 text-center">
                <Loader2 className="w-12 h-12 text-[#facc15] animate-spin mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Finalizing Payment</h2>
                <p className="text-gray-400 text-sm">Updating your wallet balance securely...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-full bg-[#0A0A0A] p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <span className="text-red-500 text-4xl font-bold">!</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-gray-400 text-sm mb-8">{error}</p>
                <Link href="/" className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3">
                    BACK TO HOME
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-[#0A0A0A] relative overflow-hidden px-6 pt-12 pb-[110px] justify-between">
            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                className="relative mt-2 flex justify-center"
            >
                <div className="w-28 h-28 rounded-full border border-yellow-500/30 flex items-center justify-center relative">
                    {/* Subtle Outer Glow */}
                    <div className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.3)] bg-yellow-500/5"></div>

                    <div className="w-20 h-20 rounded-full border-2 border-yellow-500/50 flex items-center justify-center relative z-10 glass">
                        <div className="w-12 h-12 bg-[#facc15] rounded-full flex items-center justify-center shadow-lg">
                            <Check size={28} strokeWidth={4} className="text-black" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Titles */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mt-6 mb-6 w-full"
            >
                <h1 className="text-3xl font-black text-[#facc15] mb-2 font-outline tracking-tight leading-none" style={{ textShadow: '0 2px 10px rgba(250,204,21,0.3)' }}>
                    PAYMENT SUCCESSFUL
                </h1>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                    Wallet updated successfully
                </p>
            </motion.div>

            {/* Details Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full bg-[#151515] border border-white/10 rounded-3xl p-6 shadow-2xl relative mt-auto mb-8"
            >
                {/* Top yellow border accent */}
                <div className="absolute top-0 left-6 right-6 h-1 bg-[#facc15] rounded-b-xl opacity-80"></div>

                <div className="space-y-6 mt-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-sm font-medium text-gray-400">Amount Paid</span>
                        <span className="text-2xl font-bold text-white tracking-tight">₹{formattedAmount}</span>
                    </div>

                    <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                        <span className="text-sm font-medium text-gray-400">Transaction ID</span>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-mono text-gray-200 truncate pr-2 max-w-[200px]">{txnIdStr}</span>
                            <button onClick={handleCopy} className="text-[#facc15]">
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-400">Date</span>
                        <span className="text-sm font-medium text-gray-200">{dateStr}</span>
                    </div>
                </div>
            </motion.div>

            {/* Back to Dashboard Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
            >
                <Link href="/" className="w-full py-4 bg-[#facc15] hover:bg-[#eab308] text-black font-bold text-[13px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(250,204,21,0.2)] active:scale-95">
                    <LayoutGrid size={20} strokeWidth={2.5} /> BACK TO DASHBOARD
                </Link>
            </motion.div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#facc15] font-bold">Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
