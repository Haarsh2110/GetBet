'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Plus, 
    Trash2, 
    ChevronLeft, 
    ArrowRight, 
    CheckCircle2, 
    Crown, 
    Save, 
    Loader2, 
    AlertCircle,
    Star,
    Zap,
    Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Toast from '@/components/Toast';

export default function MasterPlans() {
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

    const [form, setForm] = useState({
        planId: '',
        name: '',
        tagline: '',
        price: '',
        oldPrice: '',
        vipBonus: '',
        features: '',
        isActive: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/plans?admin=true');
            const data = await res.json();
            if (data.success) {
                setPlans(data.plans || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: form.planId.toLowerCase().trim(),
                    name: form.name,
                    tagline: form.tagline,
                    price: Number(form.price),
                    oldPrice: Number(form.oldPrice),
                    vipBonus: Number(form.vipBonus),
                    features: form.features.split(',').map(f => f.trim()).filter(f => f !== ''),
                    isActive: form.isActive
                })
            });
            const data = await res.json();
            if (data.success) {
                setToast({ show: true, message: 'Plan saved successfully.', type: 'success' });
                setShowModal(false);
                fetchPlans();
                setForm({ planId: '', name: '', tagline: '', price: '', oldPrice: '', vipBonus: '', features: '', isActive: true });
            } else {
                setToast({ show: true, message: 'Failed to save plan.', type: 'error' });
            }
        } catch (err) {
            setToast({ show: true, message: 'Something went wrong.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (planId: string) => {
        if (!window.confirm('Are you sure? This plan will be deleted forever.')) return;
        try {
            const res = await fetch('/api/plans', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();
            if (data.success) {
                setToast({ show: true, message: 'Plan removed.', type: 'success' });
                fetchPlans();
            }
        } catch (err) {
            setToast({ show: true, message: 'Failed to delete.', type: 'error' });
        }
    };

    const editPlan = (plan: any) => {
        setForm({
            planId: plan.planId,
            name: plan.name,
            tagline: plan.tagline || '',
            price: plan.price.toString(),
            oldPrice: (plan.oldPrice || '').toString(),
            vipBonus: (plan.vipBonus || '').toString(),
            features: (plan.features || []).join(', '),
            isActive: plan.isActive
        });
        setShowModal(true);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-primary text-[10px] font-black tracking-widest uppercase">Fetching Plans...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-12">
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

            {/* Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-gray-500 hover:text-white transition mb-6 text-[10px] font-black uppercase tracking-widest">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 text-primary text-[10px] font-black tracking-[0.4em] uppercase mb-4">
                        <div className="w-12 h-[2px] bg-primary" /> SUBSCRIPTION MANAGER
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        VIP <span className="text-primary italic">/ Plans</span>
                    </h1>
                </div>
                <button 
                    onClick={() => {
                        setForm({ planId: '', name: '', tagline: '', price: '', oldPrice: '', vipBonus: '', features: '', isActive: true });
                        setShowModal(true);
                    }}
                    className="bg-primary text-black font-black text-xs px-10 py-5 rounded-full shadow-gold hover:scale-105 transition-all flex items-center gap-3 active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} /> NEW PLAN
                </button>
            </div>

            {/* Plans Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={plan.planId} 
                        className={`bg-surface border ${plan.isActive ? 'border-primary/20 shadow-gold' : 'border-white/5 opacity-60'} rounded-[48px] p-8 relative group overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition duration-700 pointer-events-none">
                             <Crown size={120} className="text-primary" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <Crown className="text-primary" size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editPlan(plan)} className="p-3 bg-white/5 hover:bg-primary/20 rounded-full transition"><ArrowRight size={16} /></button>
                                    <button onClick={() => handleDelete(plan.planId)} className="p-3 bg-white/5 hover:bg-red-500/20 text-red-500 rounded-full transition"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            
                            <p className="text-primary text-[9px] font-black uppercase tracking-widest mb-1 italic">₹{plan.price.toLocaleString()} PLAN</p>
                            <h3 className="text-2xl font-black italic uppercase italic leading-none mb-1">{plan.name}</h3>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-6">{plan.planId}</p>
                            
                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Status</span>
                                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase italic ${plan.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        {plan.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Bonus Pool</span>
                                    <span className="text-sm font-black text-white italic">₹{plan.vipBonus.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface border border-white/10 w-full max-w-2xl rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Star size={200} className="text-primary -rotate-12" />
                            </div>

                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                                <Zap className="text-primary" size={28} /> Manage <span className="text-primary">Plan Details</span>
                            </h2>

                            <form onSubmit={handleSave} className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2 italic"><Tag size={12}/> Plan ID Code (e.g. basic, pro)</label>
                                        <input 
                                            placeholder="starter, basic, pro, expert"
                                            value={form.planId}
                                            onChange={(e) => setForm({...form, planId: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition font-black uppercase italic tracking-widest text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2 italic"><Star size={12}/> Display Name</label>
                                        <input 
                                            placeholder="Starter Plan"
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition font-black italic tracking-widest text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic leading-none">Price (₹)</label>
                                        <input 
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => setForm({...form, price: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition font-black italic tracking-widest text-lg"
                                            required
                                        />
                                    </div>
                                     <div className="space-y-4">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic leading-none">VIP Reward Balance (₹)</label>
                                        <input 
                                            type="number"
                                            value={form.vipBonus}
                                            onChange={(e) => setForm({...form, vipBonus: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition font-black italic tracking-widest text-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic leading-none">Tagline (Slogan)</label>
                                    <input 
                                        placeholder="Essential tools for pro players."
                                        value={form.tagline}
                                        onChange={(e) => setForm({...form, tagline: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition font-black italic tracking-widest text-sm"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic leading-none">Features (Comma separated)</label>
                                    <textarea 
                                        placeholder="Fast Support, accurate signals, experts help"
                                        value={form.features}
                                        onChange={(e) => setForm({...form, features: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition font-black italic tracking-widest text-sm h-32"
                                    />
                                </div>

                                <div className="flex items-center gap-4 py-4 px-6 bg-white/5 border border-white/5 rounded-2xl">
                                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 accent-primary" />
                                    <span className="text-xs font-black uppercase tracking-widest italic italic">Plan is Active (Visible to users)</span>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-5 rounded-full border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition"
                                    >Cancel</button>
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="flex-1 py-5 rounded-full bg-primary text-black font-black uppercase tracking-widest text-[10px] shadow-gold flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
