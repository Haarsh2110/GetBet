import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SystemSettings from '@/lib/models/system-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        let settings = await SystemSettings.findOne({});
        if (!settings) {
            settings = await SystemSettings.create({ 
                maintenanceMode: false, 
                withdrawalActive: true, 
                globalAlert: 'Welcome to GetBet Master Console.' 
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Master Settings Get Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();

        // One system document only
        let settings = await SystemSettings.findOne({});
        if (!settings) {
            settings = new SystemSettings(data);
        } else {
            // Update fields manually for security
            if (typeof data.maintenanceMode === 'boolean') settings.maintenanceMode = data.maintenanceMode;
            if (typeof data.withdrawalActive === 'boolean') settings.withdrawalActive = data.withdrawalActive;
            if (typeof data.globalAlert === 'string') settings.globalAlert = data.globalAlert;
        }

        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Master Settings Update Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
}
