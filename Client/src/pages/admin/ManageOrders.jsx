import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Eye, CheckCircle } from 'lucide-react';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        document.title = "Manage Orders - KB COMPUTERS Admin";
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await api.get('/api/orders', {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true
            });
            // Sort explicitly by newest first just in case backend isn't doing it
            const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        // Feature disabled
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
                <p className="text-sm text-slate-500 mt-1">View and process customer orders.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="py-3 px-4 font-medium">ORDER ID</th>
                                <th className="py-3 px-4 font-medium">USER</th>
                                <th className="py-3 px-4 font-medium">DATE</th>
                                <th className="py-3 px-4 font-medium">TOTAL</th>
                                <th className="py-3 px-4 font-medium">PAID</th>
                                <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                    <td className="py-3 px-4 text-slate-900 text-sm">{order._id.substring(0, 8)}...</td>
                                    <td className="py-3 px-4 text-slate-900 font-medium">
                                        {order.user && order.user.name}
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                        PKR {order.totalPrice.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        {order.isPaid ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Paid</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Not Paid</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition" title="View Details">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-400">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageOrders;
