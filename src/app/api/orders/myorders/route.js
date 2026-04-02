import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET() {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

        const orders = await Order.find({ user: user._id });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
