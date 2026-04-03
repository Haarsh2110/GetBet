'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Shield, Star, Zap, Crown, GraduationCap, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPlans() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        price: '',
        oldPrice: '',
        vipBonus: '100000',
        features: ''
    });

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/plans');
            const data = await res.json();
            if (data.success) setPlans(data.plans);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchPlans(); }, []);

    const resetForm = () => {
        setFormData({ name: '', tagline: '', price: '', oldPrice: '', vipBonus: '100000', features: '' });
        setEditingPlan(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const body = {
                ...formData,
                price: Number(formData.price),
                oldPrice: Number(formData.oldPrice),
                vipBonus: Number(formData.vipBonus),
                features: formData.features.split('\n').filter(f => f.trim() !== '')
            };

            const res = await fetch('/api/plans' + (editingPlan ? `/${editingPlan._id}` : ''), {
                method: editingPlan ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if ((await res.json()).success) {
                fetchPlans();
                resetForm();
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="p-8 min-h-screen bg-[#020617] text-white">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white">TERMINAL <span className="text-indigo-500">PLANS</span></h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Subscription Node Control</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={16} /> Create New Plan
                </button>
            </header>

            {loading && !plans.length ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Syncing Plans...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan._id} className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                    <Crown size={22} className="text-indigo-400" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Edit/Delete functionality can be added here if needed */}
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Active</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter">{plan.name}</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{plan.tagline || 'No tagline'}</p>
                            
                            <div className="my-6 p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                    <span>Price</span>
                                    <span className="text-white text-lg italic tracking-tighter">₹{plan.price.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                    <span>VIP Reward Balance</span>
                                    <span className="text-indigo-400 text-lg italic tracking-tighter">₹{plan.vipBonus.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {plan.features?.slice(0, 3).map((f: string) => (
                                    <div key={f} className="flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                                        <Check size={12} className="text-indigo-500" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                             <div className="mb-8">
                                <h1 className="text-2xl font-black text-white italic">CREATE <span className="text-indigo-500">PLAN</span></h1>
                                <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Input terminal parameters</p>
                             </div>
                             
                             <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Plan Name</label>
                                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" placeholder="e.g. Starter Plan" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tagline</label>
                                        <input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" placeholder="e.g. Best for beginners" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Price (₹)</label>
                                        <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" placeholder="999" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Old Price (₹)</label>
                                        <input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" placeholder="1499" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">VIP Reward Balance (₹)</label>
                                    <input type="number" required value={formData.vipBonus} onChange={e => setFormData({...formData, vipBonus: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" placeholder="100000" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Features (One per line)</label>
                                    <textarea rows={3} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition resize-none" placeholder="Basic Predictions&#10;Daily Tips&#10;Standard Support" />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={resetForm} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[10px] font-black tracking-widest uppercase transition">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black tracking-widest uppercase transition shadow-lg shadow-indigo-500/20">Compile Plan</button>
                                </div>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
