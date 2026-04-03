'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Tag, Plus, Pencil, Trash2, X, Loader2, CheckCircle, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const EMPTY_FORM = { code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', expiresAt: '', usageLimit: '', userLimit: 1, isActive: true, applicableCategories: [] };

const ManageCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM, userLimit: 1 });
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    // Watch for expiry date changes to enforce isActive constraint
    useEffect(() => {
        if (form.expiresAt) {
            const expiry = new Date(form.expiresAt);
            if (expiry < new Date() && form.isActive) {
                setForm(f => ({ ...f, isActive: false }));
            }
        }
    }, [form.expiresAt, form.isActive]);

    useEffect(() => {
        document.title = 'DISCOUNTS & COUPONS | COMPUTERS ADMIN';
        fetchCoupons();
        fetchCategories();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/api/coupons');
            setCoupons(data || []);
        } catch (error) { 
            console.error(error);
            toast.error('Failed to load coupons'); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data || []);
        } catch (error) { 
            console.error(error); 
        }
    };

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (c) => {
        setEditing(c._id);
        setForm({
            code: c.code, 
            discountType: c.discountType, 
            discountValue: c.discountValue,
            minOrderAmount: c.minOrderAmount || '', 
            expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : '',
            usageLimit: c.usageLimit || '', 
            userLimit: c.userLimit ?? 1,
            isActive: c.isActive,
            applicableCategories: c.applicableCategories || []
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.code || !form.discountValue || !form.expiresAt) { 
            toast.error('Please fill in all required fields'); 
            return; 
        }
        setSaving(true);
        try {
            const payload = { 
                ...form, 
                discountValue: Number(form.discountValue), 
                minOrderAmount: Number(form.minOrderAmount) || 0, 
                usageLimit: form.usageLimit === '' ? 0 : Number(form.usageLimit),
                userLimit: form.userLimit === '' ? 0 : Number(form.userLimit),
                expiresAt: new Date(form.expiresAt).toISOString()
            };
            if (editing) {
                const { data } = await api.put(`/api/coupons/${editing}`, payload);
                setCoupons(prev => prev.map(c => c._id === editing ? data : c));
                toast.success('Coupon updated successfully');
            } else {
                const { data } = await api.post('/api/coupons', payload);
                setCoupons(prev => [data, ...prev]);
                toast.success('Coupon created successfully');
            }
            setShowModal(false);
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Failed to save coupon'); 
        } finally { 
            setSaving(false); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await api.delete(`/api/coupons/${id}`);
            setCoupons(prev => prev.filter(c => c._id !== id));
            toast.success('Coupon deleted successfully');
        } catch (error) { 
            console.error(error);
            toast.error('Failed to delete coupon'); 
        }
    };

    const isExpired = (date) => {
        const expiry = new Date(date);
        return expiry < new Date();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-primary-600" />
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Promotions</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-950 tracking-tight uppercase leading-none">Coupon <span className="text-primary-600">Management</span></h1>
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-3">Manage your store's promotional offers</p>
                </div>
                <button
                    onClick={openCreate}
                    className="group cursor-pointer flex items-center gap-3 bg-primary-500 text-zinc-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add New Coupon
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-zinc-950 tracking-tight uppercase">Active <span className="text-primary-600">Offers</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Coupons: {coupons.length}</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                <th className="py-6 px-10">Coupon Code</th>
                                <th className="py-6 px-10">Discount</th>
                                <th className="py-6 px-10">Min Order</th>
                                <th className="py-6 px-10">Limits (Global / P.A)</th>
                                <th className="py-6 px-10">Expires On</th>
                                <th className="py-6 px-10">Status</th>
                                <th className="py-6 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(c => (
                                <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 font-mono font-bold text-xs shadow-sm">
                                                ID
                                            </div>
                                            <span className="text-sm font-bold text-zinc-950 tracking-wider uppercase font-mono">{c.code}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className="text-sm font-bold text-primary-600 tracking-tight">
                                            {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `PKR ${c.discountValue.toLocaleString()} Off`}
                                        </span>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className="text-[10px] font-black text-zinc-950 tracking-widest font-mono">PKR {(c.minOrderAmount || 0).toLocaleString()}</span>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-zinc-950">{c.usedCount} / {c.usageLimit === 0 ? '∞' : c.usageLimit}</span>
                                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Global Uses</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className={`text-[10px] font-bold uppercase tracking-tight ${isExpired(c.expiresAt) ? 'text-red-500' : 'text-slate-400'}`}>
                                            {new Date(c.expiresAt).toLocaleDateString('en-PK')}
                                            {isExpired(c.expiresAt) && <span className="block text-[7px] font-bold text-red-600 tracking-wider mt-0.5">EXPIRED</span>}
                                        </span>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-2">
                                            {c.isActive && !isExpired(c.expiresAt) ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-[8px] font-bold text-primary-600 uppercase tracking-wider">
                                                    <CheckCircle className="w-2.5 h-2.5 fill-current" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <XCircle className="w-2.5 h-2.5 fill-current" /> Inactive
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity duration-300">
                                            <button onClick={() => openEdit(c)} className="w-10 h-10 cursor-pointer rounded-xl flex items-center justify-center bg-white border border-slate-200 text-primary-600 shadow-sm hover:border-primary-500 transition-all group/btn">
                                                <Pencil className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                            <button onClick={() => handleDelete(c._id)} className="w-10 h-10 cursor-pointer rounded-xl flex items-center justify-center bg-white border border-slate-200 text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all group/btn">
                                                <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && coupons.length === 0 && (
                    <div className="py-32 text-center border-t border-slate-100">
                        <Tag className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">No coupons found</p>
                    </div>
                )}
                
                {loading && (
                    <div className="py-32 text-center border-t border-slate-100">
                        <div className="w-12 h-12 border-4 border-primary-500/10 border-t-primary-500 rounded-full mx-auto mb-6 animate-spin"></div>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">Loading coupons...</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" 
                        onClick={() => setShowModal(false)} 
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white border border-slate-200 rounded-[3rem] shadow-2xl w-full max-w-xl p-8 md:p-12 flex flex-col max-h-[90vh]"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <ShieldCheck className="w-40 h-40 text-zinc-950" />
                        </div>

                        <div className="flex items-center justify-between relative z-10 mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-zinc-950 italic uppercase tracking-tighter">
                                    {editing ? 'Edit' : 'Add New'} <span className="text-primary-600">Coupon</span>
                                </h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Set up your coupon details</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 cursor-pointer flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-zinc-950 transition-all shadow-sm"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6 relative z-10 pb-8">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Coupon Code (Required)</label>
                                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                        placeholder="e.g. SUMMER20" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-black italic tracking-widest rounded-2xl focus:border-primary-500 transition-all focus:outline-none placeholder-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Discount Type</label>
                                    <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-2xl focus:border-primary-500 transition-all focus:outline-none appearance-none cursor-pointer">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed (PKR)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Discount Amount</label>
                                    <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                                        placeholder="0" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none " />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Minimum Order (PKR)</label>
                                    <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                                        placeholder="0" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none " />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Global Limit (0 = Unlimited)</label>
                                    <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                                        placeholder="0" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none " />
                                </div>
                                <div className="col-span-2 space-y-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Restrict to Categories (Optional)</label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px]">
                                        {categories.map(cat => (
                                            <button
                                                key={cat._id}
                                                type="button"
                                                onClick={() => {
                                                    const exists = form.applicableCategories.includes(cat._id);
                                                    setForm(f => ({
                                                        ...f,
                                                        applicableCategories: exists 
                                                            ? f.applicableCategories.filter(id => id !== cat._id)
                                                            : [...f.applicableCategories, cat._id]
                                                    }));
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                                                    form.applicableCategories.includes(cat._id)
                                                        ? 'bg-primary-500 border-primary-500 text-zinc-950'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-primary-500 hover:text-primary-600'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                        {categories.length === 0 && <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">No categories available</span>}
                                    </div>
                                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest px-2">* Leave unselected for store-wide applicability</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Expiry Date & Time</label>
                                    <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-2xl focus:border-primary-500 transition-all focus:outline-none cursor-pointer" />
                                </div>
                                {(() => {
                                    const isFormExpired = form.expiresAt ? new Date(form.expiresAt) < new Date() : false;
                                    
                                    return (
                                        <div className={`col-span-2 flex items-center gap-4 p-4 rounded-2xl border transition-colors ${isFormExpired ? 'bg-red-50 border-red-100 opacity-80' : 'bg-slate-50 border-slate-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                id="isActive" 
                                                disabled={isFormExpired}
                                                checked={form.isActive} 
                                                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} 
                                                className="w-5 h-5 accent-primary-500 cursor-pointer disabled:cursor-not-allowed" 
                                            />
                                            <label htmlFor="isActive" className={`text-[10px] font-black uppercase tracking-widest italic cursor-pointer ${isFormExpired ? 'text-red-400' : 'text-zinc-950'}`}>
                                                {isFormExpired ? 'Coupon Locked: Expired' : 'Coupon Status: Active'}
                                            </label>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 relative z-10 transition-all">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-zinc-950 transition-all cursor-pointer">Cancel</button>
                            <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-4 px-6 bg-primary-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer">
                                {saving ? <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div> : <ShieldCheck className="w-4 h-4" />} {editing ? 'Save Changes' : 'Create Coupon'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageCoupons;
