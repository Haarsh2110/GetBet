'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, UserX, Shield, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const CreateEditUserModal = dynamic(
    () => import('@/components/admin/UserModals').then(mod => mod.CreateEditUserModal),
    { ssr: false }
);

const AssignGroupModal = dynamic(
    () => import('@/components/admin/UserModals').then(mod => mod.AssignGroupModal),
    { ssr: false }
);

function UsersListContent() {
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState(searchParams.get('group') || '');
    const [groupsList, setGroupsList] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/admin/users/groups');
            const json = await res.json();
            if (json.success) setGroupsList(json.data);
        } catch (e) { }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });
            if (searchTerm) query.append('search', searchTerm);
            if (groupFilter) query.append('group', groupFilter);

            const res = await fetch(`/api/admin/users?${query.toString()}`);
            const json = await res.json();
            if (json.success) {
                setUsers(json.data);
                setTotalPages(json.pagination.pages);
                setTotalUsers(json.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, page, groupFilter]);

    const handleStatusToggle = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'update_status', data: { status: newStatus } })
            });
            const json = await res.json();
            if (json.success) {
                setUsers(users.map(u => u.userId === userId ? { ...u, status: newStatus } : u));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (json.success) {
                setUsers([json.data, ...users]);
                setIsCreateModalOpen(false);
            } else alert(json.error);
        } catch (err) { alert('Error creating user'); }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.userId, action: 'edit_user', data: formData })
            });
            const json = await res.json();
            if (json.success) {
                setUsers(users.map(u => u.userId === selectedUser.userId ? { ...u, ...formData } : u));
                setIsEditModalOpen(false);
            } else alert(json.error);
        } catch (err) { alert('Error updating user'); }
    };

    const handleAssignGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.userId, action: 'assign_group', data: { groups: selectedGroups } })
            });
            const json = await res.json();
            if (json.success) {
                setUsers(users.map(u => u.userId === selectedUser.userId ? { ...u, groups: selectedGroups } : u));
                setIsGroupModalOpen(false);
            } else alert(json.error);
        } catch (err) { alert('Error assigning groups'); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">User Management</h1>
                    <p className="text-sm text-white/50 mt-1">Manage users, states, and group assignments.</p>
                </div>
                <button onClick={() => { setFormData({ name: '', email: '', phone: '' }); setIsCreateModalOpen(true); }} className="bg-primary text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light transition-colors shadow-glow">
                    <Plus size={18} /> Add New User
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, Name, or Email..."
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none text-white">
                        <option value="">All Groups</option>
                        {groupsList.map(g => (
                            <option key={g._id} value={g.name}>{g.name}</option>
                        ))}
                    </select>
                    <select className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none outline-none appearance-none flex-1 md:flex-none text-white">
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Banned">Banned</option>
                    </select>
                    <button className="bg-background border border-white/10 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <Filter size={18} className="text-white/70" />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/40 text-white/50 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">User</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Contact</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-right">Balance</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Group</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Joined</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white truncate max-w-[150px]">{user.name}</div>
                                        <div className="text-xs text-white/40">{user.userId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white/70">
                                        <div className="truncate max-w-[180px]">{user.email}</div>
                                        {user.phone && <div className="text-xs text-white/40">{user.phone}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-accent-gold whitespace-nowrap">₹ {(user.mainBalance || 0).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {user.groups && user.groups.length > 0 ? user.groups.map((g: string) => (
                                                <span key={g} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/80 w-fit">
                                                    {g}
                                                </span>
                                            )) : (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-gray-500/10 text-gray-400 border-gray-500/20 w-fit">NONE</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-accent-green' : 'bg-accent-red'}`}></div>
                                            <span className={`capitalize ${user.status === 'active' ? 'text-white/90' : 'text-white/50'}`}>{user.status || 'active'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/50 text-xs whitespace-nowrap">
                                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedUser(user); setFormData({ name: user.name, email: user.email, phone: user.phone || '' }); setIsEditModalOpen(true); }} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-accent-blue transition-colors" title="Edit User">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => { setSelectedUser(user); setSelectedGroups(user.groups || []); setIsGroupModalOpen(true); }} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-primary transition-colors" title="Assign Group">
                                                <Shield size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusToggle(user.userId, user.status || 'active')}
                                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-accent-red transition-colors"
                                                title={user.status === 'active' ? 'Suspend' : 'Activate'}>
                                                <UserX size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-white/50 bg-black/40">
                    <div>Showing limit 10 out of {totalUsers} total users</div>
                    <div className="flex gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 bg-surface border border-white/10 rounded hover:bg-white/5 transition-colors disabled:opacity-50 text-white"
                        >Prev</button>
                        <button className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded">{page}</button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 bg-surface border border-white/10 rounded hover:bg-white/5 transition-colors disabled:opacity-50 text-white"
                        >Next</button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal dynamically loaded */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <CreateEditUserModal
                    isEditModalOpen={isEditModalOpen}
                    formData={formData}
                    setFormData={setFormData}
                    handleCreateUser={handleCreateUser}
                    handleEditUser={handleEditUser}
                    closeModal={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                />
            )}

            {/* Assign Group Modal dynamically loaded */}
            {isGroupModalOpen && selectedUser && (
                <AssignGroupModal
                    selectedUser={selectedUser}
                    groupsList={groupsList}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={setSelectedGroups}
                    handleAssignGroup={handleAssignGroup}
                    closeModal={() => setIsGroupModalOpen(false)}
                />
            )}

        </div>
    );
}

export default function UsersList() {
    return (
        <Suspense fallback={<div>Loading users...</div>}>
            <UsersListContent />
        </Suspense>
    );
}
