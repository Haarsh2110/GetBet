'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Order = {
    _id: string;
    userId: string;
    userName?: string;
    totalOrder: number;
    executed: number;
    pending: number;
    status: string;
    createdAt: string;
};

export default function OrdersPage() {
    const [date, setDate] = useState(() => {
        const d = new Date();
        return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchOrders = async (pageNum: number) => {
        try {
            const res = await fetch(`/api/admin/orders?page=${pageNum}&limit=20`);
            const json = await res.json();
            if (json.success) {
                if (pageNum === 1) {
                    setOrders(json.data);
                } else {
                    setOrders(prev => [...prev, ...json.data]);
                }
                setHasMore(pageNum < json.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrders(nextPage);
    };

    if (selectedOrder) {
        return (
            <div className="min-h-screen bg-background text-white pb-20">
                {/* Dark Golden Header */}
                <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                    <button
                        onClick={() => setSelectedOrder(null)}
                        className="absolute left-6 text-primary hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-black text-xl tracking-widest uppercase">ORDER</h1>
                </div>

                {/* Date Badge */}
                <div className="flex justify-center mt-6">
                    <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black tracking-widest uppercase shadow-glow">
                        DATE: {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB')}
                    </div>
                </div>

                {/* Order Detail - Matching Screenshot 2 */}
                <div className="px-8 mt-10 space-y-6">
                    <DetailRow label="User id" value={selectedOrder.userId} />
                    <DetailRow label="ORDER" value={`${selectedOrder.totalOrder.toLocaleString()}`} />
                    <DetailRow label="EXECUTED" value={`${selectedOrder.executed.toLocaleString()}`} />
                    <DetailRow label="PENDING" value={`${selectedOrder.pending.toLocaleString()}`} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white pb-20">
            {/* Dark Golden Header */}
            <div className="sticky top-0 z-50 px-6 py-6 border-b border-primary/20 flex flex-col items-center justify-center relative bg-surface">
                <Link
                    href="/admin"
                    className="absolute left-6 text-primary hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-white font-black text-xl tracking-widest uppercase">ORDER</h1>
            </div>

            {/* Date Badge */}
            <div className="flex justify-center mt-6">
                <div className="bg-surface border border-primary/30 text-primary px-6 py-2 rounded-full text-[11px] font-black tracking-widest uppercase shadow-glow">
                    TODAY: {date}
                </div>
            </div>

            {/* Data Table */}
            <div className="px-4 mt-8">
                <table className="w-full text-center border-separate border-spacing-y-2">
                    <thead>
                        <tr>
                            <th className="py-2 text-primary font-black text-[10px] uppercase tracking-widest border-b border-primary/20 w-12">#</th>
                            <th className="py-2 text-primary font-black text-[10px] uppercase tracking-widest border-b border-primary/20">USER</th>
                            <th className="py-2 text-primary font-black text-[10px] uppercase tracking-widest border-b border-primary/20">ORDER</th>
                            <th className="py-2 text-primary font-black text-[10px] uppercase tracking-widest border-b border-primary/20">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order._id} className="bg-surface backdrop-blur-sm border-y border-white/5 transition-colors group">
                                <td className="py-4 text-white/50 font-black text-sm rounded-l-xl w-12">{index + 1}</td>
                                <td className="py-4 text-white font-bold text-xs tracking-wider truncate max-w-[120px]">{order.userName || order.userId}</td>
                                <td className="py-4 text-primary font-bold text-sm tracking-widest">{order.totalOrder.toLocaleString()}</td>
                                <td className="py-4 rounded-r-xl">
                                    <div className="flex items-center justify-center gap-3">
                                        <span className={`font-black text-[8px] sm:text-[10px] uppercase tracking-wider ${order.status === 'Pending' ? 'text-accent-red' : 'text-accent-green'}`}>
                                            {order.status}
                                        </span>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="bg-primary/20 text-primary p-1.5 rounded-md border border-primary/30 hover:bg-primary hover:text-black transition-colors active:scale-95"
                                        >
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && (
                    <div className="flex justify-center mt-8 mb-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}

                {!loading && orders.length === 0 && (
                    <div className="text-center text-white/50 text-xs font-black uppercase tracking-widest mt-12">
                        No orders found
                    </div>
                )}

                {/* Load More */}
                {!loading && hasMore && orders.length > 0 && (
                    <div className="flex justify-center mt-8 mb-8">
                        <button onClick={handleLoadMore} className="w-4/5 py-4 bg-surface border border-primary/20 text-primary font-black rounded-xl text-[11px] tracking-widest uppercase hover:bg-white/5 transition-colors shadow-lg active:scale-95">
                            MORE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex items-center gap-8 bg-surface border border-white/5 p-5 rounded-2xl shadow-lg">
            <span className="text-white/50 font-black text-[10px] uppercase tracking-widest w-24">{label}</span>
            <span className="text-primary font-black text-xl tracking-wider truncate">{value}</span>
        </div>
    );
}
