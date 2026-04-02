import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const order = await Order.findById(id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: body.id,
                status: body.status,
                update_time: body.update_time,
                email_address: body.payer ? body.payer.email_address : ''
            };

            const updatedOrder = await order.save();
            return NextResponse.json(updatedOrder);
        } else {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
