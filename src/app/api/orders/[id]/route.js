import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findById(id).populate('user', 'name email');

        if (order) {
            return NextResponse.json(order);
        } else {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
