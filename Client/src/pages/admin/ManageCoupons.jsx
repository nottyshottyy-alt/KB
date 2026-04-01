import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Tag, Plus, Pencil, Trash2, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', expiresAt: '', usageLimit: '', isActive: true };

const ManageCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        document.title = 'Manage Coupons - KB COMPUTERS Admin';
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/api/coupons', { withCredentials: true });
            setCoupons(data);
        } catch { toast.error('Failed to load coupons'); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (c) => {
        setEditing(c._id);
        setForm({
            code: c.code, discountType: c.discountType, discountValue: c.discountValue,
            minOrderAmount: c.minOrderAmount || '', expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
            usageLimit: c.usageLimit || '', isActive: c.isActive
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.code || !form.discountValue || !form.expiresAt) { toast.error('Fill in all required fields'); return; }
        setSaving(true);
        try {
            const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) || 0, usageLimit: Number(form.usageLimit) || 0 };
            if (editing) {
                const { data } = await axios.put(`/api/coupons/${editing}`, payload, { withCredentials: true });
                setCoupons(prev => prev.map(c => c._id === editing ? data : c));
                toast.success('Coupon updated');
            } else {
                const { data } = await api.post('/api/coupons', payload, { withCredentials: true });
                setCoupons(prev => [data, ...prev]);
                toast.success('Coupon created');
            }
            setShowModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save coupon'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await api.delete(`/api/coupons/${id}`, { withCredentials: true });
            setCoupons(prev => prev.filter(c => c._id !== id));
            toast.success('Coupon deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Coupons</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage discount codes.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition shadow-md shadow-primary-500/20">
                    <Plus className="w-4 h-4" /> New Coupon
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading...</div>
                ) : coupons.length === 0 ? (
                    <div className="p-12 text-center">
                        <Tag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">No coupons yet. Create one!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    {['Code', 'Discount', 'Min. Order', 'Usage', 'Expires', 'Status', ''].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {coupons.map(c => (
                                    <tr key={c._id} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.code}</td>
                                        <td className="px-4 py-3 font-semibold text-primary-600">
                                            {c.discountType === 'percentage' ? `${c.discountValue}%` : `PKR ${c.discountValue.toLocaleString()}`}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">PKR {(c.minOrderAmount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-slate-600">{c.usedCount}/{c.usageLimit === 0 ? '∞' : c.usageLimit}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium ${isExpired(c.expiresAt) ? 'text-red-500' : 'text-slate-600'}`}>
                                                {new Date(c.expiresAt).toLocaleDateString()}
                                                {isExpired(c.expiresAt) && ' (expired)'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${c.isActive && !isExpired(c.expiresAt) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {c.isActive && !isExpired(c.expiresAt) ? <><CheckCircle className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Inactive</>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Code *</label>
                                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SAVE20" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Type *</label>
                                <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed (PKR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Value *</label>
                                <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                                    placeholder="20" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Min. Order (PKR)</label>
                                <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                                    placeholder="0" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Usage Limit (0=∞)</label>
                                <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                                    placeholder="0" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Expiry Date *</label>
                                <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                            </div>
                            <div className="col-span-2 flex items-center gap-3">
                                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 text-primary-600 rounded" />
                                <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">Active</label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editing ? 'Save Changes' : 'Create Coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCoupons;
