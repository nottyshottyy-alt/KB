const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
    try {
        // Basic counts
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments({ isActive: true });
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
        const Product = require('../models/Product');
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

        // Recent 5 orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        res.json({
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
        next(error);
    }
};

module.exports = { getAdminStats };
