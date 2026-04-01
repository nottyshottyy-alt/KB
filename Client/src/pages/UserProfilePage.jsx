import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
    User, Package, Clock, CheckCircle, Truck, XCircle,
    Heart, Edit3, Save, X, LockKeyhole, Camera, MapPin, Phone, Loader2, ArrowRight, Activity, ShieldCheck, Zap, ShoppingCart
} from 'lucide-react';
import useCartStore from '../store/cartStore';

/* ─── Status helpers ─── */
const STATUS_CONFIG = {
    Paid:    { icon: CheckCircle,  color: 'text-primary-500',  bg: 'bg-primary-500/5 border-primary-500/10' },
    Unpaid:  { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-500/5 border-red-500/10' },
};

/* ═══════════════════════════════════════════
   PROFILE TAB
   ═══════════════════════════════════════════ */
const ProfileTab = ({ userInfo, updateProfile }) => {
    const [editing, setEditing]   = useState(false);
    const [saving, setSaving]     = useState(false);
    const [changePw, setChangePw] = useState(false);
    const [form, setForm] = useState({
        name: userInfo?.name || '',
        phone: userInfo?.phone || '',
        street: userInfo?.address?.street || '',
        city: userInfo?.address?.city || '',
        country: userInfo?.address?.country || '',
    });
    const [pwForm, setPwForm] = useState({ password: '', confirmPassword: '' });

    const handleSave = async () => {
        setSaving(true);
        try {
            if (form.phone) {
                const cleanPhone = form.phone.replace(/[\s-]/g, '');
                if (!/^((\+92)|(0092)|0)?3\d{9}$/.test(cleanPhone)) {
                    toast.error('Please enter a valid Pakistani WhatsApp number (e.g. 03001234567)');
                    setSaving(false);
                    return;
                }
            }
            await updateProfile({
                name: form.name,
                phone: form.phone,
                address: {
                    street: form.street,
                    city: form.city,
                    country: form.country,
                }
            });
            toast.success('Profile updated successfully');
            setEditing(false);
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (pwForm.password !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (pwForm.password.length < 6) { toast.error('Password too short'); return; }
        setSaving(true);
        try {
            await updateProfile({ password: pwForm.password });
            toast.success('Password updated successfully');
            setChangePw(false);
            setPwForm({ password: '', confirmPassword: '' });
        } catch {
            toast.error('Error updating password');
        } finally {
            setSaving(false);
        }
    };

    const field = (label, key, type = 'text', icon) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                {icon} {label}
            </label>
            {editing ? (
                <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-zinc-950 text-white text-sm focus:border-primary-500 transition-all focus:outline-none"
                />
            ) : (
                <div className="px-5 py-3.5 bg-zinc-900 border border-white/5 rounded-2xl">
                    <p className="text-sm text-slate-200">{form[key] || <span className="text-slate-600 italic">No Data</span>}</p>
                </div>
            )}
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Profile Info Card */}
            <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                        <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest">Account Information</h3>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-1">Profile Details</p>
                    </div>
                    {editing ? (
                        <div className="flex gap-4">
                            <button onClick={() => setEditing(false)} className="px-5 py-2.5 bg-zinc-950 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-xl hover:text-white transition-all">
                                Abort
                            </button>
                            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-primary-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all flex items-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setEditing(true)} className="px-5 py-2.5 bg-zinc-950 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest rounded-xl hover:border-primary-500/50 transition-all flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-8">
                        {field('Full Name', 'name', 'text', <User className="w-3.5 h-3.5" />)}
                        {field('Phone Number', 'phone', 'tel', <Phone className="w-3.5 h-3.5" />)}
                    </div>
                    <div className="space-y-8">
                        {field('Shipping Address', 'street', 'text', <MapPin className="w-3.5 h-3.5" />)}
                    <div className="grid grid-cols-2 gap-4">
                        {field('City', 'city')}
                        {field('Country', 'country')}
                    </div>
                    </div>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                            <LockKeyhole className="w-4 h-4 text-primary-500" /> Account Security
                        </h3>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-1">Management</p>
                    </div>
                    {!changePw && (
                        <button onClick={() => setChangePw(true)} className="px-5 py-2.5 bg-zinc-950 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest rounded-xl hover:border-primary-500/50 transition-all">
                            Change Password
                        </button>
                    )}
                </div>
                {changePw ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">New Password</label>
                                <input
                                    type="password"
                                    value={pwForm.password}
                                    onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-zinc-950 text-white text-sm focus:border-primary-500 transition-all focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={pwForm.confirmPassword}
                                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-zinc-950 text-white text-sm focus:border-primary-500 transition-all focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setChangePw(false)} className="flex-1 py-3.5 bg-zinc-950 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-xl text-center">Discard</button>
                            <button onClick={handlePasswordSave} disabled={saving} className="flex-[2] py-3.5 bg-primary-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Commit Change
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(68,214,44,1)]"></div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Encrypted Authentication Active</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════
   ORDERS TAB
   ═══════════════════════════════════════════ */
const OrdersTab = ({ orders, loading, onCancel }) => {
    if (loading) return (
        <div className="space-y-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-zinc-900 border border-white/5 h-48 rounded-[2.5rem]" />
            ))}
        </div>
    );
    
    if (orders.length === 0) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-zinc-900/50 rounded-[3rem] border border-white/5">
            <Package className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">No Orders Found</p>
            <Link to="/products" className="inline-flex mt-8 text-primary-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Shop Online →</Link>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {[...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => {
                const cfg = order.isPaid ? STATUS_CONFIG.Paid : STATUS_CONFIG.Unpaid;
                const StatusIcon = cfg.icon;
                return (
                    <motion.div 
                        key={order._id} 
                        layout
                        className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 hover:bg-zinc-900 transition-all group"
                    >
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl group-hover:border-primary-500/20 transition-all">
                                    <Activity className="w-5 h-5 text-primary-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[11px] font-black text-white italic tracking-tighter uppercase mb-0.5 sm:mb-1">Order ID: <span className="font-mono text-primary-500/70">#{order._id.substring(order._id.length - 8).toUpperCase()}</span></p>
                                    <p className="text-[8px] sm:text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                        </div>

                        <div className="flex items-center gap-4 overflow-x-auto pb-6 hide-scrollbar">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex-shrink-0 w-20 h-20 bg-zinc-950 border border-white/5 rounded-2xl p-2 flex items-center justify-center relative group/item" title={item.name}>
                                    <img src={item.image || undefined} alt={item.name} className="w-full h-full object-contain mix-blend-lighten" />
                                    <div className="absolute inset-0 bg-primary-500/0 group-hover/item:bg-primary-500/5 transition-all rounded-2xl"></div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Total Amount</p>
                                <p className="text-lg sm:text-xl font-black text-white italic tracking-tighter">PKR {order.totalPrice.toLocaleString()}</p>
                            </div>
                            <Link to={`/success/${order._id}`} className="group h-12 px-6 bg-zinc-950 border border-white/5 text-[9px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-white hover:text-zinc-950 transition-all flex items-center justify-center gap-3">
                                Detailed Manifest <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

/* ═══════════════════════════════════════════
   WISHLIST TAB
   ═══════════════════════════════════════════ */
const WishlistTab = ({ userInfo }) => {
    const { addToCart } = useCartStore();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/api/users/wishlist', { withCredentials: true });
                setItems(data);
            } catch { toast.error('DATA RETRIEVAL FAILED'); }
            finally { setLoading(false); }
        };
        if (userInfo) fetch();
    }, [userInfo]);

    const removeItem = async (productId) => {
        setRemoving(productId);
        try {
            await api.delete(`/api/users/wishlist/${productId}`, { withCredentials: true });
            setItems(prev => prev.filter(p => p._id !== productId));
            toast.success('REGISTRY REMOVED');
        } catch { toast.error('PROTOCOL ERROR'); }
        finally { setRemoving(null); }
    };

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-zinc-900 border border-white/5 h-64 rounded-[2.5rem]" />
            ))}
        </div>
    );

    if (items.length === 0) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-zinc-900/50 rounded-[3rem] border border-white/5">
            <Heart className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">Your wishlist is empty</p>
            <Link to="/products" className="inline-flex mt-8 text-primary-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Go Shopping →</Link>
        </motion.div>
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {items.map(product => (
                <motion.div 
                    layout
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    key={product._id} 
                    className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden group shadow-xl"
                >
                    <Link to={`/product/${product._id}`} className="block relative h-40 sm:h-48 bg-zinc-950 overflow-hidden group">
                        <img 
                            src={product.images?.[0]} 
                            alt={product.title} 
                            className="w-full h-full object-contain p-6 mix-blend-lighten group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/[0.03] transition-colors" />
                        
                        {/* Add to Cart Overlay */}
                        <div className="absolute inset-x-2 bottom-2 translate-y-0 opacity-100 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300 z-10">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    addToCart(product, 1);
                                    toast.success('Added to inventory');
                                }}
                                className="w-full h-9 bg-primary-500 text-zinc-950 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-2xl hover:bg-white transition-colors"
                            >
                                <ShoppingCart className="w-3 h-3" />
                                Add to Cart
                            </button>
                        </div>
                    </Link>
                    <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                            <div className="min-w-0">
                                <p className="text-[7px] sm:text-[9px] font-black text-primary-500 uppercase tracking-widest mb-0.5 sm:mb-1">{product.category?.name}</p>
                                <h4 className="text-[10px] sm:text-xs font-black text-white italic uppercase tracking-tight truncate">{product.title}</h4>
                            </div>
                            <button
                                onClick={() => removeItem(product._id)}
                                disabled={removing === product._id}
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-950 border border-white/5 rounded-lg sm:rounded-xl flex items-center justify-center text-red-500/50 hover:text-red-500 hover:border-red-500/30 transition-all disabled:opacity-50 self-end sm:self-auto"
                            >
                                {removing === product._id ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <X className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between pt-1 sm:pt-2">
                            <span className="text-[10px] sm:text-sm font-black text-white italic tracking-tighter">PKR {(product.discountPrice || product.price).toLocaleString()}</span>
                            <Link to={`/product/${product._id}`} className="p-1 sm:p-2 text-white/20 hover:text-primary-500 transition-colors">
                                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders',  label: 'Orders',  icon: Activity },
    { id: 'wishlist',label: 'Wishlist', icon: Heart },
];

const UserProfilePage = () => {
    const { userInfo, logout, updateProfile } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const queryTab = new URLSearchParams(location.search).get('tab') || 'profile';
    const [activeTab, setActiveTab] = useState(queryTab);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        document.title = 'MY ACCOUNT | COMPUTERS';
        if (!userInfo) { navigate('/login'); return; }
        fetchMyOrders();
    }, [userInfo]);

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab') || 'profile';
        setActiveTab(tab);
    }, [location.search]);

    const fetchMyOrders = async () => {
        try {
            const { data } = await api.get('/api/orders/myorders', { withCredentials: true });
            setOrders(data);
        } catch { toast.error('FAILED TO FETCH ORDERS'); }
        finally { setOrdersLoading(false); }
    };

    const handleCancelOrder = async (orderId) => {
        toast.error('Orders cannot be cancelled at this stage.');
    };

    const handleLogout = async () => { await logout(); navigate('/'); toast.success('LOGGED OUT'); };

    if (!userInfo) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-200 pb-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                
                {/* Header Profile Info */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-10 sm:mb-20 border-b border-white/5 pb-10 sm:pb-16">
                    <div className="flex items-center gap-6 sm:gap-10">
                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900 border border-primary-500 flex items-center justify-center overflow-hidden text-primary-500 font-black text-2xl sm:text-4xl shadow-[0_0_50px_rgba(68,214,44,0.1)]">
                                {userInfo.avatar
                                    ? <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    : userInfo.name.charAt(0).toUpperCase()}
                            </div>
                            <button className="absolute bottom-[-5px] right-[-5px] w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-zinc-950 rounded-lg sm:rounded-xl flex items-center justify-center border-2 sm:border-4 border-zinc-950 hover:bg-white transition-colors">
                                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(68,214,44,0.5)]"></span>
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-primary-500">Authorized Operator</span>
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-black text-white italic tracking-tighter uppercase mb-1 sm:mb-2">{userInfo.name}</h1>
                            <p className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-widest">{userInfo.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="h-12 sm:h-14 px-6 sm:px-8 bg-zinc-900 border border-white/5 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center gap-3 sm:gap-4">
                        Logout <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Navigation Sidebar */}
                    <nav className="lg:col-span-3 space-y-4">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] px-4 mb-6 italic">Account Settings</p>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); navigate(`/profile?tab=${tab.id}`, { replace: true }); }}
                                    className={`w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all rounded-3xl group ${
                                        isActive
                                            ? 'bg-primary-500 text-zinc-950 shadow-[0_20px_40px_rgba(68,214,44,0.15)]'
                                            : 'text-slate-500 bg-zinc-900/30 border border-white/5 hover:border-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-primary-500/50 group-hover:text-primary-500'}`} /> 
                                    {tab.label}
                                    {tab.id === 'orders' && orders.length > 0 && (
                                        <span className={`ml-auto px-2 py-1 rounded-lg text-[8px] font-black ${isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-800 text-slate-400'}`}>{orders.length}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Content Area */}
                    <div className="lg:col-span-9 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeTab === 'profile'  && <ProfileTab userInfo={userInfo} updateProfile={updateProfile} />}
                                {activeTab === 'orders'   && <OrdersTab orders={orders} loading={ordersLoading} onCancel={handleCancelOrder} />}
                                {activeTab === 'wishlist' && <WishlistTab userInfo={userInfo} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;

