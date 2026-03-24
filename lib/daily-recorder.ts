import User from './models/user';
import DailyRecord from './models/daily-record';
import { connectDB } from './mongodb';

export async function getDailyRecord(userId: string) {
    await connectDB();
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').reverse().join('-');
    const dateFormatted = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    let record = await DailyRecord.findOne({ userId, date: dateFormatted });
    
    if (!record) {
        // Initialize Daily Record with current user's betting balance as the starting point (initialBalance)
        const user = await User.findOne({ userId });
        if (user) {
            record = await DailyRecord.create({
                userId,
                date: dateFormatted,
                initialBalance: user.bettingBalance || 0,
                totalOrder: user.bettingBalance || 0,
                pending: user.bettingBalance || 0,
                executed: 0,
                status: (user.bettingBalance || 0) <= 0 ? 'Completed' : 'Pending'
            });
            console.log(`[DailyRecord] Initialized for ${userId} on ${dateFormatted}. Starting balance: ${record.initialBalance}`);
        }
    }
    
    return record;
}

export async function recordNewTransfer(userId: string, amount: number) {
    await connectDB();
    const dateFormatted = new Date().toISOString().split('T')[0];
    
    let record = await DailyRecord.findOne({ userId, date: dateFormatted });
    const user = await User.findOne({ userId });
    if (!user) return;

    if (!record) {
        // First record of the day. The "Initial" balance is what they HAD before this current transfer.
        const dayStartBalance = (user.bettingBalance || 0) - amount;
        record = await DailyRecord.create({
            userId,
            date: dateFormatted,
            initialBalance: Math.max(0, dayStartBalance),
            newTransfers: amount,
            totalOrder: Math.max(0, dayStartBalance) + amount,
            executed: 0,
            pending: Math.max(0, dayStartBalance) + amount,
            status: 'Pending'
        });
        console.log(`[DailyRecord] Fresh Init for ${userId}. DayStart: ${dayStartBalance}, Deposit: ${amount}`);
    } else {
        // Record exists, just add the new transfer
        record.newTransfers += amount;
        record.totalOrder += amount;
        record.pending = record.totalOrder - record.executed;
        record.status = record.pending <= 0 ? 'Completed' : 'Pending';
        await record.save();
    }
}

export async function updateDailyExecution(userId: string, executedAmount: number, isReversal: boolean = false) {
    let record = await getDailyRecord(userId);
    if (!record) return;

    if (isReversal) {
        record.executed = Math.max(0, record.executed - executedAmount);
    } else {
        record.executed += executedAmount;
    }
    
    record.pending = record.totalOrder - record.executed;
    record.status = record.pending <= 0 ? 'Completed' : 'Pending';

    await record.save();
}
