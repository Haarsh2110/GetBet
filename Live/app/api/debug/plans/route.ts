import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Plan from '@/backend/models/plan';

export async function GET() {
    await connectDB();
    const plans = await Plan.find({});
    return NextResponse.json(plans);
}
