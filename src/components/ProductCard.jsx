'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Eye, Heart, X, Star, ShoppingBag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '@/store/cartStore';
import api from '@/lib/api/axios';
import toast from 'react-hot-toast';

/* ─────────────── Quick-View Modal ─────────────── */
const QuickViewModal = ({ product, onClose }) => {
    const { cartItems, addToCart, setCartQty, removeFromCart } = useCartStore();
    const itemInCart = cartItems.find(x => x.product === product._id);
    const qty = itemInCart ? itemInCart.qty : 0;
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const handleAdd = () => {
        addToCart(product, 1);
        toast.success(`${product.title} added to cart`);
    };

    const handleIncrement = () => {
        setCartQty(product._id, qty + 1);
    };

    const handleDecrement = () => {
        if (qty > 1) {
            setCartQty(product._id, qty - 1);
        } else {
            removeFromCart(product._id);
            toast.success(`${product.title} removed from cart`);
        }
    };

    const discountPct = product.discountPrice > 0
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative z-10 w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-700 transition-all font-black"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
                        {/* Image Gallery */}
                        <div className="relative bg-zinc-950 flex flex-col p-6 sm:p-8 min-h-[300px] md:min-h-[450px]">
                            {discountPct > 0 && (
                                <span className="absolute top-4 left-4 bg-primary-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg z-10">
                                    -{discountPct}% OFF
                                </span>
                            )}
                            
                            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeImageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        src={product.images && product.images.length > 0 ? product.images[activeImageIndex] : '/images/placeholder.png'}
                                        alt={product.title}
                                        className="w-full h-48 sm:h-64 md:h-72 object-contain drop-shadow-2xl mix-blend-lighten"
                                    />
                                </AnimatePresence>
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-2 justify-center mt-6 overflow-x-auto pb-2 no-scrollbar">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`w-12 h-12 flex-shrink-0 rounded-lg border transition-all overflow-hidden bg-zinc-800 flex items-center justify-center p-1.5 ${activeImageIndex === idx ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-white/5 hover:border-white/20'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-contain mix-blend-lighten" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-6 md:p-8 flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">
                                    {product.category?.name || 'Equipment'}
                                </p>
                                <h2 className="text-xl font-black text-white tracking-tighter leading-tight">
                                    {product.title}
                                </h2>
                            </div>

                            {/* Sold Count */}
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                        Items Sold: {product.soldCount || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl font-black text-white tracking-tighter">
                                        PKR {(product.discountPrice || product.price).toLocaleString()}
                                    </span>
                                    {product.discountPrice > 0 && (
                                        <span className="text-sm text-red-500/80 line-through font-bold">
                                            PKR {product.price.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Specifications / Description */}
                            {product.description && (
                                <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar pr-2">
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Specifications</h4>
                                    <p className="text-[11px] leading-relaxed text-slate-400 whitespace-pre-line font-medium opacity-80">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-white/5">
                                <div className="flex gap-3">
                                    {qty > 0 ? (
                                        <div className="flex-[3] flex items-center bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden">
                                            <button 
                                                onClick={handleDecrement}
                                                className="flex-1 h-full py-3.5 hover:bg-zinc-700 text-primary-500 transition-colors flex items-center justify-center border-r border-white/5 cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="flex-1 text-center text-white font-black text-xs">
                                                {qty}
                                            </div>
                                            <button 
                                                onClick={handleIncrement}
                                                disabled={product.stock > 0 && qty >= product.stock}
                                                className="flex-1 h-full py-3.5 hover:bg-zinc-700 text-primary-500 transition-colors flex items-center justify-center border-l border-white/5 cursor-pointer disabled:opacity-20 translate-y-[1px]"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAdd}
                                            disabled={product.stock === 0}
                                            className="flex-[3] py-3.5 bg-primary-500 text-zinc-950 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Add to Cart
                                        </button>
                                    )}
                                    <button
                                        onClick={async () => {
                                            try {
                                                await api.post('/api/users/wishlist', { productId: product._id });
                                                toast.success(`${product.title} added to wishlist`);
                                            } catch (err) {
                                                toast.error(err.response?.data?.message || 'Failed to add to wishlist');
                                            }
                                        }}
                                        className="flex-1 py-3.5 border border-white/10 text-slate-400 hover:text-primary-500 hover:border-primary-500/50 rounded-2xl transition-all flex items-center justify-center"
                                        title="Add to Wishlist"
                                    >
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>
                                <Link
                                    href={`/product/${product._id}`}
                                    onClick={onClose}
                                    className="w-full py-3.5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:border-primary-500/50 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
                                >
                                    View Full Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

/* ─────────────── ProductCard ─────────────── */
const ProductCard = ({ product }) => {
    const [quickView, setQuickView] = useState(false);
    const { cartItems, addToCart, setCartQty, removeFromCart } = useCartStore();
    const router = useRouter();

    const itemInCart = cartItems.find(x => x.product === product._id);
    const qty = itemInCart ? itemInCart.qty : 0;

    const discountPct = product.discountPrice > 0
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const handleCardClick = () => {
        router.push(`/product/${product._id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, 1);
        toast.success(`${product.title} added to cart`);
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        setCartQty(product._id, qty + 1);
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        if (qty > 1) {
            setCartQty(product._id, qty - 1);
        } else {
            removeFromCart(product._id);
            toast.success(`${product.title} removed from cart`);
        }
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        setQuickView(true);
    };

    return (
        <>
            {quickView && (
                <QuickViewModal product={product} onClose={() => setQuickView(false)} />
            )}

            <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
                className="group relative cursor-pointer z-0"
                onClick={handleCardClick}
            >
                {/* Background Glow Effect - Desktop Only for performance */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-primary-500/0 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden md:block" />

                <div className="relative bg-zinc-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden backdrop-blur-xl group-hover:border-primary-500/30 transition-all duration-500 shadow-2xl h-full flex flex-col">
                    <div className="relative aspect-square bg-zinc-950/20 overflow-hidden flex items-center justify-center p-3 sm:p-6">
                        {/* Luxury Badges */}
                        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex flex-col gap-2">
                            {product.stock <= 0 ? (
                                <span className="bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-md text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-lg shadow-lg">
                                    OUT OF STOCK
                                </span>
                            ) : discountPct > 0 ? (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary-500 blur-md opacity-20" />
                                    <span className="relative bg-primary-500 text-zinc-950 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-lg shadow-xl inline-block">
                                        -{discountPct}%
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        {/* Product Image with Float Animation */}
                        <motion.div 
                            className="w-full h-full flex items-center justify-center p-2"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
                                />
                            ) : (
                                <ShoppingBag className="w-16 h-16 text-zinc-800" />
                            )}
                        </motion.div>

                        {/* Hover Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        {/* Action Buttons Overlay - Always visible on mobile, hover-reveal on desktop */}
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20 transition-all duration-500 opacity-100 translate-y-0 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                                <button
                                    onClick={qty > 0 ? handleCardClick : handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className={`w-full py-3 sm:py-3.5 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xl cursor-pointer ${
                                        product.stock <= 0 
                                            ? 'bg-zinc-800 text-slate-500 cursor-not-allowed opacity-40' 
                                            : qty > 0 
                                                ? 'bg-zinc-800 text-primary-500 border border-primary-500/30 hover:bg-zinc-700' 
                                                : 'bg-primary-500 text-zinc-950 hover:bg-white active:scale-95'
                                    }`}
                                >
                                    {qty > 0 ? (
                                        <>
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            In Cart
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            {product.stock <= 0 ? 'Sold Out' : 'Buy Now'}
                                        </>
                                    )}
                                </button>
                        </div>

                        {/* Top Right Actions - Always visible on mobile, hover-reveal on desktop */}
                        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex flex-col gap-2 opacity-100 scale-100 md:opacity-0 md:scale-90 md:group-hover:opacity-100 md:group-hover:scale-100 transition-all duration-300">
                             <button
                                onClick={handleQuickView}
                                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-zinc-900/80 border border-white/10 rounded-xl text-zinc-100 hover:text-primary-500 hover:border-primary-500 transition-all backdrop-blur-md shadow-2xl cursor-pointer"
                                title="Quick View"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={async (e) => { 
                                    e.stopPropagation(); 
                                    try {
                                        await api.post('/api/users/wishlist', { productId: product._id });
                                        toast.success(`${product.title} added to wishlist`); 
                                    } catch (err) {
                                        toast.error(err.response?.data?.message || 'Failed to add to wishlist');
                                    }
                                }}
                                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-zinc-900/80 border border-white/10 rounded-xl text-zinc-100 hover:text-red-500 hover:border-red-500 transition-all backdrop-blur-md shadow-2xl cursor-pointer"
                                title="Add to Wishlist"
                            >
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-7 space-y-2 sm:space-y-3 flex-1 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <p className="text-[8px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] leading-none">
                                {product.category?.name || 'Equipment'}
                            </p>
                            {product.soldCount > 0 && (
                                <span className="text-[7px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-tighter opacity-60">
                                    {product.soldCount} sold
                                </span>
                            )}
                        </div>
 
                        <Link
                            href={`/product/${product._id}`}
                            onClick={e => e.stopPropagation()}
                            className="block text-sm sm:text-lg font-black text-white tracking-tight hover:text-primary-500 transition-colors line-clamp-2 leading-tight flex-1"
                        >
                            {product.title}
                        </Link>
 
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1">
                            <span className="text-sm sm:text-xl font-black text-white tracking-tighter">
                                PKR {(product.discountPrice || product.price).toLocaleString()}
                            </span>
                            {product.discountPrice > 0 && (
                                <span className="text-[10px] sm:text-xs text-red-500/80 line-through font-bold">
                                    PKR {product.price.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};


export default ProductCard;
