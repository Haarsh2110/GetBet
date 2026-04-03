'use client';

import { TrendingUp, Users, DollarSign, Activity, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AnalyticsDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">System Analytics</h1>
                    <p className="text-sm text-white/50 mt-1">Comprehensive system performance, user engagement, and financial insights.</p>
                </div>
                <div className="flex bg-surface border border-white/5 rounded-lg p-1">
                    <button className="px-4 py-1.5 rounded-md bg-white/10 text-white text-sm">Today</button>
                    <button className="px-4 py-1.5 rounded-md text-white/50 hover:text-white text-sm transition-colors">7D</button>
                    <button className="px-4 py-1.5 rounded-md text-white/50 hover:text-white text-sm transition-colors">30D</button>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { title: 'Gross Gaming Revenue', value: '₹ 450,200', trend: '+12.5%', isUp: true, icon: DollarSign, color: 'text-accent-gold' },
                    { title: 'Active Players', value: '1,204', trend: '+5.2%', isUp: true, icon: Users, color: 'text-accent-blue' },
                    { title: 'Total Volume (Bet)', value: '₹ 1,250,000', trend: '-2.1%', isUp: false, icon: Activity, color: 'text-accent-green' },
                    { title: 'Avg Bet Size', value: '₹ 450', trend: '+1.5%', isUp: true, icon: TrendingUp, color: 'text-[#f07b22]' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-surface border border-white/5 rounded-2xl p-5 shadow-lg group hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 bg-background border border-white/5 rounded-lg ${kpi.color}`}>
                                <kpi.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.isUp ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                                {kpi.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {kpi.trend}
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">{kpi.title}</div>
                        <div className="text-2xl font-display font-bold text-white">{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart */}
                <div className="bg-surface border border-white/5 rounded-xl shadow-lg lg:col-span-2 flex flex-col h-96 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full"></span> Revenue & Volume Trends
                        </h3>
                        <BarChart3 size={20} className="text-white/30" />
                    </div>
                    <div className="flex-1 bg-background/50 rounded-lg border border-white/5 flex items-center justify-center flex-col gap-2 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
                        <Activity size={48} className="text-primary/20 mb-2" />
                        <p className="text-white/40 text-sm">Interactive Chart Component</p>
                        <p className="text-white/20 text-xs">(Requires Recharts or similar library insertion)</p>
                    </div>
                </div>

                {/* Side Chart */}
                <div className="bg-surface border border-white/5 rounded-xl shadow-lg flex flex-col h-96 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-accent-blue rounded-full"></span> Game Distribution
                        </h3>
                        <PieChart size={20} className="text-white/30" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center gap-6">
                        <div className="w-32 h-32 rounded-full border-[16px] border-surface border-t-primary border-r-[#f07b22] border-b-accent-blue border-l-accent-green relative shadow-glow">
                            <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-white">4 Apps</div>
                        </div>
                        <div className="w-full space-y-3">
                            <div className="flex justify-between text-sm"><span className="flex items-center gap-2 text-white/70"><span className="w-2 h-2 rounded-full bg-primary"></span>Win Go</span><span className="font-bold">45%</span></div>
                            <div className="flex justify-between text-sm"><span className="flex items-center gap-2 text-white/70"><span className="w-2 h-2 rounded-full bg-[#f07b22]"></span>Aviator</span><span className="font-bold">30%</span></div>
                            <div className="flex justify-between text-sm"><span className="flex items-center gap-2 text-white/70"><span className="w-2 h-2 rounded-full bg-accent-blue"></span>Limbo</span><span className="font-bold">15%</span></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
