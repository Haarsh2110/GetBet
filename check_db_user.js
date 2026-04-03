const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://anilvasisht027_db_user:SACHIN123@cluster0.7y3nhgw.mongodb.net/?appName=Cluster0";

async function check() {
    console.log('Attempting to connect...');
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('Connected to DB successfully');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const userDocs = await mongoose.connection.db.collection('users').find({ phone: /8168269901/ }).toArray();
        console.log('Users found in "users" collection:', JSON.stringify(userDocs, null, 2));

        const UsersDocs = await mongoose.connection.db.collection('Users').find({ phone: /8168269901/ }).toArray();
        console.log('Users found in "Users" collection:', JSON.stringify(UsersDocs, null, 2));

        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
        process.exit(1);
    }
}

check();
