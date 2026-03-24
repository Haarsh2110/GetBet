'use client';

import { useState, useEffect } from 'react';
import { Plus, Users2, Shield, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GroupManagement() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', level: 0, benefits: '', status: 'Active' });

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/admin/users/groups', { cache: 'no-store' });
            const json = await res.json();
            if (json.success) setGroups(json.data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const openCreateModal = () => {
        setFormData({ name: '', level: 0, benefits: '', status: 'Active' });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (group: any) => {
        setSelectedGroup(group);
        setFormData({ name: group.name, level: group.level, benefits: group.benefits, status: group.status });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (group: any) => {
        setSelectedGroup(group);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (json.success) {
                setGroups([{ ...json.data, memberCount: 0 }, ...groups].sort((a, b) => b.level - a.level));
                setIsCreateModalOpen(false);
            } else alert(json.error || 'Failed to create group');
        } catch (err) { alert('Error creating group'); }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;
        try {
            const res = await fetch('/api/admin/users/groups', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedGroup._id, ...formData })
            });
            const json = await res.json();
            if (json.success) {
                setGroups(groups.map(g => g._id === selectedGroup._id ? { ...json.data, memberCount: g.memberCount } : g).sort((a, b) => b.level - a.level));
                setIsEditModalOpen(false);
            } else alert(json.error || 'Failed to update group');
        } catch (err) { alert('Error updating group'); }
    };

    const handleDelete = async () => {
        if (!selectedGroup) return;
        try {
            const res = await fetch(`/api/admin/users/groups?id=${selectedGroup._id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                setGroups(groups.filter(g => g._id !== selectedGroup._id));
                setIsDeleteModalOpen(false);
            } else alert(json.error || 'Failed to delete group');
        } catch (err) { alert('Error deleting group'); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Group Management</h1>
                    <p className="text-sm text-white/50 mt-1">Create, modify, and manage user tier groups.</p>
                </div>
                <button onClick={openCreateModal} className="bg-primary text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light transition-colors shadow-glow">
                    <Plus size={18} /> Create New Group
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center text-white/50 py-12 bg-surface rounded-2xl border border-white/5">
                    No groups found. Create a group to classify your users.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <div key={group._id} className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col group-hover:border-primary/30 transition-colors shadow-lg">
                            {/* Background Glow */}
                            {group.level >= 5 && <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>}

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl border ${group.level >= 3 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/70'}`}>
                                        {group.level >= 5 ? <Shield size={24} /> : <Users2 size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white font-display leading-tight">{group.name}</h3>
                                        <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Level {group.level}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 bg-background rounded-lg border border-white/5 p-1">
                                    <button onClick={() => openEditModal(group)} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors title='Edit'"><Edit2 size={14} /></button>
                                    <button onClick={() => openDeleteModal(group)} className="p-1.5 hover:bg-accent-red/20 rounded text-white/70 hover:text-accent-red transition-colors title='Delete'"><Trash2 size={14} /></button>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6 flex-1 relative z-10">
                                <div>
                                    <div className="text-xs text-white/40 mb-1">Total Members</div>
                                    <div className="text-2xl font-bold text-white">{(group.memberCount || 0).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-1">Key Perks & Benefits</div>
                                    <div className="text-sm text-white/80">{group.benefits || 'No specific benefits configured.'}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${group.status === 'Active' ? 'bg-accent-green' : 'bg-white/20'}`}></div>
                                    <span className="text-xs text-white/60">{group.status}</span>
                                </div>
                                <Link href={`/admin/users?group=${group.name}`} className="text-sm font-semibold text-primary hover:text-primary-light transition-colors">
                                    View Members &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Components */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative">
                        <div className="flex justify-between items-center p-5 border-b border-white/5">
                            <h3 className="font-display font-bold text-lg text-white">{isEditModalOpen ? 'Edit Group' : 'Create New Group'}</h3>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleEdit : handleCreate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Group Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" required placeholder="e.g. Diamond Tier" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">Hierarchy Level</label>
                                    <input type="number" min="0" value={formData.level} onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Perks & Benefits Summary</label>
                                <textarea value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} rows={3} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none" placeholder="e.g. 5% Cashback on deposits" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors border border-white/5">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-black py-3 rounded-xl font-bold transition-colors">{isEditModalOpen ? 'Save Changes' : 'Create Group'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedGroup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden p-6 text-center">
                        <div className="w-16 h-16 bg-accent-red/10 border border-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-red">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Group?</h3>
                        <p className="text-white/60 text-sm mb-6">Are you sure you want to delete **{selectedGroup.name}**? This action cannot be undone and will remove all users attached to this group.</p>

                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium transition-colors border border-white/5">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white py-2.5 rounded-xl font-bold transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
