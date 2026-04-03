export interface UserProfile {
    id: string;
    phone: string;
    name: string;
    role: string;
    mainBalance: number;
    vipPlan: string;
    vipExpiresAt?: string;
    avatar?: string;
    bankDetails?: {
        accountHolderName?: string;
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        upiId?: string;
    };
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

    async updateAvatar(avatar: string) {
        try {
            const res = await fetch('/api/user/update-avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar }),
            });
            return await res.json();
        } catch (err) {
            console.error('[userService.updateAvatar]', err);
            return { success: false, error: 'Network error' };
        }
    },

    async updateBank(bankDetails: any, password: string) {
        try {
            const res = await fetch('/api/user/update-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bankDetails, password }),
            });
            return await res.json();
        } catch (err) {
            console.error('[userService.updateBank]', err);
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
