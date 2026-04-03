'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api/axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
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
    const [sort, setSort] = useState('newest');

    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

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

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-200 py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-12 border-b border-white/5 pb-12">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-primary-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                            Product Catalog
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight uppercase">
                            Premium <span className="text-zinc-600">Inventory</span>
                        </h1>
                        <p className="text-[12px] text-slate-500 max-w-md font-medium leading-relaxed">
                            Professional computer systems and components curated for high-end workspace setups.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900/30 border border-white/5 px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl transition-all duration-300 hover:border-white/10">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">Price Range</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-16 sm:w-20 bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold placeholder-zinc-700 text-white"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <div className="w-2 h-[1px] bg-zinc-800"></div>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-16 sm:w-20 bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold placeholder-zinc-700 text-white"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl hover:border-primary-500/30 transition-all duration-300">
                                <Filter className="w-3.5 h-3.5 text-primary-500" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="bg-transparent border-none outline-none focus:ring-0 text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer appearance-none pr-8"
                                >
                                    <option value="" className="bg-zinc-900">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id} className="bg-zinc-900">{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 w-3 h-3 text-slate-600 pointer-events-none group-hover:text-primary-500 transition-colors" />
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl hover:border-primary-500/30 transition-all duration-300">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-primary-500" />
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="bg-transparent border-none outline-none focus:ring-0 text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer appearance-none pr-8"
                                >
                                    <option value="newest" className="bg-zinc-900">Newest Arrivals</option>
                                    <option value="price_asc" className="bg-zinc-900">Price: Low to High</option>
                                    <option value="price_desc" className="bg-zinc-900">Price: High to Low</option>
                                    <option value="popular" className="bg-zinc-900">Most Popular</option>
                                </select>
                                <ChevronDown className="absolute right-4 w-3 h-3 text-slate-600 pointer-events-none group-hover:text-primary-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

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
