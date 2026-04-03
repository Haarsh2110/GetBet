'use client';

import { useState } from 'react';
import { Search, Filter, TerminalSquare, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const mockSystemLogs = [
    { id: 'LOG-3001', time: '2025-08-16 15:45:10', level: 'CRITICAL', source: 'Auth Service', message: 'Multiple failed login attempts for Super Admin account from IP 192.168.1.100', admin: 'SYSTEM' },
    { id: 'LOG-3002', time: '2025-08-16 15:42:00', level: 'INFO', source: 'Game Engine', message: 'Win Go 1M Period 1006678 started successfully.', admin: 'Auto' },
    { id: 'LOG-3003', time: '2025-08-16 15:30:22', level: 'WARNING', source: 'Payment Gateway', message: 'Gateway API response delayed (> 5000ms) for Deposit request PAY-9014', admin: 'Auto' },
    { id: 'LOG-3004', time: '2025-08-16 15:15:10', level: 'INFO', source: 'Admin Panel', message: 'User USR-1002 promoted to VIP Group', admin: 'Admin-Master' },
    { id: 'LOG-3005', time: '2025-08-16 14:00:00', level: 'INFO', source: 'System', message: 'Daily database backup completed (Size: 4.2GB)', admin: 'Cron' },
];

export default function SystemLogs() {
    const [searchTerm, setSearchTerm] = useState('');

    const getIconForLevel = (level: string) => {
        if (level === 'CRITICAL') return <ShieldAlert size={16} className="text-accent-red" />;
        if (level === 'WARNING') return <AlertTriangle size={16} className="text-[#f07b22]" />;
        return <Info size={16} className="text-accent-blue" />;
    };

    const getLabelForLevel = (level: string) => {
        if (level === 'CRITICAL') return 'bg-accent-red/20 text-accent-red border-accent-red/30';
        if (level === 'WARNING') return 'bg-[#f07b22]/20 text-[#f07b22] border-[#f07b22]/30';
        return 'bg-accent-blue/20 text-accent-blue border-accent-blue/30';
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">System & Admin Logs</h1>
                    <p className="text-sm text-white/50 mt-1">Real-time technical logs, errors, and administrative actions.</p>
                </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden flex flex-col h-[70vh]">

                {/* Toolbar */}
                <div className="p-4 border-b border-white/5 bg-black/40 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Log ID, keyword, or source..."
                            className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary/50 font-mono"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select className="bg-background border border-white/10 rounded-lg px-4 py-1.5 text-sm outline-none">
                            <option value="">All Levels</option>
                            <option value="INFO">INFO</option>
                            <option value="WARNING">WARNING</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>
                    </div>
                </div>

                {/* Log Viewer Content */}
                <div className="flex-1 overflow-x-auto bg-[#0A0A0A] p-4 text-sm font-mono text-white/70">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="text-white/40 border-b border-white/10">
                                <th className="pb-2 font-normal">Timestamp</th>
                                <th className="pb-2 font-normal">Level</th>
                                <th className="pb-2 font-normal">Source</th>
                                <th className="pb-2 font-normal">Admin Route</th>
                                <th className="pb-2 font-normal w-full">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockSystemLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors group cursor-default">
                                    <td className="py-3 pr-4 text-white/50">{log.time}</td>
                                    <td className="py-3 pr-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getLabelForLevel(log.level)}`}>
                                            {getIconForLevel(log.level)} {log.level}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-primary/80">[{log.source}]</td>
                                    <td className="py-3 pr-4 text-white/50">{log.admin}</td>
                                    <td className="py-3 pr-4 text-white/90 whitespace-normal break-words min-w-[300px]">
                                        {log.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Status Bar */}
                <div className="p-2 border-t border-white/5 bg-black/60 text-xs text-white/40 flex justify-between font-mono">
                    <span>Connected to Log Server: Active</span>
                    <span>Showing 5 recent logs. Auto-refresh enabled.</span>
                </div>
            </div>
        </div>
    );
}
