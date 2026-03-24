import WingoOrder from './models/wingo-order';
import WingoPeriod from './models/wingo-period';
import { connectDB } from './mongodb';
import Session from './models/session';
import User from './models/user';

// ─── In-Process Lock ─────────────────────────────────────────────────────────
// Prevents concurrent executions of the same period across parallel requests.
const processingLocks = new Set<string>();

export async function processWingoPeriod(periodId: string) {
    const startTime = Date.now();
    await connectDB();

    // === LOCK CHECK ===
    // If another request is already processing this period, bail out immediately.
    if (processingLocks.has(periodId)) {
        console.log(`[Engine] Period ${periodId} already processing. Skipping.`);
        return await WingoPeriod.findOne({ period: periodId }).lean();
    }
    processingLocks.add(periodId);

    try {
        // 1. Check session status
        const session = await Session.findOne(
            { game: 'WinGo', status: { $in: ['active', 'Running'] } },
            { _id: 1, status: 1, pastResults: 1 }
        ).sort({ createdAt: -1 }).lean();

        if (!session) {
            console.log(`[Engine] Aborting period ${periodId}. No active session.`);
            return null;
        }

        // 2. Period setup
        let periodDoc = await WingoPeriod.findOne({ period: periodId });
        if (!periodDoc) {
            periodDoc = new WingoPeriod({ period: periodId, state: 'WAITING' });
        }
        if (periodDoc.state === 'RESULT_DECLARED') {
            return { ...periodDoc.toObject(), id: periodDoc._id.toString() };
        }
        periodDoc.state = 'PROCESSING';
        periodDoc.sessionId = (session._id as any).toString();

        // 3. Fetch all eligible users (bettingBalance > 0) in ONE query
        const activeUsers = await User.find(
            { bettingBalance: { $gt: 0 }, role: 'user' },
            { _id: 1, userId: 1, bettingBalance: 1 }
        ).lean();

        if (activeUsers.length === 0) {
            console.log(`[Engine] No users with balance. Skipping assignment.`);
            await periodDoc.save();
            return { ...periodDoc.toObject(), id: periodDoc._id.toString() };
        }

        // 4. Check existing orders for this period in ONE query
        const existingOrders = await WingoOrder.find(
            { period: periodId },
            { userId: 1 }
        ).lean();
        const alreadyAssigned = new Set(existingOrders.map((o: any) => o.userId));

        // Filter to users not yet assigned
        const unassigned = activeUsers.filter(u => !alreadyAssigned.has(u.userId));

        if (unassigned.length === 0) {
            console.log(`[Engine] All users already assigned for period ${periodId}.`);
            return { ...periodDoc.toObject(), id: periodDoc._id.toString() };
        }

        // 5. Randomized Grouping & Anti-Pattern Risk Management
        // Randomize base risk (5% to 12%) for EACH period so users don't see a fixed 10% pattern
        const PERIOD_RISK_PERCENT = 0.05 + (Math.random() * 0.07); 
        
        const shuffled = [...unassigned].sort(() => Math.random() - 0.5);
        const count = shuffled.length;
        
        const splitPoint = count > 1 ? Math.floor(Math.random() * (count - 1)) + 1 : (count > 0 ? 1 : 0);
        const teamA = shuffled.slice(0, splitPoint);
        const teamB = shuffled.slice(splitPoint);

        const teamA_Prediction: 'BIG' | 'SMALL' = Math.random() > 0.5 ? 'BIG' : 'SMALL';
        const teamB_Prediction: 'BIG' | 'SMALL' = teamA_Prediction === 'BIG' ? 'SMALL' : 'BIG';

        const bigTeam = teamA_Prediction === 'BIG' ? teamA : teamB;
        const smallTeam = teamA_Prediction === 'SMALL' ? teamA : teamB;

        // Calculate Team Capacity based on randomized risk band
        const calculateTargetVolume = (team: any[]) => team.reduce((sum, u) => sum + (u.bettingBalance * PERIOD_RISK_PERCENT), 0);
        const potBigCapacity = calculateTargetVolume(bigTeam);
        const potSmallCapacity = calculateTargetVolume(smallTeam);

        const matchableVolume = Math.min(potBigCapacity, potSmallCapacity);

        // 6. Calculate assignments (Strict 1:1 Matching)
        const bulkUserUpdates: any[] = [];
        const bulkOrders: any[] = [];
        
        // Exact target for both sides (Perfect 50/50)
        const targetSideVolume = Math.floor(matchableVolume);
        let totalBigVolume = 0, totalSmallVolume = 0;

        const assignTeam = (team: any[], totalCapacity: number, prediction: 'BIG' | 'SMALL') => {
            if (team.length === 0 || targetSideVolume <= 0) return;
            
            // Distribute targetSideVolume among team members based on their balance weight
            let assignedToCurrentTeam = 0;
            const userAmounts = team.map(u => {
                const share = (u.bettingBalance * PERIOD_RISK_PERCENT) / totalCapacity;
                const amt = Math.floor(targetSideVolume * share);
                assignedToCurrentTeam += amt;
                return { u, amt };
            });

            // Handle rounding remainder to ensure EXACT 50/50 match
            let remainder = targetSideVolume - assignedToCurrentTeam;
            let idx = 0;
            while (remainder > 0 && idx < userAmounts.length) {
                userAmounts[idx].amt += 1;
                remainder--;
                idx++;
            }

            // Create orders and updates
            for (const { u, amt } of userAmounts) {
                if (amt <= 0) continue;

                if (prediction === 'BIG') totalBigVolume += amt;
                else totalSmallVolume += amt;

                bulkUserUpdates.push({
                    updateOne: {
                        filter: { _id: u._id, bettingBalance: { $gte: amt } },
                        update: { $inc: { bettingBalance: -amt } }
                    }
                });

                bulkOrders.push({
                    userId: u.userId,
                    period: periodId,
                    amount: amt,
                    prediction,
                    status: 'PENDING'
                });
            }
        };

        assignTeam(bigTeam, potBigCapacity, 'BIG');
        assignTeam(smallTeam, potSmallCapacity, 'SMALL');

        // 7. Execute ALL DB writes in PARALLEL (One bulk call each)
        const [bulkResult] = await Promise.all([
            bulkUserUpdates.length > 0
                ? User.bulkWrite(bulkUserUpdates, { ordered: false })
                : Promise.resolve(null),
            bulkOrders.length > 0
                ? WingoOrder.insertMany(bulkOrders, { ordered: false })
                : Promise.resolve(null),
        ]);

        // 8. Update Daily Records in background (non-blocking)
        if (bulkOrders.length > 0) {
            setImmediate(async () => {
                try {
                    const { updateDailyExecution } = await import('@/lib/daily-recorder');
                    await Promise.all(bulkOrders.map(o => updateDailyExecution(o.userId, o.amount)));
                } catch (e) {
                    console.error('[Engine] DailyRecord batch update failed:', e);
                }
            });
        }

        // 9. Save period doc
        periodDoc.totalBigVolume = totalBigVolume;
        periodDoc.totalSmallVolume = totalSmallVolume;
        periodDoc.totalBigUsers = bigTeam.length;
        periodDoc.totalSmallUsers = smallTeam.length;
        periodDoc.result = totalBigVolume <= totalSmallVolume ? 'BIG' : 'SMALL';
        await periodDoc.save();

        // 10. Automatically STOP session if no group is formed (0 volume)
        if (totalBigVolume === 0 && totalSmallVolume === 0) {
            await Session.updateOne(
                { _id: session._id },
                { $set: { status: 'Suspended', pausedTime: new Date() } }
            );
            console.log(`[Engine] ZERO VOLUME in Period ${periodId}. Session auto-stopped (Suspended).`);
        }

        const endTime = Date.now();
        console.log(`[Engine] Period ${periodId} done. Users: ${unassigned.length}, BulkWrites: ${bulkUserUpdates.length}, Time: ${endTime - startTime}ms`);

        const final = await WingoPeriod.findOne({ period: periodId }).lean();
        return { ...final, id: (final as any)?._id.toString() };

    } finally {
        // ALWAYS release the lock
        processingLocks.delete(periodId);
    }
}
