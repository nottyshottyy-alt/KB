'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

/* ─── Stat Card ─── */
const StatCard = ({ title, value, icon: Icon, colorClass, sub }) => (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 flex items-center gap-6 hover:border-primary-500/20 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300 cursor-pointer">
        <div className={`p-4 md:p-5 rounded-2xl flex-shrink-0 shadow-sm ${colorClass}`}>
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-zinc-950" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{title}</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 italic tracking-tighter">{value}</h3>
            {sub && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 group-hover:text-primary-500 transition-colors uppercase">{sub}</p>}
        </div>
    </div>
);

/* ─── Skeleton ─── */
const Skeleton = ({ className }) => <div className={`animate-pulse bg-slate-100 border border-slate-200 rounded-2xl ${className}`} />;

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'ADMIN DASHBOARD | COMPUTERS ADMIN';
        const fetch = async () => {
            try {
                const { data } = await api.get('/api/admin/stats');
                setStats(data);
            } catch (err) {
                setError(err.response?.data?.message || 'CRITICAL SYSTEM ERROR: STATS UNAVAILABLE');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em]">{error}</p>
        </div>
    );

    return (
        <div className="space-y-10">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(68,214,44,0.3)]"></div>
                    <span className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em]">System Status: Online</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-zinc-950 italic tracking-tighter uppercase leading-none">Dash<span className="text-primary-500 drop-shadow-[0_0_30px_rgba(68,214,44,0.05)]">board</span></h1>
                <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.5em] mt-3">Quick statistics and recent activity</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 md:h-40" />)
                ) : (
                    <>
                        <StatCard
                            title="Total Sales"
                            value={`PKR ${stats.totalRevenue.toLocaleString()}`}
                            icon={DollarSign}
                            colorClass="bg-primary-500"
                            sub="Revenue to date"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.totalOrders.toLocaleString()}
                            icon={ShoppingCart}
                            colorClass="bg-primary-500"
                            sub="Orders to date"
                        />
                        <StatCard
                            title="Total Products"
                            value={stats.totalProducts.toLocaleString()}
                            icon={Package}
                            colorClass="bg-primary-500"
                            sub="Products in store"
                        />
                        <StatCard
                            title="Total Customers"
                            value={stats.totalUsers.toLocaleString()}
                            icon={Users}
                            colorClass="bg-primary-500"
                            sub="Customer accounts"
                        />
                    </>
                )}
            </div>

            {/* Bottom Row: Top Products + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Top Products */}
                <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter">Best Selling <span className="text-primary-500">Products</span></h2>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Items with highest sales</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-primary-500" />
                    </div>
                    
                    {loading ? (
                        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                    ) : stats.topProducts.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transaction data registered</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.topProducts.map((p, i) => (
                                <div key={p._id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary-500/30 hover:bg-white transition-all group/item cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                        0{i + 1}
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 p-1">
                                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-zinc-950 uppercase truncate mb-0.5">{p.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.totalSold} Units Sold</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-primary-600 italic tracking-tighter">PKR {Math.round(p.totalRevenue).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-5 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter">Recent <span className="text-primary-500">Orders</span></h2>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Latest shop activity</p>
                        </div>
                        <Clock className="w-6 h-6 text-primary-500" />
                    </div>

                    {loading ? (
                        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                    ) : stats.recentOrders.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting first deployment</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.recentOrders.map(order => (
                                <div key={order._id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary-500/30 hover:bg-white transition-all cursor-pointer">
                                    <div className={`w-2 h-2 rounded-full ${order.isPaid ? 'bg-primary-500' : 'bg-red-500'} shadow-lg flex-shrink-0 animate-pulse`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-zinc-950 uppercase truncate mb-0.5">{order.user?.name || 'Guest User'}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-PK')}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-xs font-black text-zinc-950 italic">PKR {order.totalPrice.toLocaleString()}</span>
                                        <span className={`text-[7px] font-black uppercase tracking-widest ${order.isPaid ? 'text-primary-600' : 'text-red-600'} mt-1`}>
                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
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
