import mongoose, { Schema, Document, Model } from 'mongoose';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface ITicket extends Document {
    ticketId: string; // e.g. TKT-88902
    userId: string;
    subject: string;
    message: string;
    priority: TicketPriority;
    status: TicketStatus;
    adminReply?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
    {
        ticketId: { type: String, required: true, unique: true },
        userId: { type: String, required: true, index: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
        status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
        adminReply: { type: String },
        resolvedAt: { type: Date },
    },
    { timestamps: true }
);

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
