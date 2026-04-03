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
                maintenanceMode: false, 
                withdrawalActive: true, 
                globalAlert: 'MASTER_PROTOCOL: SYSTEM ALPHA [STABLE]' 
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Master Settings Get Failure:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Master Node Communication Failure' 
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();

        // Update global system variables
        let settings = await SystemSettings.findOne({});
        if (!settings) {
            settings = new SystemSettings(data);
        } else {
            if (typeof data.maintenanceMode === 'boolean') settings.maintenanceMode = data.maintenanceMode;
            if (typeof data.withdrawalActive === 'boolean') settings.withdrawalActive = data.withdrawalActive;
            if (typeof data.globalAlert === 'string') settings.globalAlert = data.globalAlert;
        }

        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Master settings Update Failure:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Master Node Synchronization Error' 
        }, { status: 500 });
    }
}
