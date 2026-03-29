import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
    phone: string;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
    {
        phone: { type: String, required: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
    },
    { timestamps: true }
);

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp;
