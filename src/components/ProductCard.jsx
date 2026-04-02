'use client';

import React, { useState } from 'react';
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
                                        <span className="text-sm text-slate-600 line-through font-bold">
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
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="group relative cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden group-hover:border-primary-500/30 transition-all duration-500 shadow-lg">
                    <div className="relative aspect-square bg-zinc-950 overflow-hidden flex items-center justify-center p-2 sm:p-4">
                        {product.stock <= 0 ? (
                            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg z-10 shadow-lg">
                                OUT OF STOCK
                            </span>
                        ) : discountPct > 0 ? (
                            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary-500 text-zinc-950 text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg z-10 shadow-lg">
                                -{discountPct}%
                            </span>
                        ) : null}

                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <ShoppingBag className="w-16 h-16 text-zinc-800" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-20 translate-y-0 md:translate-y-4 opacity-100 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                             {qty > 0 ? (
                                <div className="w-full flex items-center bg-zinc-900 border border-white/10 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl h-8 sm:h-[38px]" onClick={e => e.stopPropagation()}>
                                    <button 
                                        onClick={handleDecrement}
                                        className="flex-1 h-full hover:bg-zinc-800 text-primary-500 transition-colors flex items-center justify-center border-r border-white/5 cursor-pointer"
                                    >
                                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
                                    </button>
                                    <div className="flex-1 text-center text-white font-black text-[10px] sm:text-xs">
                                        {qty}
                                    </div>
                                    <button 
                                        onClick={handleIncrement}
                                        disabled={product.stock > 0 && qty >= product.stock}
                                        className="flex-1 h-full hover:bg-zinc-800 text-primary-500 transition-colors flex items-center justify-center border-l border-white/5 cursor-pointer disabled:opacity-20"
                                    >
                                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                </div>
                             ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className={`w-full py-2 sm:py-2.5 font-black text-[8px] sm:text-[9px] uppercase tracking-widest rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl cursor-pointer ${product.stock <= 0 ? 'bg-zinc-800 text-slate-500 cursor-not-allowed' : 'bg-primary-500 text-zinc-950 hover:bg-white'}`}
                                >
                                    <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    {product.stock <= 0 ? 'Sold Out' : 'Buy Now'}
                                </button>
                             )}
                        </div>

                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex flex-col gap-1.5 sm:gap-2">
                            <button
                                onClick={handleQuickView}
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-zinc-900 border border-white/20 rounded-lg sm:rounded-xl text-zinc-100 hover:text-white hover:bg-zinc-800 hover:border-primary-500/50 opacity-100 md:opacity-0 md:scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 backdrop-blur-md shadow-2xl"
                                title="Quick View"
                            >
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-zinc-900 border border-white/20 rounded-lg sm:rounded-xl text-zinc-100 hover:text-primary-500 hover:bg-zinc-800 hover:border-primary-500/50 opacity-100 md:opacity-0 md:scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 backdrop-blur-md shadow-2xl"
                                title="Add to Wishlist"
                            >
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5" onClick={e => e.stopPropagation()}>
                        <p className="text-[7px] sm:text-[9px] font-black text-primary-500 uppercase tracking-widest leading-none">
                            {product.category?.name || 'Equipment'}
                        </p>
 
                        <Link
                            href={`/product/${product._id}`}
                            onClick={e => e.stopPropagation()}
                            className="block text-xs sm:text-sm font-black text-white tracking-tight hover:text-primary-500 transition-colors line-clamp-2 leading-tight h-8 sm:h-auto"
                        >
                            {product.title}
                        </Link>
 
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5 sm:pt-1">
                            <span className="text-xs sm:text-sm font-black text-white">
                                PKR {(product.discountPrice || product.price).toLocaleString()}
                            </span>
                            {product.discountPrice > 0 && (
                                <span className="text-[9px] sm:text-[10px] text-slate-600 line-through font-bold opacity-60">
                                    PKR {product.price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {(product.soldCount > 0) && (
                            <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
                                <span className="text-[7px] sm:text-[8px] font-black text-primary-500/80 uppercase tracking-wider bg-primary-500/5 px-2 py-0.5 rounded-md border border-primary-500/10">
                                    sold: {product.soldCount}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default ProductCard;
