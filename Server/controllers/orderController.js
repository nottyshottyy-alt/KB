const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            customerName,
            customerEmail
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        } else {
            const shippingPrice = 0;
            const totalPrice = itemsPrice;

            const orderData = {
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
            };

            // If the user is authenticated, link to their account
            if (req.user) {
                orderData.user = req.user._id;
            } else {
                // Otherwise, it's a guest checkout
                orderData.guestName = customerName || shippingAddress.name || 'Guest';
                orderData.guestEmail = customerEmail || 'guest@example.com';
            }

            const order = new Order(orderData);
            const createdOrder = await order.save();

            // Increment soldCount for each product ordered
            const Product = require('../models/Product');
            await Promise.all(
                orderItems.map(item =>
                    Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.qty } })
                )
            );

            // Send Email to Admin
            const productNames = orderItems.map(item => item.name).join(', ');
            const emailSubject = `New Order Placed: ${productNames}`;
            
            const emailHtml = `
                <h1>New Order Received</h1>
                <p><strong>Order ID:</strong> ${createdOrder._id}</p>
                <p><strong>Customer Name:</strong> ${orderData.guestName || (req.user && req.user.name)}</p>
                <p><strong>Customer Email:</strong> ${orderData.guestEmail || (req.user && req.user.email)}</p>
                <p><strong>Phone:</strong> ${shippingAddress.phone}</p>
                <p><strong>Address:</strong> ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p><strong>Total Price:</strong> PKR ${totalPrice.toLocaleString()}</p>
                <h3>Products:</h3>
                <ul>
                    ${orderItems.map(item => `<li>${item.name} (x${item.qty}) - PKR ${item.price.toLocaleString()}</li>`).join('')}
                </ul>
            `;

            try {
                await sendEmail({
                    email: process.env.ADMIN_EMAIL,
                    subject: emailSubject,
                    html: emailHtml
                });
            } catch (emailError) {
                console.error('Failed to send admin email:', emailError);
            }

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        console.error('Order creation failed:', error);
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.payer ? req.body.payer.email_address : ''
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders
};
