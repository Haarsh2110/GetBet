import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Plan from '@/backend/models/plan';

let cachedPlans: any[] | null = null;
let lastUpdate: number = 0;
const CACHE_TTL = 120000; 

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const isAdmin = url.searchParams.get('admin') === 'true';

        // Return cached plans if available and valid (only for users)
        if (!isAdmin && cachedPlans && (Date.now() - lastUpdate < CACHE_TTL)) {
            return NextResponse.json({ success: true, plans: cachedPlans, source: 'memory_node' });
        }

        await connectDB();
        // Admin gets all plans, users only active ones
        let query = isAdmin ? {} : { isActive: true };
        let plans = await Plan.find(query)
            .sort({ price: 1 })
            .lean(); 
        
        if (!isAdmin) {
            cachedPlans = plans;
            lastUpdate = Date.now();
        }
        
        return NextResponse.json({ success: true, plans, source: 'database_node' });
    } catch (err: any) {
        console.error('[API GET PLANS]', err);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        await connectDB();
        
        // Use provided planId or generate one
        const planId = data.planId || `plan_${Date.now()}`;
        
        let plan = await Plan.findOneAndUpdate(
            { planId: planId },
            { ...data, planId },
            { upsert: true, new: true }
        );

        cachedPlans = null;
        lastUpdate = 0;

        return NextResponse.json({ success: true, plan });
    } catch (err: any) {
        console.error('[API POST PLANS]', err);
        return NextResponse.json({ success: false, error: 'Failed to save plan' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { planId } = await req.json();
        await connectDB();
        await Plan.deleteOne({ planId });

        cachedPlans = null;
        lastUpdate = 0;

        return NextResponse.json({ success: true, message: 'Plan deleted' });
    } catch (err: any) {
        console.error('[API DELETE PLANS]', err);
        return NextResponse.json({ success: false, error: 'Failed to delete plan' }, { status: 500 });
    }
}
