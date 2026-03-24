'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SessionsList() {
    const searchParams = useSearchParams();
    const dateStr = searchParams.get('date') || '';
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dateStr) return;
        const fetchSessions = async () => {
            try {
                const res = await fetch(`/api/admin/sessions?date=${dateStr}&game=WinGo`);
                const json = await res.json();
                if (json.success) {
                    setSessions(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch sessions', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [dateStr]);

    return (
        <div className="min-h-screen bg-background text-white pb-20">
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <Link href="/admin/wingo/result-history" className="absolute left-6 text-primary hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-white font-black text-lg tracking-widest uppercase text-center">RESULT HISTORY</h1>
            </div>

            <div className="flex flex-col items-center mt-8 gap-3">
                <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black shadow-glow tracking-widest uppercase">
                    DATE : {dateStr}
                </div>
            </div>

            <div className="px-6 mt-10 space-y-4">
                <div className="grid grid-cols-3 gap-x-4 mb-4 pb-4 border-b border-white/10 px-5">
                    <div className="text-primary font-black text-[10px] uppercase tracking-widest">SESSION NO.</div>
                    <div className="text-primary font-black text-[10px] uppercase tracking-widest text-center">RESULT STATUS</div>
                    <div className="text-primary font-black text-[10px] uppercase tracking-widest text-right">ACTION</div>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center text-white/50 font-black text-xs uppercase tracking-widest mt-10">
                        NO SESSIONS FOUND
                    </div>
                ) : (
                    sessions.map((s, i) => (
                        <div key={s._id} className="grid grid-cols-3 items-center bg-surface border border-white/5 py-4 px-5 rounded-xl shadow-lg hover:border-primary/30 transition-colors group">
                            <div className="flex items-center">
                                <span className="text-white font-black text-sm tracking-widest">{sessions.length - i}</span>
                            </div>
                            <div className="flex justify-center items-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${['Completed', 'VERIFIED'].includes(s.status) ? 'text-white/40' : 'text-accent-red underline decoration-accent-red/30 underline-offset-4 animate-pulse'}`}>
                                    {['Completed', 'VERIFIED'].includes(s.status) ? 'VERIFIED' : 'PENDING'}
                                </span>
                            </div>
                            <div className="flex justify-end items-center">
                                <Link
                                    href={`/admin/wingo/session-details?sessionId=${s._id}&sessionNo=${sessions.length - i}&date=${dateStr}`}
                                    className="text-primary text-[10px] font-black flex items-center gap-1 uppercase tracking-widest"
                                >
                                    <span className="text-[9px]">Click to open</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}

                {!loading && sessions.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <div className="bg-surface border border-white/5 text-white/30 px-10 py-3 rounded-full text-[10px] font-black tracking-widest uppercase shadow-inner">
                            NO MORE
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SessionsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <SessionsList />
        </Suspense>
    );
}
