import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Group from '@/lib/models/group';
import User from '@/lib/models/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const groups = await Group.find().sort({ level: -1 });

        // Count users per group
        const groupData = await Promise.all(groups.map(async (group) => {
            const memberCount = await User.countDocuments({ groups: group.name });
            return {
                ...group.toObject(),
                memberCount
            };
        }));

        return NextResponse.json({ success: true, data: groupData });
    } catch (error: any) {
        console.error('Error fetching groups:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch groups' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Check if group names already exist
        const exists = await Group.findOne({ name: body.name });
        if (exists) {
            return NextResponse.json({ success: false, error: 'Group name already exists' }, { status: 400 });
        }

        const newGroup = await Group.create(body);
        return NextResponse.json({ success: true, data: newGroup });
    } catch (error: any) {
        console.error('Error creating group:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, ...updateData } = body;

        const oldGroup = await Group.findById(id);
        if (!oldGroup) return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });

        // Check if name changed and if new name exists
        if (updateData.name && updateData.name !== oldGroup.name) {
            const exists = await Group.findOne({ name: updateData.name });
            if (exists) {
                return NextResponse.json({ success: false, error: 'New group name already exists' }, { status: 400 });
            }

            // Update all users who belonged to the old group name
            await User.updateMany(
                { groups: oldGroup.name },
                { $set: { "groups.$": updateData.name } }
            );
        }

        const group = await Group.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ success: true, data: group });
    } catch (error: any) {
        console.error('Error updating group:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

        const group = await Group.findByIdAndDelete(id);
        if (!group) return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });

        // Remove the group from all users
        await User.updateMany(
            { groups: group.name },
            { $pull: { groups: group.name } }
        );

        return NextResponse.json({ success: true, data: group });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
