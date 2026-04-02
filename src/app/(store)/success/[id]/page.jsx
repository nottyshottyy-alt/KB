'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Home, ShoppingBag, Package, Truck, Clock, MapPin, CreditCard, ShieldCheck, Zap, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api/axios';

const OrderSuccessPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "ORDER SUCCESS | COMPUTERS";
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/api/orders/${id}`);
            setOrder(data);
        } catch (error) {
            console.error('Could not load order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 animate-pulse">Syncing Order Details</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-200 pb-32">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-20 relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <div className="w-24 h-24 bg-zinc-900 border border-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(68,214,44,0.2)] relative z-10">
                        <CheckCircle className="w-12 h-12 text-primary-500" />
                    </div>
                    
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="w-8 h-[1px] bg-primary-500"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-500 italic">Order Confirmed</span>
                        <span className="w-8 h-[1px] bg-primary-500"></span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
                        Order <br /><span className="text-zinc-800">Placed</span>
                    </h1>
                    
                    <div className="bg-zinc-900/50 border border-white/5 inline-flex items-center gap-4 px-6 py-3 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ORDER ID</p>
                        <p className="font-mono text-sm text-primary-500 font-bold tracking-wider">#{id?.substring(0, 12).toUpperCase()}</p>
                    </div>
                </motion.div>

                {order && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-12 lg:col-span-7 space-y-6"
                        >
                            <div className="bg-zinc-900 border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                    Order Summary <div className="h-[1px] flex-1 bg-zinc-800"></div>
                                </h2>
                                <div className="space-y-4">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-4 bg-zinc-950 border border-white/5 rounded-2xl group-hover:border-primary-500/10 transition-all">
                                            <div className="w-16 h-16 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/5">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-lighten p-1" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-white uppercase italic tracking-tight truncate">{item.name}</p>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">QUANTITY: {item.qty} ITEMS</p>
                                            </div>
                                            <p className="text-sm font-black text-white italic">PKR {(item.price * item.qty).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10 pt-8 border-t border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Subtotal</span>
                                        <span className="text-sm text-white font-bold">PKR {order.itemsPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Delivery Fee</span>
                                        <span className="text-sm text-white font-bold">PKR {order.shippingPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-4">
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Total Amount</span>
                                        <span className="text-4xl font-black text-white italic tracking-tighter">PKR {order.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-12 lg:col-span-5 space-y-6"
                        >
                            <div className="bg-zinc-900 border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
                                        Shipping Address <MapPin className="w-3 h-3 text-primary-500" />
                                    </h3>
                                    <div className="bg-zinc-800/50 p-6 rounded-2xl space-y-2">
                                        <p className="text-xs font-black text-white italic uppercase tracking-tight">{order.shippingAddress.address}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order.shippingAddress.city}</p>
                                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-2">Phone: {order.shippingAddress.phone}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl border-l-2 border-l-primary-500/50">
                                    <div className="flex items-center gap-4">
                                        <ShieldCheck className="w-6 h-6 text-primary-500/50" />
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed">Order successfully placed. You will be contacted shortly for further details.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 flex flex-col md:flex-row gap-6 justify-center"
                >
                    <Link href="/products" className="group h-16 px-10 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] overflow-hidden rounded-2xl transition-all hover:bg-white flex items-center justify-center gap-4 text-xs">
                        Continue Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/" className="h-16 px-10 bg-zinc-900 border border-white/5 text-slate-500 font-black uppercase tracking-[0.3em] rounded-2xl hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 text-xs">
                        Home <Home className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
