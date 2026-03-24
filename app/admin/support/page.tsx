'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SupportTickets() {
    const [searchTerm, setSearchTerm] = useState('');
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (statusFilter) query.append('status', statusFilter);

            const res = await fetch(`/api/admin/support/tickets?${query.toString()}`);
            const json = await res.json();
            if (json.success) {
                setTickets(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);

    const handleResolve = async (ticketId: string) => {
        if (!confirm('Mark this ticket as Resolved?')) return;
        try {
            const res = await fetch('/api/admin/support/tickets', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ticketId, status: 'Resolved' })
            });
            const json = await res.json();
            if (json.success) {
                setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status: 'Resolved' } : t));
            }
        } catch (error) {
            console.error('Failed to resolve ticket:', error);
        }
    }

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = !searchTerm ||
            t.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = !priorityFilter || t.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    const openCount = tickets.filter(t => t.status === 'Open').length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Support & User Queries</h1>
                    <p className="text-sm text-white/50 mt-1">Manage user tickets, complaints, and general inquiries.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-surface border border-white/5 px-4 py-2 rounded-lg flex flex-col items-center">
                        <span className="text-xs text-white/50 uppercase">Loaded Open Tickets</span>
                        <span className="font-bold text-[#f07b22] text-lg">{openCount}</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search tickets by ID, User, or Subject..."
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none text-white"
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <select
                        className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none text-white"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden flex flex-col relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <div className="bg-black/40 text-white/50 uppercase text-xs font-medium px-6 py-3 items-center justify-between tracking-wider hidden sm:flex border-b border-white/5">
                    <div className="w-1/4">Ticket Info</div>
                    <div className="w-1/4">Subject</div>
                    <div className="w-1/6 text-center">Priority</div>
                    <div className="w-1/6 text-center">Status</div>
                    <div className="w-1/6 text-right">Action</div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                        <div key={ticket._id} className="p-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                            <div className="w-full sm:w-1/4">
                                <div className="font-semibold text-white/90 mb-1">{ticket.ticketId}</div>
                                <div className="text-xs text-white/50 flex items-center gap-1"><User size={12} /> {ticket.userId}</div>
                                <div className="text-xs text-white/40 flex items-center gap-1 mt-1"><Clock size={12} /> {new Date(ticket.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="w-full sm:w-1/4">
                                <div className="font-medium text-white max-w-sm truncate">{ticket.subject}</div>
                                <div className="text-xs text-white/50 truncate mt-1">{ticket.message}</div>
                            </div>
                            <div className="w-full sm:w-1/6 sm:text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${ticket.priority === 'Critical' ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' :
                                    ticket.priority === 'High' ? 'bg-[#f07b22]/20 text-[#f07b22] border border-[#f07b22]/30' :
                                        ticket.priority === 'Medium' ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30' :
                                            'bg-white/10 text-white/60 border border-white/20'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <div className="w-full sm:w-1/6 sm:text-center flex items-center sm:justify-center gap-1.5">
                                {ticket.status === 'Resolved' && <CheckCircle2 size={16} className="text-accent-green" />}
                                {(ticket.status === 'Open' || ticket.status === 'Closed') && <AlertCircle size={16} className="text-accent-red" />}
                                {ticket.status === 'In Progress' && <MessageSquare size={16} className="text-accent-blue" />}
                                <span className={`text-sm ${ticket.status === 'Open' ? 'text-white' : 'text-white/60'}`}>{ticket.status}</span>
                            </div>
                            <div className="w-full sm:w-1/6 sm:text-right flex gap-2 justify-end">
                                {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                                    <button onClick={() => handleResolve(ticket._id)} className="bg-accent-green/10 text-accent-green hover:bg-accent-green/20 border border-accent-green/20 font-medium px-4 py-1.5 rounded-lg text-xs transition-colors w-full sm:w-auto">
                                        Resolve
                                    </button>
                                )}
                                <button className="bg-background border border-white/10 hover:border-primary/50 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition-colors w-full sm:w-auto">
                                    View
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-white/50">
                            No tickets found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
