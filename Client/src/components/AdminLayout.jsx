import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LogOut, LayoutDashboard, Package, Grid, ShoppingCart, Tag, Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const { userInfo, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Grid },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Top: Brand + Logout */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <img src="/images/bgrm.png" alt="KB" className="h-8 w-auto" />
                    <span className="text-lg font-bold text-slate-800 tracking-tight">COMPUTERS</span>
                </div>
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom: User Info */}
            <div className="p-4 border-t border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{userInfo?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{userInfo?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex bg-slate-50 min-h-screen">

            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Mobile slide-in sidebar ── */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:hidden ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <SidebarContent />
            </aside>

            {/* ── Desktop static sidebar ── */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile top bar */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <img src="/images/bgrm.png" alt="KB" className="h-7 w-auto" />
                        <span className="text-base font-bold text-slate-800 tracking-tight">COMPUTERS</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
