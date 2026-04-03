const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// [1/2] Zero-Dependency Environment Synchronizer
function syncEnvironment() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const raw = fs.readFileSync(envPath, 'utf8');
            raw.split('\n').forEach(line => {
                const [key, ...val] = line.split('=');
                if (key && val) process.env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
            });
        }
    } catch (e) {
        // Fallback to process.env if provided
    }
}

async function startPlatformDBSync() {
    syncEnvironment();
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('--- [CRITICAL ERROR] MONGODB_URI NODE NOT FOUND ---');
        process.exit(1);
    }

    try {
        console.log('--- Terminal Index Management: Initializing Handshake ---');
        await mongoose.connect(uri);
        const users = mongoose.connection.collection('users');

        console.log('[1/2] Checking for legacy invitation clusters...');
        try {
            // Attempt to drop the obsolete inviteCode_1 index
            await users.dropIndex('inviteCode_1');
            console.log('>>> SUCCESS: Obsolete Node Decommissioned.');
        } catch (e) {
            console.log('>>> SYSTEM: Index already clean or not present.');
        }

        console.log('[2/2] Synchronizing core platform security nodes...');
        // Ensure standard unique indices are intact
        await users.createIndex({ userId: 1 }, { unique: true });
        await users.createIndex({ phone: 1 }, { unique: true });
        await users.createIndex({ email: 1 }, { unique: true });

        console.log('--- Terminal Synchronization Complete: Ready for Access ---');
        process.exit(0);
    } catch (err) {
        console.error('--- [FATAL] Node Synchronization Failure ---', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

startPlatformDBSync();
