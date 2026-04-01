const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
} = require('../controllers/orderController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
    .post(optionalAuth, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(optionalAuth, getOrderById);

router.route('/:id/pay').put(optionalAuth, updateOrderToPaid);

module.exports = router;
