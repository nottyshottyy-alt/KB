'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, Tag, X, Loader2, LockKeyhole, Plus, Minus, ShoppingCart, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api/axios';
import toast from 'react-hot-toast';

const CartPage = () => {
    const { cartItems, addToCart, removeFromCart, appliedCoupon, setAppliedCoupon } = useCartStore();
    const { userInfo } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        document.title = "SHOPPING CART | COMPUTERS";
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }, []);

    const checkoutHandler = () => {
        router.push('/checkout');
    };

    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const cartSubtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const discount = appliedCoupon?.discount || 0;
    const cartTotal = Math.max(cartSubtotal - discount, 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        if (!userInfo) { toast.error('Please log in or register to use coupons'); return; }
        setCouponLoading(true);
        try {
            const { data } = await api.post('/api/coupons/apply', {
                code: couponCode.trim(),
                orderAmount: cartSubtotal,
                cartItems: cartItems
            });
            setAppliedCoupon(data);
            toast.success('Coupon Applied Successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid Coupon Code');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => { 
        setAppliedCoupon(null); 
        setCouponCode(''); 
    };

    const updateQty = (item, newQty) => {
        if (newQty < 1) return;
        useCartStore.getState().setCartQty(item.product, newQty);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-200 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 md:mb-16">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-8 md:w-12 h-[1px] bg-primary-500"></span>
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-primary-500">Inventory Status</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Shopping <span className="text-zinc-800 tracking-[-0.1em]">Cart</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-8 border-l border-zinc-900 pl-4 sm:pl-8">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Summary</p>
                            <p className="text-lg sm:text-2xl font-black text-white italic">{cartCount} ITEMS</p>
                        </div>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/5 p-8 sm:p-20 text-center rounded-[2rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <ShoppingCart className="w-14 h-14 sm:w-24 sm:h-24 text-zinc-800 mx-auto mb-4 sm:mb-8 group-hover:text-primary-500/20 transition-colors duration-700" />
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter mb-2 sm:mb-4">Your Cart is Empty</h2>
                        <p className="text-slate-500 mb-6 sm:mb-12 max-w-md mx-auto font-medium lowercase italic leading-relaxed text-sm">No hardware detected in your cart. Access the main collection to add items.</p>
                        <Link href="/products" className="relative z-10 inline-flex items-center gap-3 sm:gap-4 py-3.5 sm:py-5 px-7 sm:px-10 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-white transition-all shadow-2xl text-xs">
                            Browse Products <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24 relative z-10">
                        <div className="lg:col-span-8 space-y-3 sm:space-y-6">
                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={item.product} 
                                        className="relative bg-zinc-900 border border-white/5 p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-row items-center gap-3 sm:gap-8 group hover:border-primary-500/30 transition-all duration-500"
                                    >
                                        <button 
                                            onClick={() => removeFromCart(item.product)}
                                            className="hidden sm:block absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="w-16 h-16 sm:w-28 sm:h-28 flex-shrink-0 bg-zinc-950 rounded-xl sm:rounded-[1.5rem] overflow-hidden flex items-center justify-center p-2 sm:p-4 border border-white/5 group-hover:border-primary-500/20 transition-all">
                                            <img src={item.image || undefined} alt={item.name} className="w-full h-full object-contain mix-blend-lighten group-hover:scale-110 transition-transform duration-700" />
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1 text-left">
                                            <Link href={`/product/${item.product}`} className="block text-sm sm:text-lg font-black text-white italic uppercase tracking-tighter hover:text-primary-500 transition-colors leading-tight truncate pr-2">
                                                {item.name}
                                            </Link>
                                            <p className="text-[9px] sm:text-xs font-bold text-slate-500">PKR {item.price.toLocaleString()}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <div className="flex items-center gap-2 sm:gap-4 bg-zinc-950 p-1 sm:p-1.5 rounded-xl border border-white/5">
                                                <button 
                                                    onClick={() => updateQty(item, item.qty - 1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                                                >
                                                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                </button>
                                                <span className="w-5 sm:w-6 text-center font-black text-white text-xs">{item.qty}</span>
                                                <button 
                                                    onClick={() => updateQty(item, item.qty + 1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                                                >
                                                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                </button>
                                                
                                                <div className="w-[1px] h-4 bg-white/10 mx-1 sm:hidden"></div>
                                                <button 
                                                    onClick={() => removeFromCart(item.product)}
                                                    className="sm:hidden w-7 h-7 flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Subtotal</p>
                                                <p className="text-sm sm:text-lg font-black text-white italic">PKR {(item.qty * item.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="bg-zinc-900 border border-white/5 p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] shadow-2xl lg:sticky lg:top-32 space-y-6 sm:space-y-8">
                                <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Order <br /><span className="text-zinc-800">Summary</span></h2>

                                <div className="space-y-3 sm:space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coupon Code</p>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3 text-primary-500">
                                                <Tag className="w-4 h-4" />
                                                <span className="text-xs font-black tracking-[0.2em]">{appliedCoupon.code}</span>
                                            </div>
                                            <button onClick={removeCoupon} className="text-slate-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter Code"
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                                className="flex-1 bg-zinc-950 border border-white/5 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500 focus:outline-none placeholder-zinc-800 text-xs font-black uppercase tracking-widest"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="px-4 sm:px-6 bg-zinc-950 border border-primary-500/20 text-primary-500 font-black rounded-xl sm:rounded-2xl hover:text-white hover:bg-primary-500 transition disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] tracking-widest shadow-[0_0_15px_rgba(68,214,44,0.1)]"
                                            >
                                                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                        <span className="font-bold">PKR {cartSubtotal.toLocaleString()}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-primary-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">
                                                Coupon ({appliedCoupon.code}) {appliedCoupon.discountType === 'percentage' && <span className="text-white ml-1">-{appliedCoupon.discountValue}%</span>}
                                            </span>
                                            <span className="font-black italic">- PKR {Math.round(discount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="pt-5 sm:pt-8 border-t border-white/5 flex flex-col gap-1 sm:gap-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest">Total</span>
                                            <span className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter">PKR {Math.round(cartTotal).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-600 uppercase tracking-widest text-right">Inclusive of all taxes</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={checkoutHandler}
                                    className="w-full relative h-16 sm:h-20 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] overflow-hidden rounded-2xl sm:rounded-[1.5rem] transition-all hover:bg-white shadow-[0_20px_40px_rgba(68,214,44,0.2)] flex items-center justify-center gap-3 text-[10px] sm:text-xs"
                                >
                                    Proceed to Checkout <LockKeyhole className="w-4 h-4" />
                                </button>

                                <div className="flex items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
                                    <ShieldCheck className="w-5 h-5" />
                                    <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                                    <Zap className="w-5 h-5" />
                                    <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                                    <LockKeyhole className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
