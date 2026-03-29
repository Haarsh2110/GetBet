import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGameSettings extends Document {
    game: string; // e.g., 'wingo'
    periodRef: number;
    periodRefTime: Date; // The time when periodRef was set
    targetTime: number; // e.g., 60 (for 1 minute)
    sessionCount: number;
    sessionActive: boolean;
    showUpcomingToUsers: boolean;
    upcomingPeriod: number;
    lastResetDate: string; // Date string "YYYY-MM-DD" for reset comparison
}

const GameSettingsSchema = new Schema<IGameSettings>(
    {
        game: { type: String, required: true, unique: true },
        periodRef: { type: Number, required: true },
        periodRefTime: { type: Date, required: true },
        targetTime: { type: Number, default: 60 },
        sessionCount: { type: Number, default: 0 },
        sessionActive: { type: Boolean, default: false },
        showUpcomingToUsers: { type: Boolean, default: false },
        upcomingPeriod: { type: Number, default: 1000667 },
        lastResetDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
    },
    { timestamps: true }
);

const GameSettings: Model<IGameSettings> = 
    mongoose.models.GameSettings || mongoose.model<IGameSettings>('GameSettings', GameSettingsSchema);

export default GameSettings;
