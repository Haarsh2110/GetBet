import mongoose from 'mongoose';
const url = 'mongodb+srv://danish00khan:Danish4600@cluster0.p0q7b.mongodb.net/getbet';
mongoose.connect(url).then(async () => {
    const WingoOrder = mongoose.model('WingoOrder', new mongoose.Schema({}, { strict: false }));
    const Session = mongoose.model('Session', new mongoose.Schema({}, { strict: false }));
    
    const orders = await WingoOrder.find().lean();
    console.log('Orders sample:', orders.slice(0, 2));

    const sessions = await Session.find({ 'pastResults.0': { $exists: true } }).lean();
    console.log('Sessions pastResults sample:', sessions.length ? sessions[0].pastResults : 'None');

    mongoose.disconnect();
}).catch(console.error);
