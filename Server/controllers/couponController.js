const Coupon = require('../models/Coupon');

// @desc    Apply / validate a coupon code
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) { res.status(404); throw new Error('No coupon found'); }
        if (coupon.expiresAt < new Date()) { res.status(400); throw new Error('No coupon found'); }
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            res.status(400); throw new Error('No coupon found');
        }
        if (orderAmount < coupon.minOrderAmount) {
            res.status(400); throw new Error(`Minimum order amount for this coupon is PKR ${coupon.minOrderAmount}`);
        }

        const discount = coupon.discountType === 'percentage'
            ? (orderAmount * coupon.discountValue) / 100
            : coupon.discountValue;

        res.json({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount: Math.min(discount, orderAmount), // can't exceed order amount
            message: `Coupon applied! You save PKR ${Math.round(Math.min(discount, orderAmount)).toLocaleString()}.`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
    try {
        const coupon = new Coupon(req.body);
        const created = await coupon.save();
        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
        res.json(coupon);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { applyCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
