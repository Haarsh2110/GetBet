import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WingoPeriod from '@/lib/models/wingo-period';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { periodId, result } = body;

        if (!periodId || !result) {
            return NextResponse.json({ success: false, error: 'Period ID and Result required' }, { status: 400 });
        }

        const normalizedResult = result.toUpperCase() as 'BIG' | 'SMALL';
        if (!['BIG', 'SMALL'].includes(normalizedResult)) {
            return NextResponse.json({ success: false, error: 'Invalid result. Use Big or Small.' }, { status: 400 });
        }

        const updated = await WingoPeriod.findByIdAndUpdate(
            periodId,
            {
                adminResult: normalizedResult,
                adminStatus: 'completed'
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: 'Period not found' }, { status: 404 });
        }

        // --- NEW REWARD / REVERSE LOGIC ---
        // Fetch all orders associated with this period to settle balances
        const WingoOrder = (await import('@/lib/models/wingo-order')).default;
        const User = (await import('@/lib/models/user')).default;
        const orders = await WingoOrder.find({ period: updated.period, status: 'PENDING' });

        for (const order of orders) {
            const user = await User.findOne({ userId: order.userId });
            if (user) {
                // Deduction now happens in the engine at assignment time.
                // We only handle the REVERSE logic here if the result was a MISMATCH.

                // 2. Reverse Logic: If prediction was WRONG (Mismatch with Admin Result), move funds to reverseBalance
                if (order.prediction !== normalizedResult) {
                    user.reverseBalance = (user.reverseBalance || 0) + order.amount;
                    console.log(`[Settlement] MISMATCH. Period ${updated.period}, User ${user.userId}: ${order.amount} -> Reverse`);
                    
                    // REVERT Daily stats execution for Admin Dashboard
                    try {
                        const { updateDailyExecution } = await import('@/lib/daily-recorder');
                        await updateDailyExecution(user.userId, order.amount, true);
                    } catch (e) {
                        console.error('[Settlement] DailyRecord Revert Failed:', e);
                    }

                    await user.save();
                } else {
                    console.log(`[Settlement] MATCH. Period ${updated.period}, User ${user.userId}: ${order.amount} -> Consumed`);
                }
            }
            order.status = 'EXECUTED';
            await order.save();
        }

        // Logic requested by user: Update session status
        if (updated.sessionId) {
            // Fetch all periods belonging to this session
            const sessionPeriods = await WingoPeriod.find({ sessionId: updated.sessionId }).lean();
            
            // Check if any period is still pending (adminStatus is not 'completed')
            const hasPending = sessionPeriods.some(p => p.adminStatus !== 'completed');
            
            // Update the central Session model status
            const Session = (await import('@/lib/models/session')).default;
            await Session.findByIdAndUpdate(updated.sessionId, {
                status: hasPending ? 'PENDING' : 'VERIFIED'
            });
            console.log(`[API] Session ${updated.sessionId} status updated to: ${hasPending ? 'PENDING' : 'VERIFIED'}`);
        }

        // Return same mapped format as GET
        const resultDoc = {
            ...updated.toObject(),
            id: updated._id.toString(),
            result: updated.adminResult || null,
            status: updated.adminStatus || 'pending'
        };

        return NextResponse.json({
            success: true,
            data: resultDoc
        });
    } catch (error: any) {
        console.error('Error updating period result:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update result' },
            { status: 500 }
        );
    }
}
