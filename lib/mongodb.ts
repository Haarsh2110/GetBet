import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Cached connection to reuse across hot-reloads in dev
let cached = (global as any).mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 3000,   // Fail fast - was 5000 causing 5s freezes
            socketTimeoutMS: 10000,
            maxPoolSize: 20,                  // Keep connections warm
            minPoolSize: 5,                   // Never drop below 5 connections
            maxIdleTimeMS: 60000,             // Keep idle connections alive 60s
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
