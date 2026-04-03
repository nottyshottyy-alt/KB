import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

import CouponUsage from '@/lib/models/CouponUsage';

export async function POST(req) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ message: 'Please log in or register to use coupons' }, { status: 401 });

        const { code, orderAmount, cartItems } = await req.json();
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) return NextResponse.json({ message: 'No coupon found' }, { status: 404 });

        // 1. Expiry Check (Minute-precise)
        if (coupon.expiresAt < new Date()) {
            return NextResponse.json({ message: 'Coupon has expired' }, { status: 400 });
        }

        // 2. Global Usage Limit Check
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ message: 'YOU HAVE ALREADY USED THIS DISCOUNT' }, { status: 400 });
        }

        // 3. Per-User Usage Limit Check
        if (coupon.userLimit > 0) {
            const usage = await CouponUsage.findOne({ coupon: coupon._id, user: user._id });
            if (usage && usage.count >= coupon.userLimit) {
                return NextResponse.json({ message: 'YOU HAVE ALREADY USED THIS DISCOUNT' }, { status: 400 });
            }
        }

        if (orderAmount < coupon.minOrderAmount) {
            return NextResponse.json({ message: `minimum ${coupon.minOrderAmount}Rs shopping required for this coupon` }, { status: 400 });
        }

        let discountableAmount = orderAmount;
        let isApplicable = true;

        if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
            if (!cartItems || cartItems.length === 0) {
                return NextResponse.json({ message: 'Cart items required for this coupon' }, { status: 400 });
            }

            const productIds = cartItems.map(item => item.product);
            const products = await Product.find({ _id: { $in: productIds } });

            const applicableCategoryIds = coupon.applicableCategories.map(id => id.toString());

            const eligibleItems = cartItems.filter(item => {
                const product = products.find(p => p._id.toString() === item.product.toString());
                return product && applicableCategoryIds.includes(product.category.toString());
            });

            if (eligibleItems.length === 0) {
                return NextResponse.json({ message: 'This coupon is not applicable to any items in your cart' }, { status: 400 });
            }

            discountableAmount = eligibleItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        }

        const discount = coupon.discountType === 'percentage'
            ? (discountableAmount * coupon.discountValue) / 100
            : Math.min(coupon.discountValue, discountableAmount);

        return NextResponse.json({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount: Math.min(discount, orderAmount),
            message: `Coupon applied! You save PKR ${Math.round(Math.min(discount, orderAmount)).toLocaleString()}.`
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
