import { getWallet } from '@/backend/controllers/wallet.controller';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return getWallet(req);
}
