import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
    maintenanceMode: boolean;
    withdrawalActive: boolean;
    globalAlert: string;
    updatedBy?: string;
    minDeposit: number;
    minWithdrawal: number;
    maxDailyLiability: number;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
    {
        maintenanceMode: { type: Boolean, default: false },
        withdrawalActive: { type: Boolean, default: true },
        globalAlert: { type: String, default: 'Welcome to GetBet. System status is stable.' },
        updatedBy: { type: String },
        minDeposit: { type: Number, default: 100 },
        minWithdrawal: { type: Number, default: 500 },
        maxDailyLiability: { type: Number, default: 1000000 }
    },
    { timestamps: true }
);

const SystemSettings: Model<ISystemSettings> =
    mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
