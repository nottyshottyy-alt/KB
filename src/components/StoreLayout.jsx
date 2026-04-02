'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Isolated component so useSearchParams doesn't block static rendering
function SearchParamsWatcher({ onParamsChange }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        onParamsChange(searchParams);
    }, [searchParams, onParamsChange]);
    return null;
}
import { ShoppingCart, User, Search, Menu, LogOut, Package, Heart, X, ChevronRight, ShieldCheck, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import api from '@/lib/api/axios';
import toast from 'react-hot-toast';
import Lenis from 'lenis';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

/** Utility for Tailwind class merging */
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const StoreLayout = ({ children }) => {
    const { userInfo, logout } = useAuthStore();
    const { cartItems, addToCart } = useCartStore();
    const router = useRouter();
    const pathname = usePathname();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();
    const [mounted, setMounted] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 50) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize Lenis for smooth scrolling
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    // Close mobile menu on route change & Scroll to top
    useEffect(() => {
        setMobileMenuOpen(false);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Debounced search
    const handleSearch = useCallback((value) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!value.trim()) { setSearchResults([]); setShowDropdown(false); return; }

        debounceRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const { data } = await api.get(`/api/products?keyword=${value}&limit=5`);
                setSearchResults(data.products?.slice(0, 5) || []);
                setShowDropdown(true);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?keyword=${searchQuery.trim()}`);
            setShowDropdown(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
        toast.success('Signed out successfully');
    };

    const cartCount = cartItems.reduce((a, c) => a + c.qty, 0);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'All Products' },
        { to: '/contact-us', label: 'Contact Us' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-slate-100 font-sans selection:bg-primary-500/30 selection:text-white relative">
            <Suspense fallback={null}>
                <SearchParamsWatcher onParamsChange={() => {}} />
            </Suspense>
            
            {/* Header Area */}
            <motion.header 
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.2, ease: "linear" }}
                className="fixed w-full top-0 z-50 flex flex-col"
            >
                {/* Main Header - Glassmorphism */}
                <div className="relative z-[60] glass border-b border-white/10 py-3 sm:py-4 px-3 sm:px-6 lg:px-8 transition-all duration-300">
                    <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
                        
                        {/* Logo & Mobile Menu */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-slate-400 hover:text-primary-500 hover:bg-white/5 transition rounded-lg"
                                aria-label="Open menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <Link href="/" className="flex items-center gap-2 group">
                                <img src="/images/bgrm.png" alt="KB" className="h-8 sm:h-10 w-auto group-hover:scale-110 transition-transform" />
                                <span className="text-xl sm:text-3xl font-black tracking-tighter text-white inline">COMPUTERS</span>
                            </Link>
                        </div>

                        {/* Search Bar - Modern Integrated */}
                        <div className="hidden lg:flex flex-1 max-w-xl mx-8" ref={searchRef}>
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <div className={cn(
                                    "flex items-center bg-white/5 border rounded-full overflow-hidden transition-all duration-300",
                                    searchFocused ? "border-primary-500/50 bg-white/10 ring-4 ring-primary-500/10" : "border-white/10"
                                )}>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => {
                                            setSearchFocused(true);
                                            if (searchResults.length > 0) setShowDropdown(true);
                                        }}
                                        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                        className="w-full bg-transparent border-none outline-none focus:ring-0 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500"
                                    />
                                    <button type="submit" className="text-slate-400 hover:text-primary-500 px-3 sm:px-5 transition-colors">
                                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>

                                {showDropdown && (
                                    <div className="absolute top-full mt-3 w-full glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
                                        {searchLoading ? (
                                            <div className="p-6 text-sm text-slate-400 text-center">
                                                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                Searching...
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="p-6 text-sm text-slate-400 text-center">No results for "{searchQuery}"</div>
                                        ) : (
                                            <>
                                                {searchResults.map(p => (
                                                    <Link
                                                        key={p._id}
                                                        href={`/product/${p._id}`}
                                                        onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                                                        className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                                                    >
                                                        <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                                                            {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-contain" /> : <Package className="w-6 h-6 text-slate-500" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                                                            <p className="text-xs font-bold text-primary-500 mt-0.5">
                                                                PKR {(p.discountPrice || p.price).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                                    </Link>
                                                ))}
                                                <button
                                                    type="submit"
                                                    onClick={handleSearchSubmit}
                                                    className="w-full px-4 py-3 text-xs font-bold text-primary-500 bg-white/5 hover:bg-white/10 transition uppercase tracking-widest"
                                                >
                                                    View all results
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Actions Right */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            
                            {/* Admin Shortcut */}
                            {userInfo && userInfo.isAdmin && (
                                <Link href="/admin" className="hidden xl:flex items-center gap-2 text-slate-400 hover:text-primary-500 transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-sm font-semibold">Admin</span>
                                </Link>
                            )}

                            {/* User Account */}
                            <div className="relative group">
                                {userInfo ? (
                                    <button 
                                        onClick={() => router.push('/profile')}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition py-2 px-3 rounded-lg hover:bg-white/5"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 text-zinc-950 rounded-full flex items-center justify-center font-black text-[10px] sm:text-sm">
                                            {userInfo.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="hidden md:flex flex-col items-start leading-none text-left">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Account</span>
                                            <span className="font-bold text-sm text-white truncate max-w-[80px]">{userInfo.name.split(' ')[0]}</span>
                                        </div>
                                    </button>
                                ) : (
                                    <Link href="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition py-2 px-3 rounded-lg hover:bg-white/5">
                                        <User className="w-5 h-5" />
                                        <span className="hidden md:inline text-sm font-semibold">Sign In</span>
                                    </Link>
                                )}

                                {userInfo && (
                                    <div className="absolute right-0 top-[120%] w-64 origin-top-right glass border border-white/10 divide-y divide-white/5 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] transform group-hover:translate-y-0 translate-y-4">
                                        <div className="px-5 py-5">
                                            <p className="text-sm font-bold text-white truncate">{userInfo.name}</p>
                                            <p className="text-xs text-slate-500 truncate mt-1">{userInfo.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link href="/profile" className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-primary-400 flex items-center gap-3 transition-colors font-semibold">
                                                <User className="w-4 h-4" /> My Profile
                                            </Link>
                                            <Link href="/profile?tab=orders" className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-primary-400 flex items-center gap-3 transition-colors font-semibold">
                                                <Package className="w-4 h-4" /> My Orders
                                            </Link>
                                            <Link href="/profile?tab=wishlist" className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-primary-400 flex items-center gap-3 transition-colors font-semibold">
                                                <Heart className="w-4 h-4" /> Wishlist
                                            </Link>
                                        </div>
                                        <div className="py-2">
                                            <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-3 transition-colors font-semibold">
                                                <LogOut className="w-4 h-4" /> Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cart - High Contrast */}
                            <Link href="/cart" className="flex items-center gap-1.5 sm:gap-2 bg-primary-500 hover:bg-primary-400 text-zinc-950 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all active:scale-95 group relative shadow-[0_0_20px_rgba(68,214,44,0.3)]">
                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline text-sm font-black uppercase tracking-tight">Cart</span>
                                {mounted && cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 px-1 bg-white text-zinc-950 text-[8px] sm:text-[10px] font-black rounded-full shadow-lg border-2 border-primary-500">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                        </div>
                    </div>
                </div>

                {/* Navigation Bar (Desktop) */}
                <div className="relative z-[55] hidden lg:block glass border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center space-x-2 py-0.5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    href={link.to}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                                        pathname === link.to ? "text-primary-500" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {link.label}
                                    <span className={cn(
                                        "absolute bottom-0 left-0 w-full h-[1.5px] bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                                        pathname === link.to && "scale-x-100"
                                    )}></span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </motion.header>

            {/* Main Content Padding */}
            <div className="pt-[140px] sm:pt-[160px] lg:pt-[180px]"></div>

            <main className="flex-grow">
                {children}
            </main>

            {/* Premium Footer */}
            <footer className="bg-zinc-950 text-slate-400 mt-20 pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-8 mb-20">
                        <div className="space-y-8">
                            <Link href="/" className="flex items-center gap-2 origin-left">
                                <img src="/images/bgrm.png" alt="KB" className="h-10 w-auto" />
                                <span className="text-3xl font-black tracking-tighter text-white">COMPUTERS</span>
                            </Link>
                            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
                                Redefining your digital environment with high-performance computer systems and hardware. Elevate your workspace.
                            </p>
                            <div className="space-y-4">
                                <a href="https://wa.me/923365688821" target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                                        <Phone className="w-4 h-4 group-hover:text-primary-500 transition-colors text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-600 mb-0.5">Contact</p>
                                        <p className="text-white font-bold group-hover:text-primary-500 transition-colors">0336-5688821</p>
                                    </div>
                                </a>
                                <a href="mailto:kbcomputerz01@gmail.com" className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                                        <Mail className="w-4 h-4 group-hover:text-primary-500 transition-colors text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-600 mb-0.5">Email</p>
                                        <p className="text-white font-bold group-hover:text-primary-500 transition-colors">kbcomputerz01@gmail.com</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8">Quick Navigation</h3>
                            <ul className="space-y-4 text-sm font-semibold">
                                {navLinks.map(link => (
                                    <li key={link.to}>
                                        <Link href={link.to} className="hover:text-primary-500 transition-all flex items-center gap-3">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8">Collections</h3>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link href="/products?category=monitors" className="hover:text-primary-500 transition-colors">Professional Monitors</Link></li>
                                <li><Link href="/products?category=gaming" className="hover:text-primary-500 transition-colors">Gaming Screens</Link></li>
                                <li><Link href="/products?category=keyboards" className="hover:text-primary-500 transition-colors">Mechanical Keyboards</Link></li>
                                <li><Link href="/products?category=accessories" className="hover:text-primary-500 transition-colors">Premium Accessories</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] flex lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="relative ml-auto w-[85vw] max-w-xs h-full bg-zinc-950 border-l border-white/5 flex flex-col overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-white/5">
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                    <img src="/images/bgrm.png" alt="KB" className="h-7 w-auto" />
                                    <span className="text-base font-black tracking-tighter text-white">COMPUTERS</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <nav className="flex-1 px-4 pt-6 space-y-2">
                                {navLinks.map((link, i) => (
                                    <Link
                                        key={link.to}
                                        href={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-4 rounded-2xl hover:bg-white/5 text-white font-bold"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StoreLayout;
