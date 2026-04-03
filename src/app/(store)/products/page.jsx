'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api/axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import useCartStore from '@/store/cartStore';
import ProductCard from '@/components/ProductCard';

const CatalogContent = () => {
    const { userInfo } = useAuthStore();
    const { addToCart } = useCartStore();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [localMin, setLocalMin] = useState('');
    const [localMax, setLocalMax] = useState('');
    const [sort, setSort] = useState('newest');

    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

    // Price Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinPrice(localMin);
            setMaxPrice(localMax);
        }, 600);
        return () => clearTimeout(timer);
    }, [localMin, localMax]);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, keyword, minPrice, maxPrice, sort]);

    useEffect(() => {
        if (selectedCategory && categories.length > 0) {
            const currentCat = categories.find(c => c._id === selectedCategory);
            document.title = currentCat ? `${currentCat.name.toUpperCase()} | COMPUTERS` : "PRODUCTS | COMPUTERS";
        } else {
            document.title = "PRODUCTS | COMPUTERS";
        }
    }, [selectedCategory, categories]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = `/api/products?keyword=${keyword}&sort=${sort}`;
            if (selectedCategory) url += `&category=${selectedCategory}`;
            if (minPrice) url += `&minPrice=${minPrice}`;
            if (maxPrice) url += `&maxPrice=${maxPrice}`;

            const { data } = await api.get(url);
            setProducts(data.products || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const FilterDropdown = ({ options, value, onChange, icon: Icon, label }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectedOption = options.find(opt => opt.value === value) || options[0];

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 px-5 py-3 rounded-xl backdrop-blur-xl hover:border-primary-500/40 transition-all duration-300 min-w-[200px] justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-primary-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                            {selectedOption?.label}
                        </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-[1000]" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute top-full left-0 mt-2 w-full bg-zinc-900/95 border border-white/10 rounded-xl overflow-hidden backdrop-blur-3xl z-[1001] shadow-2xl origin-top"
                            >
                                <div className="max-h-[250px] overflow-y-auto custom-scrollbar relative" style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
                                    {options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                onChange(opt.value);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                value === opt.value 
                                                    ? 'bg-primary-500/10 text-primary-500' 
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const categoryOptions = [
        { label: 'All Categories', value: '' },
        ...categories.map(c => ({ label: c.name, value: c._id }))
    ];

    const sortOptions = [
        { label: 'Newest Arrivals', value: 'newest' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Most Popular', value: 'popular' }
    ];

    return (
        <div className="relative min-h-screen bg-zinc-950 text-slate-200 py-20 overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3">
                            <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full">
                                <div className="flex items-center gap-2 text-primary-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping" />
                                    Live Inventory
                                </div>
                            </div>
                            {products.length > 0 && !loading && (
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    {products.length} Results Found
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                            Premium <br /><span className="text-zinc-700">Experience</span>
                        </h1>
                        <p className="text-[13px] text-slate-500 max-w-md font-medium leading-relaxed opacity-80">
                            Professional computer systems and high-performance components curated for elite workspace setups.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:w-auto relative z-[999]">
                        <div className="flex flex-col gap-3 bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-[2rem] backdrop-blur-3xl shadow-2xl relative z-[999]">
                            {/* Price Section */}
                            <div className="flex flex-col gap-2 pb-4 border-b border-white/5 relative z-[1000]">
                                <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] ml-1">Price Range (PKR)</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative group/input">
                                        <div className="absolute inset-0 bg-primary-500/5 rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity" />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Minimum"
                                            className="w-full bg-zinc-950/40 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-primary-500/50 text-[11px] font-black placeholder-zinc-800 text-white transition-all relative z-[10]"
                                            value={localMin}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setLocalMin(val);
                                            }}
                                        />
                                    </div>
                                    <div className="w-4 h-[1px] bg-zinc-800"></div>
                                    <div className="flex-1 relative group/input">
                                        <div className="absolute inset-0 bg-primary-500/5 rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity" />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Maximum"
                                            className="w-full bg-zinc-950/40 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-primary-500/50 text-[11px] font-black placeholder-zinc-800 text-white transition-all relative z-[10]"
                                            value={localMax}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setLocalMax(val);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dropdowns Section */}
                            <div className="flex items-center gap-3 relative z-[999]">
                                <FilterDropdown
                                    label="Category"
                                    icon={Filter}
                                    value={selectedCategory}
                                    options={categoryOptions}
                                    onChange={setSelectedCategory}
                                />

                                <FilterDropdown
                                    label="Sort"
                                    icon={SlidersHorizontal}
                                    value={sort}
                                    options={sortOptions}
                                    onChange={setSort}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-16" />



                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="bg-zinc-900 aspect-square rounded-2xl"></div>
                                <div className="space-y-2 p-2">
                                    <div className="h-2 bg-zinc-900 rounded-full w-1/4"></div>
                                    <div className="h-4 bg-zinc-900 rounded-full w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                    >
                        {products.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-40 space-y-6 opacity-40">
                                <div className="p-8 bg-white/5 rounded-full backdrop-blur-xl border border-white/10">
                                    <Search className="w-12 h-12 text-zinc-500" />
                                </div>
                                <p className="text-lg font-bold uppercase tracking-widest text-white">No products found matches your criteria</p>
                            </div>
                        ) : (
                            products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default function ProductCatalog() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CatalogContent />
        </Suspense>
    );
}
