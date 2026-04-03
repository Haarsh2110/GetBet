import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/transaction';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const typeFilter = searchParams.get('type') || '';
        const dateFilter = searchParams.get('date') || ''; // YYYY-MM-DD

        const skip = (page - 1) * limit;

        // Base match for transactions
        const matchStage: any = {};

        if (dateFilter) {
            const startDate = new Date(dateFilter);
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(dateFilter);
            endDate.setUTCHours(23, 59, 59, 999);
            matchStage.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        if (typeFilter) {
            if (typeFilter === 'Bet Placed') {
                matchStage.type = { $in: ['bet', 'reverse_bet'] };
            } else if (typeFilter === 'Deposit') {
                matchStage.type = 'deposit';
            } else if (typeFilter === 'Withdrawal') {
                matchStage.type = 'withdraw';
            } else if (typeFilter === 'Win') {
                // If 'win' is tracked as 'transfer' or similar. Adjust if needed.
                matchStage.type = 'transfer';
            }
        }

        const aggregationPipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'userDocs'
                }
            },
            {
                $unwind: {
                    path: '$userDocs',
                    preserveNullAndEmptyArrays: true
                }
            }
        ];

        // Search match
        if (search) {
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { userId: { $regex: search, $options: 'i' } },
                        { txnId: { $regex: search, $options: 'i' } },
                        { 'userDocs.name': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Sorting by newest first
        aggregationPipeline.push({ $sort: { createdAt: -1 } });

        // Total count (for pagination)
        const countPipeline = [...aggregationPipeline, { $count: 'total' }];
        const countResult = await Transaction.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Add Pagination
        aggregationPipeline.push({ $skip: skip });
        aggregationPipeline.push({ $limit: limit });

        const history = await Transaction.aggregate(aggregationPipeline);

        // Format data for frontend
        const formattedData = history.map((item) => {
            const dateObj = new Date(item.createdAt);
            const formattedDate = dateObj.toISOString().split('T')[0] + ' ' +
                dateObj.getHours().toString().padStart(2, '0') + ':' +
                dateObj.getMinutes().toString().padStart(2, '0');

            const mappedType = item.type === 'bet' || item.type === 'reverse_bet' ? 'Bet Placed'
                : item.type === 'deposit' ? 'Deposit'
                    : item.type === 'withdraw' ? 'Withdrawal'
                        : item.type === 'transfer' ? 'Win / Transfer'
                            : item.type;

            const impact = (item.type === 'deposit' || item.type === 'transfer') ? item.amount : -item.amount;

            return {
                id: item.txnId || item._id.toString().substring(0, 8).toUpperCase(),
                rawId: item._id,
                date: formattedDate,
                user: `${item.userId} (${item.userDocs?.name || 'Unknown'})`,
                type: mappedType,
                game: item.note || item.method || 'Wallet', // Using note as game info if applicable
                amount: impact,
                status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Completed',
                detail: item.method ? `Method: ${item.method}` : item.note || 'No details',
            };
        });

        return NextResponse.json({
            success: true,
            data: formattedData,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Error fetching activity history:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
