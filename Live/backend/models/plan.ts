import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
    planId: string;
    name: string;
    tagline: string;
    price: number;
    oldPrice: number;
    vipBonus: number; // The VIP Balance (Token) credited upon purchase
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
    {
        planId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        tagline: { type: String },
        price: { type: Number, required: true },
        oldPrice: { type: Number },
        vipBonus: { type: Number, default: 100000 },
        features: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
