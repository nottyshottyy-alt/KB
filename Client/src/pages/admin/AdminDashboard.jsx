import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

/* ─── Stat Card ─── */
const StatCard = ({ title, value, icon: Icon, colorClass, sub }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
        <div className={`p-4 rounded-xl flex-shrink-0 ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

/* ─── Skeleton ─── */
const Skeleton = ({ className }) => <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2 text-sm">
            <p className="font-semibold text-slate-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: <span className="font-bold">{p.name === 'Revenue' ? `PKR ${Number(p.value).toLocaleString()}` : p.value}</span>
                </p>
            ))}
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'Admin Dashboard - COMPUTERS Admin';
        const fetch = async () => {
            try {
                const { data } = await api.get('/api/admin/stats', { withCredentials: true });
                setStats(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (error) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-slate-600 font-medium">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Real-time store performance metrics.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
                ) : (
                    <>
                        <StatCard
                            title="Total Revenue"
                            value={`PKR ${stats.totalRevenue.toLocaleString()}`}
                            icon={DollarSign}
                            colorClass="bg-green-500"
                            sub="From paid orders"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.totalOrders.toLocaleString()}
                            icon={ShoppingCart}
                            colorClass="bg-primary-500"
                            sub="All time"
                        />
                        <StatCard
                            title="Active Products"
                            value={stats.totalProducts.toLocaleString()}
                            icon={Package}
                            colorClass="bg-orange-500"
                            sub="In catalog"
                        />
                        <StatCard
                            title="Registered Users"
                            value={stats.totalUsers.toLocaleString()}
                            icon={Users}
                            colorClass="bg-purple-500"
                            sub="Customers"
                        />
                    </>
                )}
            </div>



            {/* Bottom Row: Top Products + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="font-bold text-slate-900 mb-4">Top Products by Revenue</h2>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                    ) : stats.topProducts.length === 0 ? (
                        <p className="text-slate-400 text-sm py-4 text-center">No sales data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topProducts.map((p, i) => (
                                <div key={p._id} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-contain" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.totalSold} units sold</p>
                                    </div>
                                    <span className="text-sm font-bold text-green-600 flex-shrink-0">PKR {Math.round(p.totalRevenue).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="font-bold text-slate-900 mb-4">Recent Orders</h2>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                    ) : stats.recentOrders.length === 0 ? (
                        <p className="text-slate-400 text-sm py-4 text-center">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentOrders.map(order => (
                                <div key={order._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                                    <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{order.user?.name || 'Guest'}</p>
                                        <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                    >
                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 flex-shrink-0">PKR {order.totalPrice.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
