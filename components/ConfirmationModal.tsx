'use client';

import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
}

export default function ConfirmationModal({ 
    show, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm',
    confirmColor = 'bg-red-500' 
}: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center px-6"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs bg-surface border border-white/10 rounded-[2.5rem] p-8 z-[300] shadow-2xl overflow-hidden shadow-gold/10"
                    >
                        {/* Decorative background flare */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16" />
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <AlertCircle size={32} className="text-primary" strokeWidth={1.5} />
                            </div>
                            
                            <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2 font-display">{title}</h3>
                            <p className="text-white/40 text-xs font-bold leading-relaxed mb-8 uppercase tracking-wider">{message}</p>
                            
                            <div className="w-full flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className={`w-full py-4 rounded-2xl ${confirmColor} text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all shadow-glow`}
                                >
                                    {confirmText}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
