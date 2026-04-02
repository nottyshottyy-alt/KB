'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Plus, Trash2, Edit, Grid, Database, Layers, CheckCircle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    
    // Subcat state
    const [subName, setSubName] = useState('');
    const [selectedCatForSub, setSelectedCatForSub] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        document.title = "CATEGORY MANAGEMENT | COMPUTERS ADMIN";
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const fetchSubCategories = async (catId) => {
        if (!catId) return;
        try {
            const { data } = await api.get(`/api/subcategories/${catId}`);
            setSubCategories(data || []);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/api/categories', { name, description: desc });
            toast.success('Category created successfully');
            setName('');
            setDesc('');
            fetchCategories();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubCategory = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/api/subcategories', { name: subName, category: selectedCatForSub });
            toast.success('Sub-category created successfully');
            setSubName('');
            fetchSubCategories(selectedCatForSub);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create sub-category');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if(window.confirm('Are you sure you want to delete this category and all its sub-categories?')) {
            try {
                await api.delete(`/api/categories/${id}`);
                toast.success('Category deleted successfully');
                fetchCategories();
                setSubCategories([]);
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete category');
            }
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Grid className="w-4 h-4 text-primary-600" />
                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.4em]">Category Organization</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-950 italic tracking-tighter uppercase leading-none">Catalog <span className="text-primary-600">Management</span></h1>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`group flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        showAddForm 
                            ? 'bg-white text-slate-400 border border-slate-200 hover:text-zinc-950' 
                            : 'bg-primary-500 text-zinc-950 shadow-[0_20px_40px_rgba(68,214,44,0.15)] hover:bg-zinc-950 hover:text-white'
                    }`}
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAddForm ? 'Cancel' : 'Add New Category'}
                </button>
            </div>

            {showAddForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create Category */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden"
                    >
                        <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter mb-10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-primary-600" />
                            </div>
                            Create Category
                        </h2>
                        <form onSubmit={handleCreateCategory} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Category Name</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter category name" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none placeholder-slate-300" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Description</label>
                                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows="3" placeholder="Enter category description..." className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-[2rem] focus:border-primary-500 transition-all focus:outline-none placeholder-slate-300 resize-none"></textarea>
                            </div>
                            <button type="submit" disabled={loading} className="w-full group flex items-center justify-center gap-4 bg-primary-500 text-zinc-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Create Category
                            </button>
                        </form>
                    </motion.div>

                    {/* Create Subcategory */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden"
                    >
                        <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter mb-10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-primary-600" />
                            </div>
                            Add Sub-Category
                        </h2>
                        <form onSubmit={handleCreateSubCategory} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Parent Sector Mapping</label>
                                <select required value={selectedCatForSub} onChange={(e) => {
                                    setSelectedCatForSub(e.target.value);
                                    fetchSubCategories(e.target.value);
                                }} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-2xl focus:border-primary-500 transition-all focus:outline-none appearance-none cursor-pointer">
                                    <option value="" className="bg-white">SELECT PARENT CATEGORY</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id} className="bg-white text-zinc-950">{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Sub-Category Name</label>
                                <input type="text" required value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Enter sub-category name" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none placeholder-slate-300" />
                            </div>
                            <button type="submit" disabled={loading || !selectedCatForSub} className="w-full group flex items-center justify-center gap-4 bg-primary-500 text-zinc-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Create Sub-Category
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* List Categories */}
            <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-8 md:p-10 border-b border-slate-100">
                    <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter">Category <span className="text-primary-600">List</span></h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">View and manage your product categories</p>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                <th className="py-6 px-10">Category Name</th>
                                <th className="py-6 px-10">URL Slug</th>
                                <th className="py-6 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 shadow-sm">
                                                <Database className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-black text-zinc-950 uppercase italic tracking-tight">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{cat.slug}</span>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity duration-300">
                                            <button onClick={() => handleDeleteCategory(cat._id)} title="Delete Category" className="w-10 h-10 cursor-pointer rounded-xl flex items-center justify-center bg-white border border-slate-200 text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-20">
                                        <Database className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">No categories found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageCategories;
