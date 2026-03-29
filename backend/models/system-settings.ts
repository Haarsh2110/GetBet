import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
    maintenanceMode: boolean;
    withdrawalActive: boolean;
    globalAlert: string;
    updatedBy?: string;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
    {
        maintenanceMode: { type: Boolean, default: false },
        withdrawalActive: { type: Boolean, default: true },
        globalAlert: { type: String, default: 'Welcome to GetBet. System status is stable.' },
        updatedBy: { type: String }
    },
    { timestamps: true }
);

const SystemSettings: Model<ISystemSettings> = 
    mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
