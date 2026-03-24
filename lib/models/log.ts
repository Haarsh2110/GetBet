import mongoose, { Schema, Document, Model } from 'mongoose';

export type LogLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface ILog extends Document {
    logId: string;
    level: LogLevel;
    source: string; // e.g., 'Auth Service', 'Payment Gateway'
    message: string;
    adminId?: string; // The admin who performed the action, or 'SYSTEM'/'Auto'
    ipAddress?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const LogSchema = new Schema<ILog>(
    {
        logId: { type: String, required: true, unique: true },
        level: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
        source: { type: String, required: true },
        message: { type: String, required: true },
        adminId: { type: String },
        ipAddress: { type: String },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

LogSchema.index({ createdAt: -1 });

const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);

export default Log;
