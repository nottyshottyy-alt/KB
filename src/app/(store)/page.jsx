'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { ArrowRight, ShieldCheck, Zap, Clock, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

// Interactive Components
import ParticleBackground from '@/components/ParticleBackground';
import AmbientBackground from '@/components/AmbientBackground';
import ScrollStorySection from '@/components/ScrollStorySection';
import ProductCard from '@/components/ProductCard';

const Hero3DScene = React.lazy(() => import('@/components/Hero3DScene'));

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCartStore();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/api/products?pageNumber=1&sort=popular');
                setProducts(data.products.slice(0, 8));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const textReveal = {
        hidden: { y: "100%" },
        visible: { y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className="min-h-screen bg-zinc-950 overflow-hidden text-slate-200">

            {/* --- BACKGROUND --- */}
            <ParticleBackground count={40} color="#44d62c" opacity={0.3} />
            <AmbientBackground />

            {/* --- HERO SECTION --- */}
            <section className="relative h-auto min-h-[700px] lg:h-[calc(100vh-180px)] flex items-center overflow-hidden border-b border-white/5 mb-12 sm:mb-20">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">

                        {/* Hero Text */}
                        <div className="text-center lg:text-left space-y-8">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainer}
                                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-500 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md"
                            >
                                <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
                                New Era of Precision
                            </motion.div>

                            <div className="space-y-4">
                                <div className="overflow-hidden">
                                    <motion.h1
                                        initial="hidden"
                                        animate="visible"
                                        variants={textReveal}
                                        className="text-4xl sm:text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tighter"
                                    >
                                        <img src="/images/bgrm.png" alt="Premium Computing" className="h-16 sm:h-24 lg:h-32 inline-block mb-6 object-contain brightness-110 contrast-110 drop-shadow-[0_0_30px_rgba(68,214,44,0.3)]" /> <br /> <span className="text-primary-500 flex items-center gap-2 sm:gap-4 pr-4">COMPUTERS</span>
                                    </motion.h1>
                                </div>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="text-base sm:text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0"
                                >
                                    Elevate your workspace with high-performance screens and accessories engineered for the ultimate digital environment.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start"
                            >
                                <Link href="/products" className="group relative px-10 py-5 bg-primary-500 text-zinc-900 font-black uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(68,214,44,0.4)] active:scale-95">
                                    <span className="relative z-10 flex items-center gap-3">
                                        Shop The Collection <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                </Link>
                                <Link href="/products?category=monitors" className="px-10 py-5 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-full border border-white/10 hover:bg-white/10 hover:border-primary-500/50 transition-all backdrop-blur-md active:scale-95">
                                    Explore Monitors
                                </Link>
                            </motion.div>
                        </div>

                        {/* Hero 3D Scene */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                            className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full"
                        >
                            <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing 3D Module...</div>}>
                                <Hero3DScene />
                            </React.Suspense>
                            <div className="absolute -inset-4 border border-primary-500/20 rounded-[2.5rem] -z-10 animate-pulse"></div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-primary-500 to-transparent"></div>
                </div>
            </section>

            {/* --- FEATURES STRIP --- */}
            <section className="bg-zinc-900 border-b border-white/5 py-12 relative z-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Truck, title: 'Delivery', desc: 'Nationwide Delivery' },
                            { icon: ShieldCheck, title: 'Quality', desc: 'Trusted Hardware' },
                            { icon: Clock, title: 'Support', desc: 'Expert Tech Assistance' },
                            { icon: Zap, title: 'Performance', desc: 'Engineered for Speed' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="flex flex-col gap-2 sm:gap-3 group"
                            >
                                <div className="text-primary-500 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-[9px] sm:text-[10px] uppercase tracking-widest mb-0.5 sm:mb-1">{feature.title}</h4>
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CATEGORIES --- */}
            <section className="py-24 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="mb-16 space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-xs font-black text-primary-500 uppercase tracking-[0.4em]"
                        >
                            Inventory
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-white tracking-tighter italic"
                        >
                            CATEGORIZED <span className="text-zinc-800">SYSTEMS</span>
                        </motion.h3>
                    </div>

                    <ScrollStorySection animationType="zoom">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: 'Custom Systems', image: '/images/custom_pc.png', link: '/products' },
                                { name: 'Computer Screens', image: '/images/computer_screens.png', link: '/products' },
                                { name: 'Core Components', image: '/images/components.png', link: '/products' }
                            ].map((cat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    <Link
                                        href={cat.link}
                                        className="group relative block h-[250px] sm:h-[450px] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 hover:border-primary-500/40 transition-all duration-700"
                                    >
                                        <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover sm:object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                            <div className="space-y-1">
                                                <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">Premium Line</h4>
                                                <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{cat.name}</h3>
                                            </div>
                                            <div className="pt-4">
                                                <span className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white group-hover:bg-primary-500 group-hover:text-zinc-950 transition-all">
                                                    View Collection
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollStorySection>
                </div>
            </section>

            {/* --- PRODUCT GRID --- */}
            <section className="py-24 bg-zinc-900/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="space-y-4">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-xs font-black text-primary-500 uppercase tracking-[0.4em]"
                            >
                                Selection
                            </motion.h2>
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-black text-white tracking-tighter"
                            >
                                PREMIUM <span className="text-zinc-700 italic">EQUIPMENT</span>
                            </motion.h3>
                        </div>
                        <Link href="/products" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary-500 hover:text-white transition-colors">
                            View Full Inventory <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" suppressHydrationWarning>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse space-y-4" suppressHydrationWarning>
                                    <div className="bg-zinc-800 aspect-square rounded-2xl"></div>
                                    <div className="space-y-2 p-2">
                                        <div className="h-2 bg-zinc-800 rounded-full w-1/3"></div>
                                        <div className="h-4 bg-zinc-800 rounded-full w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ScrollStorySection animationType="reveal">
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {products.length === 0 ? (
                                    <p className="col-span-4 text-center text-slate-500 py-12">No equipment listed in current registry.</p>
                                ) : (
                                    products.slice(0, 4).map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))
                                )}
                            </div>
                        </ScrollStorySection>
                    )}
                </div>
            </section>

            {/* --- CTA BANNER --- */}
            <section className="py-12 sm:py-24 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 group">
                        <div className="absolute inset-0 bg-zinc-950/50 opacity-10" style={{ backgroundImage: 'radial-gradient(#44d62c 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-500/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-[2000ms]"></div>

                        <div className="relative z-10 p-8 sm:p-12 md:p-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                            <div className="md:w-1/2 space-y-4 sm:space-y-8 text-center md:text-left">
                                <span className="inline-block px-3 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em]">Protocol 1.0</span>
                                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                                    UPGRADE YOUR <span className="text-zinc-700 italic">SETUP</span>
                                </h2>
                                <p className="text-slate-400 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                                    Strategic hardware bundles for enthusiasts and professionals. High-end computing made accessible.
                                </p>
                            </div>
                            <div className="md:w-1/2">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                    <img
                                        src="/images/keyboard.png"
                                        alt="Clinical Keyboard"
                                        className="relative z-10 w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
