'use client';

import { BellRing, Send, Clock, Users } from 'lucide-react';

export default function Communication() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Broadcasts & Communications</h1>
                    <p className="text-sm text-white/50 mt-1">Send global announcements, push notifications, and targeted user messages.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Composer */}
                <div className="bg-surface border border-white/5 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-display text-white mb-6 flex items-center gap-2">
                        <Send size={20} className="text-primary" /> Compose Broadcast
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-white/50 uppercase tracking-widest mb-1.5">Audience</label>
                            <select className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary/50">
                                <option value="all">All Active Users</option>
                                <option value="vip">VIP Group Only</option>
                                <option value="inactive">Inactive Users (&gt;30d)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 uppercase tracking-widest mb-1.5">Subject / Title</label>
                            <input type="text" placeholder="e.g., Scheduled Maintenance" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 uppercase tracking-widest mb-1.5">Message Content</label>
                            <textarea rows={5} placeholder="Type your message here..." className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary/50 resize-none"></textarea>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            <button className="flex-1 bg-primary text-black font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-light transition-colors shadow-glow">
                                <BellRing size={18} /> Send Now
                            </button>
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/5">
                                <Clock size={18} /> Schedule
                            </button>
                        </div>
                    </div>
                </div>

                {/* History / Scheduled */}
                <div className="space-y-6">
                    <div className="bg-surface border border-white/5 rounded-xl p-6 shadow-lg">
                        <h3 className="font-display font-bold text-white mb-4">Scheduled Broadcasts</h3>
                        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-white/10 rounded-lg bg-white/5">
                            <Clock size={32} className="text-white/20 mb-2" />
                            <div className="text-sm font-medium text-white/60">No pending scheduled broadcasts</div>
                        </div>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-xl p-6 shadow-lg">
                        <h3 className="font-display font-bold text-white mb-4">Recent In-App Notifications</h3>
                        <div className="space-y-3">
                            {[
                                { title: 'Weekend Deposit Bonus!', audience: 'All Users', time: 'Yesterday, 10:00 AM', status: 'Delivered (4,231 viewed)' },
                                { title: 'Server Maintenance Notice', audience: 'All Users', time: 'Aug 14, 02:00 AM', status: 'Delivered (1,502 viewed)' },
                                { title: 'Welcome to VIP Tier', audience: 'VIP Group Only', time: 'Aug 12, 12:00 PM', status: 'Delivered (124 viewed)' }
                            ].map((item, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="font-semibold text-white/90 text-sm mb-1">{item.title}</div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/40 flex items-center gap-1"><Users size={12} /> {item.audience}</span>
                                        <span className="text-white/50">{item.time}</span>
                                    </div>
                                    <div className="text-xs text-accent-green mt-2 font-medium">{item.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
