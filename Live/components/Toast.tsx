'use client';

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    show: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', show, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-accent-green" size={20} />;
            case 'error': return <AlertCircle className="text-accent-red" size={20} />;
            case 'info': return <Info className="text-primary" size={20} />;
        }
    };

    const getBg = () => {
        switch (type) {
            case 'success': return 'bg-accent-green/10 border-accent-green/20';
            case 'error': return 'bg-accent-red/10 border-accent-red/20';
            case 'info': return 'bg-primary/10 border-primary/20';
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] min-w-[300px] max-w-sm p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 ${getBg()}`}
                >
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/90 leading-tight">
                            {type === 'success' ? 'SUCCESS' : type === 'error' ? 'ERROR' : 'INFO'}
                        </p>
                        <p className="text-sm font-bold text-white mt-0.5">{message}</p>
                    </div>
                    <button onClick={onClose} className="text-white/20 hover:text-white transition">
                        <X size={16} />
                    </button>
                    
                    {/* Progress Bar */}
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: duration / 1000, ease: 'linear' }}
                        className={`absolute bottom-0 left-0 h-[2px] rounded-full ${type === 'success' ? 'bg-accent-green' : type === 'error' ? 'bg-accent-red' : 'bg-primary'}`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
