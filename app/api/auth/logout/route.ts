import { logout } from '@/backend/controllers/auth.controller';

export async function POST() {
    return logout();
}
