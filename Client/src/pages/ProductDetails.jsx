import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, ShoppingCart, ShieldCheck, Truck, RotateCcw, MapPin, Star, User, ShoppingBag, Shield, Clock, Zap, ChevronRight, Share2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [reviewImages, setReviewImages] = useState([]);
    const [uploadingReviewImages, setUploadingReviewImages] = useState(false);

    const { addToCart } = useCartStore();
    const { userInfo } = useAuthStore();

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
        window.scrollTo(0, 0);
    }, [id, reviewSuccess]);

    const handleAddToCart = () => {
        addToCart(product, qty);
        setAdded(true);
        toast.success(`${product.title} added to cart`);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        addToCart(product, qty);
        navigate('/checkout');
    };

    const uploadReviewImagesHandler = async (e) => {
        const files = Array.from(e.target.files);
        const formData = new FormData();

        setUploadingReviewImages(true);
        try {
            const uploadedImages = [];
            for (const file of files) {
                const singleFormData = new FormData();
                singleFormData.append('image', file);
                const { data } = await api.post('/api/uploads', singleFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImages.push(data.image);
            }
            setReviewImages(prev => [...prev, ...uploadedImages]);
            setUploadingReviewImages(false);
            toast.success('Images uploaded successfully');
        } catch (error) {
            console.error(error);
            setUploadingReviewImages(false);
            toast.error('Image upload failed');
        }
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        try {
            setReviewLoading(true);
            setReviewError('');
            await api.post(`/api/products/${id}/reviews`, {
                rating,
                comment,
                images: reviewImages
            }, {
                withCredentials: true
            });
            setReviewSuccess(true);
            setComment('');
            setRating(1);
            setReviewImages([]);
            toast.success('Review submitted successfully');
            setTimeout(() => setReviewSuccess(false), 3000);
        } catch (error) {
            setReviewError(error.response?.data?.message || 'Review submission failed');
        } finally {
            setReviewLoading(false);
        }
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
                    <Link to="/products" className="text-primary-500 font-bold hover:underline">Return to Products</Link>
                </div>
            </div>
        );
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;

    return (
        <div className="bg-zinc-950 min-h-screen pb-32 text-slate-200">
            {/* Header / Breadcrumb */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                <Link to="/products" className="group inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Collection
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">

                    {/* -- GALLERY (6 COLS) -- */}
                    <div className="lg:col-span-6 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-[3rem] bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center p-12 lg:p-20 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5"></div>
                            <div className="absolute inset-0 bg-zinc-950/20" style={{ backgroundImage: 'radial-gradient(#44d62c 0.5px, transparent 0.5px)', backgroundSize: '10px 10px opacity-5' }}></div>

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

                            {/* Image Controls Overlay */}
                            <div className="absolute bottom-8 right-8 flex items-center gap-4">
                                <button className="w-10 h-10 rounded-full bg-zinc-950/80 border border-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-all shadow-2xl">
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        try {
                                            await api.post('/api/users/wishlist', { productId: product._id }, { withCredentials: true });
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

                    {/* -- DETAILS & ACTIONS (6 COLS) -- */}
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

                        {/* Valuation Area */}
                        <div className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Quantity</span>
                                        <select
                                            value={qty}
                                            disabled={product.stock <= 0}
                                            onChange={(e) => setQty(Number(e.target.value))}
                                            className="bg-zinc-950 border border-white/5 px-4 py-2 rounded-xl text-xs font-black text-white focus:ring-0 appearance-none min-w-[80px] text-center"
                                        >
                                            {product.stock > 0 ? (
                                                [...Array(10)].map((_, x) => (
                                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                                ))
                                            ) : (
                                                <option value={0}>0</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className={`p-4 rounded-2xl flex flex-col items-center gap-1 border ${product.stock > 0 ? 'bg-primary-500/5 border-primary-500/20 text-primary-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{product.stock > 0 ? 'Status' : 'Alert'}</span>
                                        <span className="text-xs font-black uppercase tracking-widest">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
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

                        {/* Action Unit */}
                        {product.stock > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02, backgroundColor: "#ffffff", color: "#000000" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    className="group relative h-16 sm:h-20 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] overflow-hidden rounded-2xl sm:rounded-[1.5rem] transition-all shadow-[0_20px_40px_rgba(68,214,44,0.2)]"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                                        {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                        {added ? 'Added' : 'Add to Cart'}
                                    </span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleBuyNow}
                                    className="h-16 sm:h-20 bg-zinc-900 text-white border border-white/5 font-black uppercase tracking-[0.3em] rounded-2xl sm:rounded-[1.5rem] transition-all flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs"
                                >
                                    Buy Now <Zap className="w-4 h-4 text-primary-500" />
                                </motion.button>
                            </div>
                        )}



                        {/* Trust Markers */}
                        <div className="grid grid-cols-3 gap-4 pt-12 border-t border-white/5">
                            {[
                                { icon: Shield, label: 'Secure' },
                                { icon: Clock, label: 'Fast Delivery' },
                                { icon: RotateCcw, label: 'Easy Returns' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 opacity-30 hover:opacity-100 transition-opacity">
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>



                {/* --- RELATED UNITS --- */}
                {relatedProducts.length > 0 && (
                    <div className="mt-40 space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Related <span className="text-zinc-800">Products</span></h2>
                            <Link to="/products" className="text-[10px] font-black uppercase tracking-widest text-primary-500 flex items-center gap-2">View All <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {relatedProducts.map(related => (
                                <div key={related._id} className="space-y-4">
                                    <div className="relative group/card aspect-square bg-zinc-900 border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center p-4 sm:p-8 hover:border-primary-500/30 transition-all">
                                        <Link to={`/product/${related._id}`} className="block w-full h-full">
                                            <img src={related.images[0]} alt="" className="w-full h-full object-contain mix-blend-lighten group-hover/card:scale-110 transition-transform duration-700" />
                                        </Link>

                                        {/* Add to Cart Overlay */}
                                        <div className="absolute inset-x-2 bottom-2 translate-y-0 opacity-100 lg:opacity-0 lg:group-hover/card:translate-y-0 lg:group-hover/card:opacity-100 transition-all duration-300 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(related, 1);
                                                    toast.success('Added to inventory');
                                                }}
                                                className="w-full h-9 bg-primary-500 text-zinc-950 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-2xl hover:bg-white transition-colors"
                                            >
                                                <ShoppingCart className="w-3 h-3" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <Link to={`/product/${related._id}`}>
                                            <h3 className="text-[10px] sm:text-xs font-black text-white tracking-tight uppercase line-clamp-1 hover:text-primary-500 transition-colors italic">{related.title}</h3>
                                        </Link>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 tracking-tighter">PKR {related.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
