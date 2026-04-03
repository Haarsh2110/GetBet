import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import SystemSettings from '@/backend/models/system-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        let settings = await SystemSettings.findOne({});
        if (!settings) {
            settings = await SystemSettings.create({ 
                minDeposit: 100,
                minWithdrawal: 500,
                maxDailyLiability: 1000000
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('System Settings Get Failure:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch settings' 
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();

        let settings = await SystemSettings.findOne({});
        if (!settings) {
            settings = new SystemSettings(data);
        } else {
            if (typeof data.minDeposit === 'number') settings.minDeposit = data.minDeposit;
            if (typeof data.minWithdrawal === 'number') settings.minWithdrawal = data.minWithdrawal;
            if (typeof data.maxDailyLiability === 'number') settings.maxDailyLiability = data.maxDailyLiability;
            // Also allow updating globalAlert/withdrawalActive if needed
            if (typeof data.withdrawalActive === 'boolean') settings.withdrawalActive = data.withdrawalActive;
            if (typeof data.maintenanceMode === 'boolean') settings.maintenanceMode = data.maintenanceMode;
        }

        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('System settings Update Failure:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to sync settings' 
        }, { status: 500 });
    }
}
