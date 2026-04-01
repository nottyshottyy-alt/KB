import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Edit, Image as ImageIcon, Ban, CheckCircle } from 'lucide-react';

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
        document.title = "Manage Products - KB COMPUTERS Admin";
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/api/products?pageNumber=1&keyword=');
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubCategories = async (catId) => {
        if (!catId) return;
        try {
            const { data } = await api.get(`/api/subcategories/${catId}`);
            setSubCategories(data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const { data } = await api.post('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImage(data.image);
            setUploading(false);
        } catch (error) {
            console.error(error);
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
                toast.error('Please provide an image for the product.');
                return;
            }
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` }, withCredentials: true };

            const productData = {
                title,
                description,
                price: Number(price),
                discountPrice: Number(discountPrice),
                images: image ? [image] : [],
                category,
            };
            // Only include subCategory if user actually selected one
            if (subCategory) {
                productData.subCategory = subCategory;
            }

            if (editProductId) {
                await api.put(`/api/products/${editProductId}`, productData, config);
            } else {
                await api.post('/api/products', productData, config);
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                await api.delete(`/api/products/${id}`, { withCredentials: true });
                fetchProducts();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleToggleStock = async (prod) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` }, withCredentials: true };
            const newStock = prod.stock > 0 ? 0 : 999; 
            const productData = {
                title: prod.title,
                description: prod.description,
                price: prod.price,
                discountPrice: prod.discountPrice,
                stock: newStock,
                images: prod.images,
                category: prod.category?._id || prod.category,
                subCategory: prod.subCategory?._id || prod.subCategory
            };
            await api.put(`/api/products/${prod._id}`, productData, config);
            fetchProducts();
        } catch (error) {
            console.error('Error toggling stock:', error);
            alert(error.response?.data?.message || 'Error occurred updating stock');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
                    <p className="text-sm text-slate-500 mt-1">Add, edit, or delete products.</p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    Product Catalog Management
                </h2>
                <button
                    onClick={() => {
                        if (showAddForm) {
                            resetForm();
                        } else {
                            setShowAddForm(true);
                        }
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition shadow-sm"
                >
                    <Plus className={`w-5 h-5 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
                    {showAddForm ? 'Cancel' : 'Add New Product'}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        {editProductId ? 'Edit Product' : 'Create Product'}
                    </h2>
                    <form onSubmit={handleCreateProduct} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                    <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Discount Price</label>
                                    <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select required value={category} onChange={(e) => {
                                    setCategory(e.target.value);
                                    fetchSubCategories(e.target.value);
                                }} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                                    <option value="">-- Choose Category --</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
                                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                                    <option value="">-- Choose Subcat --</option>
                                    {subCategories.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-slate-100 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-200 transition flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Upload Image</span>
                                        <input type="file" onChange={uploadFileHandler} className="hidden" />
                                    </label>
                                    {uploading && <span className="text-sm text-primary-500">Uploading...</span>}
                                    {image && <span className="text-sm text-green-600">Image selected</span>}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition shadow-md disabled:bg-slate-400">
                                {loading ? (editProductId ? 'Updating...' : 'Creating...') : (editProductId ? 'Update Product' : 'Publish Product')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Catalog</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="py-3 px-4 font-medium">IMAGE</th>
                                <th className="py-3 px-4 font-medium">NAME</th>
                                <th className="py-3 px-4 font-medium">PRICE</th>
                                <th className="py-3 px-4 font-medium">CATEGORY</th>
                                <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(prod => (
                                <tr key={prod._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                    <td className="py-3 px-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {prod.images && prod.images.length > 0 ? (
                                                <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-900 font-medium">
                                        {prod.title}
                                        {prod.discountPrice > 0 && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Sale</span>}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">PKR {prod.price}</td>
                                    <td className="py-3 px-4 text-slate-600">{prod.category?.name || 'Uncategorized'}</td>
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleToggleStock(prod)} title={prod.stock > 0 ? 'Mark Out of Stock' : 'Mark In Stock'} className={`p-2 rounded-lg transition inline-flex items-center justify-center mr-2 ${prod.stock > 0 ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                                            {prod.stock > 0 ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => handleEditProduct(prod)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition inline-flex items-center justify-center">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(prod._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition ml-2 inline-flex items-center justify-center">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400">No products found. Start adding some!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageProducts;
