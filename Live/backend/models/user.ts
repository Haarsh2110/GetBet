import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    userId: string;          // unique user ID (e.g. "user_001")
    name: string;
    email: string;
    phone: string;
    password?: string;       // hashed password
    mainBalance: number;
    bettingBalance: number;
    reverseBalance: number;
    vipBalance: number;
    estimatedBet: number;
    vipPlan: 'none' | 'starter' | 'growth' | 'elite';
    vipExpiresAt?: Date;
    status: 'active' | 'suspended' | 'banned';
    role: 'user' | 'admin' | 'superadmin';
    groups: string[];
    avatar?: string;
    bankDetails?: {
        accountHolder: string;
        accountNumber: string;
        ifsc: string;
        bankName: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        userId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true },
        password: { type: String },
    mainBalance: { type: Number, default: 0 },
    bettingBalance: { type: Number, default: 0 },
        reverseBalance: { type: Number, default: 0 },
        vipBalance: { type: Number, default: 0 },
        estimatedBet: { type: Number, default: 0 },
        vipPlan: { type: String, enum: ['none', 'starter', 'growth', 'elite'], default: 'none' },
        vipExpiresAt: { type: Date },
        status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
        role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
        groups: [{ type: String }],
        avatar: { type: String, default: '' },
        bankDetails: {
            accountHolder: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            ifsc: { type: String, default: '' },
            bankName: { type: String, default: '' },
        },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
