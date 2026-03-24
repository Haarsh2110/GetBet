import mongoose, { Schema, Document, Model } from 'mongoose';

export type SessionGameType = 'WinGo' | 'Aviator' | 'Limbo';
export type SessionStatus = 'Running' | 'Suspended' | 'Completed' | 'Settled' | 'Disputed' | 'active' | 'stopped' | 'PENDING' | 'VERIFIED';

export interface ISession extends Document {
    sessionId: string; // e.g., 'WG-1M', 'AVT-01'
    game: SessionGameType;
    period: string; // Base creation period e.g., '1006678'
    currentPeriod?: string; // e.g. '1006671'
    upcomingPeriod?: string; // e.g. '1006672'
    status: SessionStatus;
    timerIntervalMs: number;
    startTime: Date;
    endTime: Date;
    totalPool: number;
    participantsCount: number;
    winningOutcome?: string; // e.g., 'Green', '2.45x'
    appealsCount: number;
    pausedTime?: Date; // Stores the exact time when session was suspended

    // Advanced Settings
    bettingEnabled: boolean;
    autoResult: boolean;
    resultDelaySeconds: number; // Delay before showing result

    // Multi-Period Manual Results Array
    pastResults: Array<{
        period: string;
        result: string; // 'Big', 'Small', etc.
        isRed: boolean; // For styling logic
        createdAt?: Date;
    }>;

    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
    {
        sessionId: { type: String, required: true, index: true },
        game: { type: String, enum: ['WinGo', 'Aviator', 'Limbo'], required: true, index: true },
        period: { type: String, required: true },
        currentPeriod: { type: String },
        upcomingPeriod: { type: String },
        status: { type: String, enum: ['Running', 'Suspended', 'Completed', 'Settled', 'Disputed', 'active', 'stopped', 'PENDING', 'VERIFIED'], default: 'Running', index: true },
        timerIntervalMs: { type: Number, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        totalPool: { type: Number, default: 0 },
        participantsCount: { type: Number, default: 0 },
        winningOutcome: { type: String },
        appealsCount: { type: Number, default: 0 },
        pausedTime: { type: Date },
        bettingEnabled: { type: Boolean, default: true },
        autoResult: { type: Boolean, default: true },
        resultDelaySeconds: { type: Number, default: 0 },
        pastResults: [
            {
                period: { type: String },
                result: { type: String },
                isRed: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

SessionSchema.index({ createdAt: -1 });
SessionSchema.index({ game: 1, createdAt: -1 });

if (mongoose.models.Session) {
    delete mongoose.models.Session;
}
const Session: Model<ISession> = mongoose.model<ISession>('Session', SessionSchema);

export default Session;
