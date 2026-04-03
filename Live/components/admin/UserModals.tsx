import { X } from 'lucide-react';

export function CreateEditUserModal({
    isEditModalOpen,
    formData,
    setFormData,
    handleCreateUser,
    handleEditUser,
    closeModal
}: any) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative">
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                    <h3 className="font-display font-bold text-lg text-white">{isEditModalOpen ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={isEditModalOpen ? handleEditUser : handleCreateUser} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" required placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" required placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Phone Number (Optional)</label>
                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" placeholder="+91 9876543210" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={closeModal} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors border border-white/5">Cancel</button>
                        <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-black py-3 rounded-xl font-bold transition-colors">{isEditModalOpen ? 'Save Changes' : 'Create User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AssignGroupModal({
    selectedUser,
    groupsList,
    selectedGroups,
    setSelectedGroups,
    handleAssignGroup,
    closeModal
}: any) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden relative">
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                    <h3 className="font-display font-bold text-lg text-white">Assign Groups</h3>
                    <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleAssignGroup} className="p-5 space-y-4">
                    <p className="text-sm text-white/60 mb-2">Select the groups to assign to <strong>{selectedUser.name}</strong>:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {groupsList.length === 0 ? (
                            <div className="text-sm text-white/40">No groups available. Create ones in Group Management.</div>
                        ) : groupsList.map((group: any) => (
                            <label key={group.name} className="flex items-center gap-3 p-3 bg-background border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedGroups.includes(group.name)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedGroups([...selectedGroups, group.name]);
                                        else setSelectedGroups(selectedGroups.filter((g: string) => g !== group.name));
                                    }}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary/50 bg-black border-white/20"
                                />
                                <span className="text-white text-sm">{group.name}</span>
                            </label>
                        ))}
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={closeModal} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium transition-colors border border-white/5">Cancel</button>
                        <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-black py-2.5 rounded-xl font-bold transition-colors">Save Groups</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
