import mongoose, { Schema, Document, Model } from 'mongoose';

export type WingoPeriodState = 'WAITING' | 'PROCESSING' | 'RESULT_DECLARED';
export type WingoResult = 'BIG' | 'SMALL';

export interface IWingoPeriod extends Document {
    period: string;
    state: WingoPeriodState;
    result?: WingoResult;
    totalBigVolume: number;
    totalSmallVolume: number;
    totalBigUsers: number;
    totalSmallUsers: number;
    processedAt?: Date;
    sessionId?: string; // Links to Session activation
    status: 'pending' | 'completed';
    adminResult?: WingoResult;
    adminStatus: 'pending' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const WingoPeriodSchema = new Schema<IWingoPeriod>(
    {
        period: { type: String, required: true, unique: true, index: true },
        state: { type: String, enum: ['WAITING', 'PROCESSING', 'RESULT_DECLARED'], default: 'WAITING', index: true },
        result: { type: String, enum: ['BIG', 'SMALL'] },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true },
        adminResult: { type: String, enum: ['BIG', 'SMALL'] },
        adminStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        totalBigVolume: { type: Number, default: 0 },
        totalSmallVolume: { type: Number, default: 0 },
        totalBigUsers: { type: Number, default: 0 },
        totalSmallUsers: { type: Number, default: 0 },
        processedAt: { type: Date },
        sessionId: { type: String, index: true }, // Link to Session._id
    },
    { timestamps: true }
);

WingoPeriodSchema.index({ sessionId: 1, status: 1 });
WingoPeriodSchema.index({ createdAt: -1 });

const WingoPeriod: Model<IWingoPeriod> =
    mongoose.models.WingoPeriod || mongoose.model<IWingoPeriod>('WingoPeriod', WingoPeriodSchema);

export default WingoPeriod;
