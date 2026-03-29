import { getMasterStats } from '@/backend/controllers/master.controller';

export async function GET() {
    return getMasterStats();
}
