'use client';

import { Shield, Plus, Key, Users } from 'lucide-react';

const mockRoles = [
    { id: 1, name: 'Super Admin', users: 2, access: 'Full System Access', color: 'text-primary border-primary/20 bg-primary/10' },
    { id: 2, name: 'Financial Manager', users: 3, access: 'View logs, Approve Payouts, Ledger Read', color: 'text-accent-green border-accent-green/20 bg-accent-green/10' },
    { id: 3, name: 'Game Moderator', users: 5, access: 'Game Control, Result Overrides, Appeals', color: 'text-accent-blue border-accent-blue/20 bg-accent-blue/10' },
    { id: 4, name: 'Support Staff', users: 12, access: 'View Users, Reply Tickets, Limited Configs', color: 'text-white/70 border-white/20 bg-white/5' },
];

export default function AccessControl() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Role & Access Management</h1>
                    <p className="text-sm text-white/50 mt-1">Define permissions and assign backend personnel to specific roles.</p>
                </div>
                <button className="bg-surface border border-white/10 hover:border-primary/50 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={18} /> Define New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {mockRoles.map(role => (
                    <div key={role.id} className="bg-surface border border-white/5 rounded-xl p-6 shadow-lg flex flex-col justify-between group hover:border-white/20 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-display font-bold ${role.color}`}>
                                    <Shield size={16} /> {role.name}
                                </div>
                                <div className="flex items-center gap-1 text-white/50 text-sm">
                                    <Users size={16} /> {role.users} Active
                                </div>
                            </div>
                            <p className="text-white/70 text-sm mb-6 leading-relaxed">
                                Capabilities: <br /> {role.access}
                            </p>
                        </div>

                        <div className="border-t border-white/5 pt-4 flex gap-2">
                            <button className="flex-1 bg-background hover:bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white/70 transition-colors flex justify-center items-center gap-2">
                                <Key size={14} /> Edit Permissions
                            </button>
                            <button className="flex-1 bg-background hover:bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white/70 transition-colors flex justify-center items-center gap-2">
                                <Users size={14} /> Manage Users
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
