export interface UserProfile {
    id: string;
    phone: string;
    name: string;
    role: string;
    mainBalance: number;
    vipPlan: string;
    vipExpiresAt?: string;
}

export const userService = {
    async getProfile(): Promise<UserProfile | null> {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success) {
                return data.user;
            }
            return null;
        } catch (err) {
            console.error('[userService.getProfile]', err);
            return null;
        }
    },

    async updateName(phone: string, name: string) {
        try {
            const res = await fetch('/api/user/update-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, name }),
            });
            return await res.json();
        } catch (err) {
            console.error('[userService.updateName]', err);
            return { success: false, error: 'Network error' };
        }
    },

    async logout() {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            return await res.json();
        } catch (err) {
            console.error('[userService.logout]', err);
            return { success: false, error: 'Network error' };
        }
    }
};
