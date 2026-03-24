import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyRecord extends Document {
    userId: string;
    date: string; // "YYYY-MM-DD"
    initialBalance: number; // Balance at 00:00
    newTransfers: number;   // New funds added to betting TODAY
    totalOrder: number;     // initialBalance + newTransfers
    executed: number;       // Amount consumed in rounds today
    pending: number;        // totalOrder - executed
    status: 'Pending' | 'Completed';
    createdAt: Date;
    updatedAt: Date;
}

const DailyRecordSchema = new Schema<IDailyRecord>(
    {
        userId: { type: String, required: true, index: true },
        date: { type: String, required: true, index: true },
        initialBalance: { type: Number, default: 0 },
        newTransfers: { type: Number, default: 0 },
        totalOrder: { type: Number, default: 0 },
        executed: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    },
    { timestamps: true }
);

// Unique index per user per day
DailyRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyRecord: Model<IDailyRecord> = mongoose.models.DailyRecord || mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema);
export default DailyRecord;
