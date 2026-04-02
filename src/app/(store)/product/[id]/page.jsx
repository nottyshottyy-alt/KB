'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, ShoppingCart, ShieldCheck, Truck, RotateCcw, MapPin, Star, User, ShoppingBag, Shield, Clock, Zap, ChevronRight, Share2, Heart, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const { cartItems, addToCart, setCartQty, removeFromCart } = useCartStore();
    const { userInfo } = useAuthStore();
    const itemInCart = cartItems.find(x => x.product === id);
    const cartQty = itemInCart ? itemInCart.qty : 0;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/api/products/${id}`);
                setProduct(data);
                document.title = `${data.title.toUpperCase()} | COMPUTERS`;
                setActiveImageIndex(0);

                if (data.category) {
                    const relatedRes = await api.get(`/api/products?category=${data.category._id}&limit=6`);
                    const filteredRelated = relatedRes.data.products.filter(p => p._id !== data._id).slice(0, 5);
                    setRelatedProducts(filteredRelated);
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProduct();
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, qty);
        setAdded(true);
        toast.success(`${product.title} added to cart`);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleIncrement = () => {
        if (cartQty > 0) {
            setCartQty(product._id, cartQty + 1);
        } else {
            handleAddToCart();
        }
    };

    const handleDecrement = () => {
        if (cartQty > 1) {
            setCartQty(product._id, cartQty - 1);
        } else if (cartQty === 1) {
            removeFromCart(product._id);
            toast.success(`${product.title} removed from cart`);
        }
    };

    const handleBuyNow = () => {
        addToCart(product, qty);
        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-20 gap-6">
                <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Initializing Data Stream</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-20">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="text-xl font-black uppercase tracking-widest text-slate-500">Product Not Found</p>
                    <Link href="/products" className="text-primary-500 font-bold hover:underline">Return to Products</Link>
                </div>
            </div>
        );
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;

    return (
        <div className="bg-zinc-950 min-h-screen pb-32 text-slate-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                <Link href="/products" className="group inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Collection
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* GALLERY */}
                    <div className="lg:col-span-6 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-[3rem] bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center p-12 lg:p-20 shadow-2xl"
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImageIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    src={product.images[activeImageIndex]}
                                    alt={product.title}
                                    className="w-full h-full object-contain mix-blend-lighten drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                />
                            </AnimatePresence>

                            <div className="absolute bottom-8 right-8 flex items-center gap-4">
                                <button 
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        try {
                                            await api.post('/api/users/wishlist', { productId: product._id });
                                            toast.success(`${product.title} added to wishlist`);
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || 'Failed to add to wishlist');
                                        }
                                    }}
                                    className="w-10 h-10 rounded-full bg-zinc-950/80 border border-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-primary-500 transition-all shadow-2xl group"
                                >
                                    <Heart className="w-4 h-4 group-hover:fill-primary-500" />
                                </button>
                            </div>
                        </motion.div>

                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-24 h-24 flex-shrink-0 rounded-2xl border transition-all overflow-hidden bg-zinc-900 flex items-center justify-center p-4 ${activeImageIndex === idx ? 'border-primary-500 shadow-[0_0_20px_rgba(68,214,44,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain mix-blend-lighten" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DETAILS */}
                    <div className="lg:col-span-6 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-md bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[9px] font-black uppercase tracking-widest leading-none">
                                    {product.category?.name || 'Classified'}
                                </span>
                                <div className="h-[1px] flex-1 bg-zinc-800"></div>
                            </div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tighter italic uppercase"
                            >
                                {product.title}
                            </motion.h1>

                            <div className="flex items-center gap-6">
                                <div className="px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">
                                        Assets Transferred: {product.soldCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 relative overflow-hidden group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Base Price</p>
                                    <div className="flex items-baseline gap-2 sm:gap-3">
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                                            PKR {price.toLocaleString()}
                                        </span>
                                        {product.discountPrice > 0 && (
                                            <span className="text-base sm:text-lg font-bold text-red-500 line-through tracking-tight">
                                                PKR {product.price.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                 <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">{cartQty > 0 ? 'Managed in Cart' : 'Select Quantity'}</span>
                                        {cartQty > 0 ? (
                                            <div className="flex items-center bg-zinc-950 border border-white/5 rounded-xl h-10 overflow-hidden min-w-[120px]">
                                                <button onClick={handleDecrement} className="flex-1 h-full hover:bg-zinc-800 text-red-500 transition-colors flex items-center justify-center border-r border-white/5 cursor-pointer"><X className="w-3 h-3" /></button>
                                                <div className="flex-[1.5] text-center text-white font-black text-xs">{cartQty}</div>
                                                <button onClick={handleIncrement} disabled={product.stock > 0 && cartQty >= product.stock} className="flex-1 h-full hover:bg-zinc-800 text-primary-500 transition-colors flex items-center justify-center border-l border-white/5 cursor-pointer disabled:opacity-20"><Plus className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <select
                                                value={qty}
                                                disabled={product.stock <= 0}
                                                onChange={(e) => setQty(Number(e.target.value))}
                                                className="bg-zinc-950 border border-white/5 px-4 py-2 rounded-xl text-xs font-black text-white focus:ring-0 appearance-none min-w-[80px] text-center cursor-pointer"
                                            >
                                                {[...Array(Math.min(product.stock, 10))].map((_, x) => (
                                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div className={`p-4 rounded-2xl flex flex-col items-center gap-1 border ${product.stock > 0 ? 'bg-primary-500/5 border-primary-500/20 text-primary-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{product.stock > 0 ? 'Status' : 'Alert'}</span>
                                        <span className="text-xs font-black uppercase tracking-widest">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
                                Specifications <div className="h-[1px] flex-1 bg-zinc-900"></div>
                            </h3>
                            <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-400 font-medium leading-relaxed">
                                {product.description.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 italic text-[11px] sm:text-sm">{line}</p>
                                ))}
                            </div>
                        </div>

                                                {product.stock > 0 && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02, backgroundColor: cartQty > 0 ? "#18181b" : "#ffffff", color: cartQty > 0 ? "#ffffff" : "#000000" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    className={`group relative h-16 sm:h-20 font-black uppercase tracking-[0.3em] overflow-hidden rounded-2xl sm:rounded-[1.5rem] transition-all shadow-[0_20px_40px_rgba(68,214,44,0.2)] cursor-pointer ${cartQty > 0 ? 'bg-zinc-900 text-white border border-white/10' : 'bg-primary-500 text-zinc-950'}`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                                        {added || cartQty > 0 ? <Check className="w-4 h-4 text-primary-500" /> : <ShoppingBag className="w-4 h-4" />}
                                        {added ? 'Quantity Added' : cartQty > 0 ? 'Managed in Cart' : 'Add to Cart'}
                                    </span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleBuyNow}
                                    className="h-16 sm:h-20 bg-zinc-900 border border-white/10 text-white font-black uppercase tracking-[0.3em] rounded-2xl sm:rounded-[1.5rem] transition-all flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs cursor-pointer"
                                >
                                    Buy Now <Zap className="w-4 h-4 text-primary-500" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-40 space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Related <span className="text-zinc-800">Products</span></h2>
                            <Link href="/products" className="text-[10px] font-black uppercase tracking-widest text-primary-500 flex items-center gap-2">View All <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {relatedProducts.map(related => (
                                <ProductCard key={related._id} product={related} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;
