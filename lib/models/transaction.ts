import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'deposit' | 'withdraw' | 'bet' | 'reverse_bet' | 'transfer' | 'purchase';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ITransaction extends Document {
    userId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    method?: string;           // UPI, BANK, USDT TRC20, etc.
    txnId?: string;            // External transaction / UTR reference
    walletAddress?: string;    // For crypto withdrawals
    bankDetails?: {
        accountHolder: string;
        accountNumber: string;
        ifsc: string;
        bank: string;
    };
    reason?: string;           // Rejection reason
    note?: string;
    screenshot?: string;       // base64 image or url
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: String, required: true, index: true },
        type: { type: String, enum: ['deposit', 'withdraw', 'bet', 'reverse_bet', 'transfer', 'purchase'], required: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending', index: true },
        method: { type: String },
        txnId: { type: String },
        walletAddress: { type: String },
        bankDetails: {
            accountHolder: String,
            accountNumber: String,
            ifsc: String,
            bank: String,
        },
        reason: { type: String },
        note: { type: String },
        screenshot: { type: String },
    },
    { timestamps: true }
);

TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });

// In Next.js dev mode, the model might be cached with an old schema.
// This forces a re-compile if the environment is development.
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Transaction;
}

const Transaction: Model<ITransaction> =
    mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
