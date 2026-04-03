'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

type PeriodResult = {
    period: string;
    result: string;
    isRed: boolean;
    createdAt: string;
};

export default function ResultHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [dateList, setDateList] = useState<{ date: string; sessions: number }[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/admin/wingo/result-history/grouped');
                const json = await res.json();
                if (Array.isArray(json)) {
                    setDateList(json);
                }
            } catch (err) {
                console.error('Failed to fetch history', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // ------- DATES VIEW (default) -------
    return (
        <div className="min-h-screen bg-background text-white pb-20">
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <Link href="/admin/wingo" className="absolute left-6 text-primary hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-white font-black text-lg tracking-widest uppercase">RESULT HISTORY</h1>
            </div>

            <div className="px-6 mt-10 space-y-3">
                <div className="grid grid-cols-3 gap-x-4 mb-4 pb-4 border-b border-primary/20">
                    <div className="text-primary font-black text-[10px] uppercase tracking-widest">DATE:</div>
                    <div className="text-primary font-black text-[10px] uppercase tracking-widest">SESSIONS:</div>
                    <div></div>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : dateList.length === 0 ? (
                    <div className="text-center text-white/50 font-black text-xs uppercase tracking-widest mt-10">
                        NO HISTORY AVAILABLE
                    </div>
                ) : (
                    dateList.map((d, i) => (
                        <div key={i} className="flex items-center bg-surface border border-white/5 py-4 px-4 rounded-xl shadow-lg hover:border-primary/30 transition-colors group">
                            <div className="flex-1 text-white font-bold text-sm tracking-wider">{d.date}</div>
                            <div className="flex-1 text-white/70 font-bold text-sm pl-4">{d.sessions}</div>
                            <div className="flex-1 flex justify-end">
                                <Link
                                    href={`/admin/wingo/sessions?date=${d.date}`}
                                    className="text-primary text-[10px] font-black flex items-center gap-1 uppercase tracking-widest"
                                >
                                    <span className="text-[9px]">OPEN</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
