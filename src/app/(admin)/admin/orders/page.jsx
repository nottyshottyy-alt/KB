'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Eye, CheckCircle, ShoppingCart, Clock, User, DollarSign, ArrowRight, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "ORDER MANAGEMENT | COMPUTERS ADMIN";
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/api/orders');
            // Sort explicitly by newest first
            const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-primary-600" />
                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.4em]">Store Orders</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-950 italic tracking-tighter uppercase leading-none">Order <span className="text-primary-600">Management</span></h1>
                    <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic">Track and manage customer purchases</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter">Order <span className="text-primary-600">History</span></h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Orders: {orders.length}</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                <th className="py-6 px-10">Order ID</th>
                                <th className="py-6 px-10">Customer</th>
                                <th className="py-6 px-10">Date</th>
                                <th className="py-6 px-10">Amount</th>
                                <th className="py-6 px-10">Status</th>
                                <th className="py-6 px-10 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary-200 group-hover:bg-primary-500 transition-colors shadow-sm"></div>
                                            <span className="text-[10px] font-mono text-slate-400 group-hover:text-zinc-950 transition-colors uppercase tracking-widest">{order._id.substring(0, 12)}...</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary-600 group-hover:border-primary-500/30 transition-all font-black text-xs">
                                                {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'G'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-zinc-950 uppercase italic truncate">{order.user?.name || 'Guest'}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{order.user?.email || 'Direct Checkout'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-zinc-950 uppercase tracking-tighter font-mono">{new Date(order.createdAt).toLocaleDateString('en-PK')}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(order.createdAt).toLocaleTimeString('en-PK', { hour12: true, hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className="text-sm font-black text-primary-600 italic tracking-tighter">PKR {order.totalPrice.toLocaleString()}</span>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-2">
                                            {order.isPaid ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-[8px] font-black text-primary-600 uppercase tracking-widest">
                                                    <CheckCircle className="w-2.5 h-2.5 fill-current" /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-[8px] font-black text-red-600 uppercase tracking-widest">
                                                    <XCircle className="w-2.5 h-2.5 fill-current" /> Unpaid
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <Link 
                                            href={`/admin/orders/${order._id}`}
                                            className="w-10 h-10 rounded-xl inline-flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-zinc-950 hover:border-primary-500/30 transition-all group/btn shadow-sm cursor-pointer"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && orders.length === 0 && (
                    <div className="py-32 text-center">
                        <Clock className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">No orders found</p>
                    </div>
                )}

                {loading && (
                    <div className="py-32 text-center">
                        <div className="w-12 h-12 border-4 border-primary-500/10 border-t-primary-500 rounded-full mx-auto mb-6 animate-spin"></div>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">Loading orders...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOrders;
