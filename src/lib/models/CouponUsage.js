import mongoose from 'mongoose';

const couponUsageSchema = new mongoose.Schema({
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    count: { type: Number, default: 1 }
}, { timestamps: true });

// Ensure a unique record for each user/coupon pair
couponUsageSchema.index({ coupon: 1, user: 1 }, { unique: true });

const CouponUsage = mongoose.models.CouponUsage || mongoose.model('CouponUsage', couponUsageSchema);
export default CouponUsage;
