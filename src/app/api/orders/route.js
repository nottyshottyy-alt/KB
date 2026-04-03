import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Coupon from '@/lib/models/Coupon';
import CouponUsage from '@/lib/models/CouponUsage';
import sendEmail from '@/lib/utils/sendEmail';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET() {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }
        const orders = await Order.find({}).populate('user', 'id name');
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getAuthUser();
        const body = await req.json();
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            couponCode,
            customerName,
            customerEmail
        } = body;

        if (orderItems && orderItems.length === 0) {
            return NextResponse.json({ message: 'No order items' }, { status: 400 });
        }

        let discount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (appliedCoupon) {
                // 1. Expiry Check
                const isExpired = appliedCoupon.expiresAt < new Date();
                
                // 2. Global Limit Check
                const globalLimitReached = appliedCoupon.usageLimit > 0 && appliedCoupon.usedCount >= appliedCoupon.usageLimit;
                
                // 3. Per-User Limit Check
                let userLimitReached = false;
                if (user && appliedCoupon.userLimit > 0) {
                    const usage = await CouponUsage.findOne({ coupon: appliedCoupon._id, user: user._id });
                    if (usage && usage.count >= appliedCoupon.userLimit) {
                        userLimitReached = true;
                    }
                }
                
                if (!isExpired && !globalLimitReached && !userLimitReached) {
                    if (appliedCoupon.discountType === 'percentage') {
                        discount = (itemsPrice * appliedCoupon.discountValue) / 100;
                    } else {
                        discount = appliedCoupon.discountValue;
                    }
                }
            }
        }

        const shippingPrice = 0;
        const totalPrice = Math.max(itemsPrice - discount, 0);

        const orderData = {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            coupon: appliedCoupon ? appliedCoupon._id : undefined,
            discount: discount
        };

        if (user) {
            orderData.user = user._id;
        } else {
            orderData.guestName = customerName || shippingAddress.name || 'Guest';
            orderData.guestEmail = customerEmail || 'guest@example.com';
        }

        const order = new Order(orderData);
        const createdOrder = await order.save();

        // Increment Coupon Usage
        if (appliedCoupon) {
            // 1. Global Increment
            await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
            
            // 2. Per-User Increment (only if user is logged in)
            if (user) {
                await CouponUsage.findOneAndUpdate(
                    { coupon: appliedCoupon._id, user: user._id },
                    { $inc: { count: 1 } },
                    { upsert: true, new: true }
                );
            }
        }

        // Increment soldCount
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
            <p><strong>Customer Name:</strong> ${orderData.guestName || (user && user.name)}</p>
            <p><strong>Customer Email:</strong> ${orderData.guestEmail || (user && user.email)}</p>
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

        return NextResponse.json(createdOrder, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
