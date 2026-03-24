import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    level: number;
    benefits: string;
    status: 'Active' | 'Inactive';
    createdAt: Date;
    updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
    {
        name: { type: String, required: true, unique: true },
        level: { type: Number, required: true, default: 0 },
        benefits: { type: String, default: '' },
        status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    },
    { timestamps: true }
);

if (mongoose.models.Group) {
    delete mongoose.models.Group;
}
const Group: Model<IGroup> = mongoose.model<IGroup>('Group', GroupSchema);

export default Group;
