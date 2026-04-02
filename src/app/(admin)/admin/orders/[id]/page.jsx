'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, CheckCircle, XCircle, Printer, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetailsAdmin = () => {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/api/orders/${id}`);
            setOrder(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Loading order details...</p>
        </div>
    );

    if (!order) return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <XCircle className="w-12 h-12 text-red-500" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Order not found</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <button onClick={() => router.back()} className="group flex items-center gap-2 mb-4 text-slate-500 hover:text-zinc-950 transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Back to Orders</span>
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-4 h-4 text-primary-600" />
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Order Details</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-zinc-950 tracking-tight uppercase leading-none truncate">
                        ORDER: <span className="text-primary-600">{order._id.substring(0, 16)}...</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="px-6 py-3.5 bg-white border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-zinc-950 hover:border-slate-300 transition-all flex items-center gap-3 cursor-pointer shadow-sm">
                        <Printer className="w-4 h-4" /> Print Order
                    </button>
                    <div className={`px-6 py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border shadow-sm ${order.isPaid ? 'bg-primary-50 border-primary-100 text-primary-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        Status: {order.isPaid ? 'PAID' : 'UNPAID'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Items */}
                    <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-950 tracking-tight uppercase flex items-center gap-4">
                                <Package className="w-6 h-6 text-primary-600" /> Order Items
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{order.orderItems.length} ITEMS</span>
                        </div>
                        
                        <div className="space-y-6">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:border-primary-500/20">
                                    <div className="w-20 h-20 bg-white border border-slate-200 rounded-xl overflow-hidden flex-shrink-0 p-2 shadow-sm">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-zinc-950 uppercase truncate mb-1">{item.name}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty: {item.qty}</span>
                                            <span className="text-[10px] font-bold text-primary-600/70 uppercase tracking-wider">PKR {item.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-zinc-950 tracking-tight">PKR {(item.qty * item.price).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Customer */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100">
                                    <User className="w-5 h-5 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-tight">Customer Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Name</p>
                                    <p className="text-xs font-black text-zinc-950 uppercase">{order.user?.name || 'Guest'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-xs font-black text-zinc-950 uppercase">{order.user?.email || 'Direct Checkout'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100">
                                    <MapPin className="w-5 h-5 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-tight">Shipping Address</h3>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                <p className="text-xs font-bold text-slate-600 uppercase leading-relaxed">
                                    {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
                                    {order.shippingAddress?.postalCode}<br />
                                    PHONE: {order.shippingAddress?.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metrics */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Financial Summary */}
                    <div className="bg-primary-500 p-1 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                        <div className="bg-white rounded-[2.4rem] p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-zinc-950 uppercase tracking-tight">Payment Summary</h3>
                                <CreditCard className="w-6 h-6 text-primary-600" />
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Items Subtotal</span>
                                    <span className="text-zinc-950">PKR {order.itemsPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-zinc-950">PKR {order.shippingPrice?.toLocaleString()}</span>
                                </div>
                                {order.taxPrice > 0 && (
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Tax</span>
                                        <span className="text-zinc-950">PKR {order.taxPrice?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                                    <div>
                                        <span className="text-[9px] font-bold text-primary-600 uppercase tracking-wider">Total Amount</span>
                                        <p className="text-3xl font-bold text-zinc-950 tracking-tight">PKR {order.totalPrice?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${order.isPaid ? 'bg-primary-500 text-zinc-950' : 'bg-red-500 text-white'}`}>
                                    {order.isPaid ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    {order.isPaid ? 'Paid' : 'Payment Pending'}
                                </div>
                                {order.isPaid && (
                                    <p className="text-[8px] font-bold text-slate-400 text-center mt-3 uppercase tracking-widest italic">Verified on {new Date(order.paidAt).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Operational Log */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-tight mb-8 flex items-center gap-4">
                            <Clock className="w-5 h-5 text-primary-600" /> Status Timeline
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-px bg-slate-200 relative">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary-600"></div>
                                </div>
                                <div className="pb-6">
                                    <p className="text-[10px] font-black text-zinc-950 uppercase tracking-widest mb-1 italic">Order Created</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-px bg-slate-200 relative">
                                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${order.isPaid ? 'bg-primary-600' : 'bg-slate-300'}`}></div>
                                </div>
                                <div className="pb-6">
                                    <p className="text-[10px] font-black text-zinc-950 uppercase tracking-widest mb-1 italic">Payment Received</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.isPaid ? new Date(order.paidAt).toLocaleString() : 'Pending'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-px bg-slate-200 relative">
                                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${order.isDelivered ? 'bg-primary-600' : 'bg-slate-300'}`}></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-950 uppercase tracking-widest mb-1 italic">Delivered</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.isDelivered ? new Date(order.deliveredAt).toLocaleString() : 'Processing'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsAdmin;
