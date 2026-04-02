import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
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
            customerName,
            customerEmail
        } = body;

        if (orderItems && orderItems.length === 0) {
            return NextResponse.json({ message: 'No order items' }, { status: 400 });
        }

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

        if (user) {
            orderData.user = user._id;
        } else {
            orderData.guestName = customerName || shippingAddress.name || 'Guest';
            orderData.guestEmail = customerEmail || 'guest@example.com';
        }

        const order = new Order(orderData);
        const createdOrder = await order.save();

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
