import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Edit } from 'lucide-react';

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
        document.title = "Manage Categories - KB COMPUTERS Admin";
        fetchCategories();
    }, []);

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

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // Wait auth uses cookies, so we just use credentials
            const axiosConfig = { withCredentials: true };
            await api.post('/api/categories', { name, description: desc }, axiosConfig);
            setName('');
            setDesc('');
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubCategory = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const axiosConfig = { withCredentials: true };
            await api.post('/api/subcategories', { name: subName, category: selectedCatForSub }, axiosConfig);
            setSubName('');
            fetchSubCategories(selectedCatForSub);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if(window.confirm('Are you sure?')) {
            try {
                await api.delete(`/api/categories/${id}`, { withCredentials: true });
                fetchCategories();
                setSubCategories([]);
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Manage Categories & Subcategories</h1>
                <p className="text-sm text-slate-500 mt-1">Organize your store catalog hierarchy.</p>
            </div>

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    Category Hierarchy
                </h2>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition shadow-sm"
                >
                    <Plus className={`w-5 h-5 transition-transform ${showAddForm ? 'rotate-45' : ''}`} /> 
                    {showAddForm ? 'Close Forms' : 'Add New'}
                </button>
            </div>

            {showAddForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                    {/* Create Category */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            Add New Category
                        </h2>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input 
                                type="text" 
                                required 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                value={desc} 
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                                rows="3"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition shadow-md disabled:bg-slate-400"
                        >
                            {loading ? 'Creating...' : 'Create Category'}
                        </button>
                    </form>
                </div>

                {/* Create Subcategory */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-orange-500" /> Add Subcategory
                    </h2>
                    <form onSubmit={handleCreateSubCategory} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Parent Category</label>
                            <select 
                                required 
                                value={selectedCatForSub} 
                                onChange={(e) => {
                                    setSelectedCatForSub(e.target.value);
                                    fetchSubCategories(e.target.value);
                                }}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                            >
                                <option value="">-- Choose Category --</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory Name</label>
                            <input 
                                type="text" 
                                required 
                                value={subName} 
                                onChange={(e) => setSubName(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !selectedCatForSub}
                            className="bg-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-700 transition shadow-md disabled:bg-slate-400"
                        >
                            {loading ? 'Creating...' : 'Create Subcategory'}
                        </button>
                    </form>
                </div>
            </div>
            )}

            {/* List Categories */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Existing Categories</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="py-3 px-4 font-medium">Name</th>
                                <th className="py-3 px-4 font-medium">Slug</th>
                                <th className="py-3 px-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                    <td className="py-3 px-4 text-slate-900 font-medium">{cat.name}</td>
                                    <td className="py-3 px-4 text-slate-500 text-sm">{cat.slug}</td>
                                    <td className="py-3 px-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteCategory(cat._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-6 text-slate-400">No categories found.</td>
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
