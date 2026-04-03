'use client';

import Header from '@/components/Header';
import { useWallet } from '@/hooks/use-wallet';
import { Copy, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useState, Suspense, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DepositDetailsContent() {
    const { deposit } = useWallet();
    const searchParams = useSearchParams();
    const amountStr = searchParams.get('amount') || '0';
    const plan = searchParams.get('plan') || undefined;
    const amount = parseFloat(amountStr);
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
        }
    }, [router]);

    const [transactionId, setTransactionId] = useState('');
    const [copied, setCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const walletAddress = "TMwYf68bXZ1NpHxRQRm5kYpW5RjBwRghF";

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirmPayment = async () => {
        if (transactionId.trim() === '') {
            alert("Please enter a valid Transaction ID.");
            return;
        }
        if (amount <= 0) return;

        setSubmitting(true);
        const success = await deposit(amount, transactionId.trim(), 'USDT TRC20', plan);
        setSubmitting(false);

        if (success) {
            router.push(`/payment-success?amount=${amount}&txnId=${transactionId}`);
        } else {
            alert("Deposit failed. Please try again.");
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-[#0A0A0A] relative overflow-hidden shrink-0">
            <header className="px-6 pt-10 pb-2 flex items-center justify-between relative z-10 shrink-0">
                <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl active:scale-95 transition-transform border border-white/5">
                    <ArrowLeft size={20} className="text-[#d4af37]" />
                </button>
                <h1 className="text-sm font-black text-[#d4af37] tracking-[0.2em] uppercase">Deposit Details</h1>
                <div className="w-10"></div> {/* Spacer to center title */}
            </header>

            <main className="flex-1 px-5 pt-2 pb-[120px] flex flex-col relative z-10 overflow-y-auto no-scrollbar">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#111111] p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-2xl relative"
                >
                    <div className="w-36 h-36 bg-white rounded-3xl p-3 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                        <div className="w-full h-full border-4 border-black/5 rounded-2xl p-2 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TMwYf68bXZ1NpHxRQRm5kYpW5RjBwRghF')] bg-contain bg-no-repeat bg-center"></div>
                    </div>

                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 text-center w-full">TRC20 WALLET ADDRESS</p>

                    <div className="w-full bg-[#1A1A1A] p-3 rounded-2xl flex items-center justify-between border border-white/5 mb-4 relative group overflow-hidden">
                        <span className="text-gray-300 text-sm font-mono truncate mr-4">{walletAddress}</span>
                        <button
                            onClick={handleCopy}
                            className="text-[#d4af37] p-2 hover:bg-[#d4af37]/10 rounded-xl transition-colors shrink-0"
                        >
                            {copied ? <span className="text-xs font-bold text-accent-green">Copied!</span> : <Copy size={18} />}
                        </button>
                    </div>

                    <div className="w-full bg-[#d4af37]/10 border border-[#d4af37]/30 p-3 rounded-2xl text-center">
                        <p className="text-[#d4af37] text-[11px] font-bold leading-relaxed">
                            WARNING: Send only USDT to this deposit address. Sending any other coin or token may result in the loss of your deposit.
                        </p>
                    </div>
                </motion.div>

                <div className="flex flex-col gap-4 mt-auto pt-6 shrink-0">
                    <div className="px-1">
                        <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em] mb-2 px-2">ENTER UTR/TRANSACTION ID</p>
                        <div className="bg-[#111111] border border-white/10 rounded-2xl flex items-center p-2 focus-within:border-[#d4af37]/50 transition-colors">
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter transaction ID here"
                                className="bg-transparent border-none text-white w-full px-4 text-sm font-medium focus:ring-0 placeholder-gray-600"
                            />
                            <button className="p-3 text-gray-500 hover:text-[#d4af37] transition-colors rounded-xl bg-white/5">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmPayment}
                        disabled={submitting}
                        className="w-full py-4 text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                        style={{ background: 'linear-gradient(180deg, #e8c85c 0%, #D4AF37 100%)' }}
                    >
                        {submitting ? (
                            <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> PROCESSING...</>
                        ) : (
                            <>CONFIRM PAYMENT <ChevronRight size={18} strokeWidth={3} /></>
                        )}
                    </motion.button>
                </div>
            </main>
        </div>
    );
}

export default function DepositDetails() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-primary font-bold">Loading...</div>}>
            <DepositDetailsContent />
        </Suspense>
    );
}
