import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, LogOut, Package, Heart, X, ChevronRight, ShieldCheck, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Lenis from 'lenis';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

/** Utility for Tailwind class merging */
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const StoreLayout = () => {
    const { userInfo, logout } = useAuthStore();
    const { cartItems } = useCartStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();
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
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

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
            navigate(`/products?keyword=${searchQuery.trim()}`);
            setShowDropdown(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
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
                

                {/* 2. Main Header - Glassmorphism */}
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
                            <Link to="/" className="flex items-center gap-2 group">
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

                                {/* Live Dropdown - Styled to match */}
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
                                                        to={`/product/${p._id}`}
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
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex-shrink-0">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        addToCart(p, 1);
                                                                        toast.success('Added to inventory');
                                                                    }}
                                                                    className="p-2 sm:p-2.5 bg-primary-500 hover:bg-white text-zinc-950 rounded-xl transition-all shadow-lg active:scale-95 group/cartbtn"
                                                                    title="Add to Cart"
                                                                >
                                                                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/cartbtn:scale-110" />
                                                                </button>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                                        </div>
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
                                <Link to="/admin" className="hidden xl:flex items-center gap-2 text-slate-400 hover:text-primary-500 transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-sm font-semibold">Admin</span>
                                </Link>
                            )}

                            {/* User Account */}
                            <div className="relative group">
                                {userInfo ? (
                                    <button 
                                        onClick={() => navigate('/profile')}
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
                                    <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition py-2 px-3 rounded-lg hover:bg-white/5">
                                        <User className="w-5 h-5" />
                                        <span className="hidden md:inline text-sm font-semibold">Sign In</span>
                                    </Link>
                                )}

                                {/* User Dropdown */}
                                {userInfo && (
                                    <div className="absolute right-0 top-[120%] w-64 origin-top-right glass border border-white/10 divide-y divide-white/5 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] transform group-hover:translate-y-0 translate-y-4">
                                        <div className="px-5 py-5">
                                            <p className="text-sm font-bold text-white truncate">{userInfo.name}</p>
                                            <p className="text-xs text-slate-500 truncate mt-1">{userInfo.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link to="/profile" className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-primary-400 flex items-center gap-3 transition-colors font-semibold">
                                                <User className="w-4 h-4" /> My Profile
                                            </Link>
                                            <Link to="/profile?tab=orders" className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-primary-400 flex items-center gap-3 transition-colors font-semibold">
                                                <Package className="w-4 h-4" /> My Orders
                                            </Link>
                                            <Link to="/profile?tab=wishlist" className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-primary-400 flex items-center gap-3 transition-colors font-semibold">
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
                            <Link to="/cart" className="flex items-center gap-1.5 sm:gap-2 bg-primary-500 hover:bg-primary-400 text-zinc-950 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all active:scale-95 group relative shadow-[0_0_20px_rgba(68,214,44,0.3)]">
                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline text-sm font-black uppercase tracking-tight">Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 px-1 bg-white text-zinc-950 text-[8px] sm:text-[10px] font-black rounded-full shadow-lg border-2 border-primary-500">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                        </div>
                    </div>
                </div>

                {/* 3. Navigation Bar (Desktop) - Clean & Minimal */}
                <div className="relative z-[55] hidden lg:block glass border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center space-x-2 py-0.5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                                        location.pathname === link.to ? "text-primary-500" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {link.label}
                                    <span className={cn(
                                        "absolute bottom-0 left-0 w-full h-[1.5px] bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                                        location.pathname === link.to && "scale-x-100"
                                    )}></span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </motion.header>

            {/* Main Content Padding - Adjusted to prevent overlap */}
            <div className="pt-[140px] sm:pt-[160px] lg:pt-[180px]"></div>

            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Premium Footer - Deep Dark */}
            <footer className="bg-zinc-950 text-slate-400 mt-20 pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-8 mb-20">
                        
                        {/* Column 1: About */}
                        <div className="space-y-8">
                            <Link to="/" className="flex items-center gap-2 origin-left">
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
                                <a
                                    href="https://www.google.com/maps/dir/?api=1&destination=33.641411,73.077773"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                                        <MapPin className="w-4 h-4 group-hover:text-primary-500 transition-colors text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-600 mb-0.5">Location</p>
                                        <p className="text-white font-bold group-hover:text-primary-500 transition-colors">Visit Our Showroom</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8">Quick Navigation</h3>
                            <ul className="space-y-4 text-sm font-semibold">
                                {navLinks.map(link => (
                                    <li key={link.to}>
                                        <Link to={link.to} className="hover:text-primary-500 transition-all flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 opacity-0 transition-opacity"></span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Categories */}
                        <div>
                            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8">Collections</h3>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link to="/products?category=monitors" className="hover:text-primary-500 transition-colors">Professional Monitors</Link></li>
                                <li><Link to="/products?category=gaming" className="hover:text-primary-500 transition-colors">Gaming Screens</Link></li>
                                <li><Link to="/products?category=keyboards" className="hover:text-primary-500 transition-colors">Mechanical Keyboards</Link></li>
                                <li><Link to="/products?category=accessories" className="hover:text-primary-500 transition-colors">Premium Accessories</Link></li>
                            </ul>
                        </div>



                    </div>
                    
                    {/* Copyright Bar */}
                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        <p>&copy; {new Date().getFullYear()} KB COMPUTERS.</p>
                        <div className="flex gap-6">
                            <Link to="#" className="hover:text-primary-500 transition-colors">Privacy</Link>
                            <Link to="#" className="hover:text-primary-500 transition-colors">Terms</Link>
                            <Link to="#" className="hover:text-primary-500 transition-colors">Shipping</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile Drawer - Simplified 3-link nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] flex lg:hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="relative ml-auto w-[85vw] max-w-xs h-full bg-zinc-950 border-l border-white/5 flex flex-col overflow-hidden"
                        >
                            {/* Accent glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 blur-[80px] rounded-full pointer-events-none" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-white/5">
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                    <img src="/images/bgrm.png" alt="KB" className="h-7 w-auto" />
                                    <span className="text-base font-black tracking-tighter text-white">COMPUTERS</span>
                                </Link>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:border-primary-500/50 hover:text-primary-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {/* Core Nav Links */}
                            <nav className="flex-1 px-4 pt-6 space-y-2">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.35em] px-3 mb-4">Navigation</p>
                                {[
                                    { label: 'Home', to: '/', icon: 'home' },
                                    { label: 'Products', to: '/products', icon: 'bag' },
                                    { label: 'Contact Us', to: '/contact', icon: 'mail' },
                                ].map((link, i) => (
                                    <motion.div
                                        key={link.to}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <Link
                                            to={link.to}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="group flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-white/5 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-primary-500/40 group-hover:bg-primary-500/10 flex items-center justify-center transition-all duration-300">
                                                    {link.icon === 'home' && <svg className="w-4 h-4 text-slate-500 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                                                    {link.icon === 'bag' && <svg className="w-4 h-4 text-slate-500 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                                                    {link.icon === 'mail' && <svg className="w-4 h-4 text-slate-500 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                                </div>
                                                <span className="text-base font-bold text-white group-hover:text-primary-500 transition-colors tracking-tight">{link.label}</span>
                                            </div>
                                            <svg className="w-4 h-4 text-zinc-700 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Bottom */}
                            <div className="px-6 pb-8 pt-4 border-t border-white/5 space-y-3">
                                {userInfo ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm"
                                        >
                                            <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-zinc-950 font-black text-sm shrink-0">{userInfo.name.charAt(0)}</div>
                                            <span className="truncate">{userInfo.name.split(' ')[0]}</span>
                                        </Link>
                                        <button
                                            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                            className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-4 bg-primary-500 text-zinc-950 text-center font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-500/20 hover:bg-white transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StoreLayout;


