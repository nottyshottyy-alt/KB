'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api/axios';
import { Plus, Trash2, Edit, Image as ImageIcon, Ban, CheckCircle, Package, ArrowRight, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Toggle state
    const [showAddForm, setShowAddForm] = useState(false);
    const [editProductId, setEditProductId] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');

    useEffect(() => {
        document.title = "PRODUCT MANAGEMENT | COMPUTERS ADMIN";
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/api/products?pageNumber=1&keyword=');
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
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

    const uploadFileHandler = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const { data } = await api.post('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImage(data.image);
            toast.success('Asset uploaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Asset upload failed');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setEditProductId(null);
        setTitle('');
        setDescription('');
        setPrice(0);
        setDiscountPrice(0);
        setImage('');
        setCategory('');
        setSubCategory('');
        setShowAddForm(false);
    };

    const handleEditProduct = (prod) => {
        setEditProductId(prod._id);
        setTitle(prod.title || '');
        setDescription(prod.description || '');
        setPrice(prod.price || 0);
        setDiscountPrice(prod.discountPrice || 0);
        setImage(prod.images?.[0] || '');

        const catId = prod.category?._id || prod.category || '';
        setCategory(catId);
        if (catId) fetchSubCategories(catId);

        setSubCategory(prod.subCategory?._id || prod.subCategory || '');
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            if (!image) {
                toast.error('Identification visual required (Image)');
                return;
            }
            setLoading(true);

            const productData = {
                title,
                description,
                price: Number(price),
                discountPrice: Number(discountPrice),
                images: image ? [image] : [],
                category,
                subCategory: subCategory || undefined,
                stock: 999 // Default to instock as requested
            };

            if (editProductId) {
                await api.put(`/api/products/${editProductId}`, productData);
                toast.success('Product updated successfully');
            } else {
                await api.post('/api/products', productData);
                toast.success('Product created successfully');
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Operational failure');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/api/products/${id}`);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete product');
            }
        }
    };

    const handleToggleStock = async (prod) => {
        try {
            const newStock = prod.stock > 0 ? 0 : 999; 
            const productData = {
                ...prod,
                stock: newStock,
                category: prod.category?._id || prod.category,
                subCategory: prod.subCategory?._id || prod.subCategory
            };
            await api.put(`/api/products/${prod._id}`, productData);
            toast.success(`Stock status set to: ${newStock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}`);
            fetchProducts();
        } catch (error) {
            console.error('Error toggling stock:', error);
            toast.error('Failed to update stock status');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary-600" />
                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.4em]">Store Inventory</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-950 italic tracking-tighter uppercase leading-none">Product <span className="text-primary-600">Management</span></h1>
                </div>
                <button
                    onClick={() => {
                        if (showAddForm) resetForm();
                        else setShowAddForm(true);
                    }}
                    className={`group flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        showAddForm 
                            ? 'bg-white text-slate-400 border border-slate-200 hover:text-zinc-950' 
                            : 'bg-primary-500 text-zinc-950 shadow-[0_20px_40px_rgba(68,214,44,0.15)] hover:bg-zinc-950 hover:text-white'
                    }`}
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAddForm ? 'Cancel' : 'Add New Product'}
                </button>
            </div>

            {/* Form Section */}
            {showAddForm && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Package className="w-32 h-32 text-zinc-950" />
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter mb-10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary-600" />
                        </div>
                        {editProductId ? 'Edit Product' : 'Add New Product'}
                    </h2>

                    <form onSubmit={handleCreateProduct} className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Product Name</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product name" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none placeholder-slate-300" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Asset Visualization</label>
                                <div className="flex items-center gap-4 h-14">
                                    <label className="flex-1 cursor-pointer bg-slate-50 border border-slate-200 px-6 h-full rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-zinc-950 hover:border-primary-500/30 transition-all">
                                        <ImageIcon className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{uploading ? 'Processing...' : image ? 'Image Set' : 'Choose Image'}</span>
                                        <input type="file" onChange={uploadFileHandler} className="hidden" accept="image/*" />
                                    </label>
                                    {image && (
                                        <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 p-1 flex-shrink-0">
                                            <img src={image} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Market Value (PKR)</label>
                                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none " />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Operational Discount (PKR)</label>
                                <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="0.00" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-primary-600 text-sm font-bold rounded-2xl focus:border-primary-500 transition-all focus:outline-none " />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Sector (Category)</label>
                                <select required value={category} onChange={(e) => {
                                    setCategory(e.target.value);
                                    fetchSubCategories(e.target.value);
                                }} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-2xl focus:border-primary-500 transition-all focus:outline-none appearance-none cursor-pointer">
                                    <option value="" className="bg-white">SELECT CATEGORY</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id} className="bg-white text-zinc-950">{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Product Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Enter product description..." className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-zinc-950 text-sm font-bold rounded-[2rem] focus:border-primary-500 transition-all focus:outline-none placeholder-slate-300 resize-none"></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-6 border-t border-slate-100 pt-8">
                            <button type="button" onClick={resetForm} className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-zinc-950 transition-all">Cancel</button>
                            <button type="submit" disabled={loading || uploading} className="group flex items-center gap-4 bg-primary-500 text-zinc-950 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {editProductId ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Catalog List */}
            <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-zinc-950 italic uppercase tracking-tighter">Product <span className="text-primary-600">List</span></h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Products: {products.length}</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                <th className="py-6 px-10">Image</th>
                                <th className="py-6 px-10">Product Name</th>
                                <th className="py-6 px-10">Price</th>
                                <th className="py-6 px-10">Category</th>
                                <th className="py-6 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(prod => (
                                <tr key={prod._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                    <td className="py-6 px-10">
                                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-2 group-hover:border-primary-500/20 transition-all overflow-hidden relative shadow-sm">
                                            {prod.images?.[0] ? (
                                                <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-contain mix-blend-multiply scale-110 group-hover:scale-125 transition-transform duration-500" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-slate-200" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-zinc-950 uppercase italic tracking-tight mb-1">{prod.title}</p>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${prod.stock > 0 ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                    {prod.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                                </span>
                                                {prod.discountPrice > 0 && <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-md">Discount Active</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-zinc-950 italic tracking-tighter">PKR {prod.price.toLocaleString()}</span>
                                            {prod.discountPrice > 0 && <span className="text-[9px] font-black text-primary-600/50 line-through">PKR {prod.discountPrice.toLocaleString()}</span>}
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prod.category?.name || 'No Category'}</span>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                                            <button onClick={() => handleToggleStock(prod)} title="Toggle In-Stock Status" className={`w-10 h-10 cursor-pointer rounded-xl flex items-center justify-center transition-all bg-white border border-slate-200 shadow-sm ${prod.stock > 0 ? 'text-orange-500 hover:border-orange-500/50' : 'text-primary-600 hover:border-primary-500/50'}`}>
                                                {prod.stock > 0 ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => handleEditProduct(prod)} title="Edit Product" className="w-10 h-10 cursor-pointer rounded-xl flex items-center justify-center bg-white border border-slate-200 text-primary-600 shadow-sm hover:border-primary-500 transition-all">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(prod._id)} title="Delete Product" className="w-10 h-10 cursor-pointer rounded-xl flex items-center justify-center bg-white border border-slate-200 text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="py-32 text-center">
                        <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Your product list is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageProducts;
