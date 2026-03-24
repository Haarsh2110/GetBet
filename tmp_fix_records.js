const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://harsh:harsh@getbet.7a3m5.mongodb.net/test?retryWrites=true&w=majority&appName=GetBet";

async function fix() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Fixing DailyRecords for ${today}...`);
    
    const records = await db.collection('dailyrecords').find({ date: today }).toArray();
    
    for (const record of records) {
        // Find the user to get real current betting balance
        const user = await db.collection('users').findOne({ userId: record.userId });
        if (user) {
            // totalOrder should match currentBettingBalance + executedToday
            const correctedTotalOrder = (user.bettingBalance || 0) + (record.executed || 0);
            const correctedPending = (user.bettingBalance || 0);
            const correctedInitial = correctedTotalOrder - (record.newTransfers || 0);
            
            await db.collection('dailyrecords').updateOne(
                { _id: record._id },
                { 
                    $set: { 
                        totalOrder: correctedTotalOrder,
                        pending: correctedPending,
                        initialBalance: Math.max(0, correctedInitial),
                        status: correctedPending <= 0 ? 'Completed' : 'Pending'
                    } 
                }
            );
            console.log(`Fixed User ${record.userId}: Set TotalOrder to ${correctedTotalOrder}, Initial to ${correctedInitial}`);
        }
    }
    
    console.log('Done.');
    process.exit(0);
}

fix();
