'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { LogOut, LayoutDashboard, Package, Grid, ShoppingCart, Tag, Menu, X, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
    const { userInfo, logout, isLoading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && (!userInfo || !userInfo.isAdmin)) {
            router.push('/login');
        }
    }, [userInfo, isLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
        toast.success('Admin Session Terminated');
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Grid },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    ];

    if (isLoading || !userInfo || !userInfo.isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Verifying Authorization...</p>
            </div>
        );
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-slate-200">
            {/* Top Bar */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-zinc-950" />
                    </div>
                    <div>
                        <span className="block text-[11px] font-black text-zinc-950 tracking-[0.2em] uppercase leading-none">Admin</span>
                        <span className="block text-[9px] font-bold text-slate-500 tracking-widest uppercase mt-1">Panel</span>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-8">
                <nav className="px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group cursor-pointer ${
                                    isActive
                                        ? 'bg-primary-500 text-zinc-950 shadow-[0_10px_30px_rgba(68,214,44,0.15)]'
                                        : 'text-slate-500 hover:text-zinc-950 hover:bg-slate-50'
                                }`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-slate-400 group-hover:text-primary-500'}`} />
                                {item.name}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-950"></div>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary-500 font-black text-sm">
                        {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-zinc-900 uppercase truncate">{userInfo.name}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate">{userInfo.email}</p>
                    </div>
                </div>
                    <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-[9px] font-black text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest cursor-pointer"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex bg-slate-50 min-h-screen text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100] md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-[110] w-72 transform transition-transform duration-500 ease-out md:hidden ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-72 hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header Bar */}
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 md:hidden sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-zinc-950" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-950 italic tracking-widest uppercase">Admin Panel</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-zinc-950 transition-colors shadow-sm cursor-pointer"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                {/* Top Nav (Desktop only) */}
                <div className="hidden md:flex h-20 items-center justify-between px-10 border-b border-slate-200 flex-shrink-0 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-zinc-950 transition-all shadow-sm cursor-pointer">
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Back to Storefront</span>
                        </Link>
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 relative animate-in fade-in duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
