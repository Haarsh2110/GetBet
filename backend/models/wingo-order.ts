import mongoose, { Schema, Document, Model } from 'mongoose';

export type WingoOrderStatus = 'PENDING' | 'EXECUTED' | 'PARTIAL';

export interface IWingoOrder extends Document {
    userId: string;
    period: string;
    amount: number;
    prediction: 'BIG' | 'SMALL';
    executedAmount: number;
    pendingAmount: number;
    status: WingoOrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

const WingoOrderSchema = new Schema<IWingoOrder>(
    {
        userId: { type: String, required: true, index: true },
        period: { type: String, required: true, index: true },
        amount: { type: Number, required: true },
        prediction: { type: String, enum: ['BIG', 'SMALL'], required: true },
        executedAmount: { type: Number, default: 0 },
        pendingAmount: { type: Number, default: 0 },
        status: { type: String, enum: ['PENDING', 'EXECUTED', 'PARTIAL'], default: 'PENDING' },
    },
    { timestamps: true }
);

// Compound index for unique betting per period per user if needed, 
// but user might want multiple bets. Let's just index them.

const WingoOrder: Model<IWingoOrder> =
    mongoose.models.WingoOrder || mongoose.model<IWingoOrder>('WingoOrder', WingoOrderSchema);

export default WingoOrder;
