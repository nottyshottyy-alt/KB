import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { protect, admin } from '@/lib/middleware/authMiddleware';

export async function GET(req) {
    try {
        await connectDB();
        
        // Auth check
        const authResponse = await protect(req);
        if (authResponse instanceof NextResponse) return authResponse;
        
        const adminResponse = await admin(req);
        if (adminResponse instanceof NextResponse) return adminResponse;

        // Basic counts
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments({ isAdmin: false });

        // Total revenue from all orders
        const revenueResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Monthly revenue for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRevenue = await Order.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format monthly revenue data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthly = monthlyRevenue.map(m => ({
            month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
            revenue: Math.round(m.revenue * 100) / 100,
            orders: m.orders
        }));

        // Payment summary
        const paidOrders = await Order.countDocuments({ isPaid: true });
        const unpaidOrders = totalOrders - paidOrders;
        const ordersByPayment = [
            { _id: 'Paid', count: paidOrders },
            { _id: 'Unpaid', count: unpaidOrders }
        ];

        // Top 5 products by popularity/soldCount
        const topProductsDocs = await Product.find({})
            .sort({ soldCount: -1, price: -1 })
            .limit(5);
        
        const topProducts = topProductsDocs.map(p => ({
            _id: p._id,
            name: p.title,
            image: p.images && p.images.length > 0 ? p.images[0] : '',
            totalRevenue: p.soldCount * (p.discountPrice > 0 ? p.discountPrice : p.price),
            totalSold: p.soldCount
        }));

        // Recent 8 orders (changed from 5 as per UI design)
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('user', 'name email');

        return NextResponse.json({
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalOrders,
            totalProducts,
            totalUsers,
            monthlyRevenue: formattedMonthly,
            ordersByStatus: ordersByPayment,
            topProducts,
            recentOrders
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ message: 'Server error retrieving operational metrics' }, { status: 500 });
    }
}
