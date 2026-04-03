import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import GameSettings from '@/backend/models/game-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        let settings = await GameSettings.findOne({ game: 'wingo' });
        if (!settings) {
            // Create default settings if not exist
            settings = await GameSettings.create({ 
                game: 'wingo',
                periodRef: 1000000,
                periodRefTime: new Date(),
                maintenanceMode: false
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('WinGo Settings Get Failure:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Database connection failed' 
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();

        let settings = await GameSettings.findOne({ game: 'wingo' });
        if (!settings) {
            settings = new GameSettings({ game: 'wingo', ...data });
        } else {
            if (typeof data.maintenanceMode === 'boolean') settings.maintenanceMode = data.maintenanceMode;
            // Add other fields if needed
        }

        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('WinGo settings Update Failure:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update game settings' 
        }, { status: 500 });
    }
}
