import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        // Expiry precision
        if (body.isActive && body.expiresAt) {
            const expiry = new Date(body.expiresAt);
            if (expiry < new Date()) {
                return NextResponse.json({ message: 'Cannot activate an expired coupon. Please extend the expiry date.' }, { status: 400 });
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
        return NextResponse.json(coupon);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

        const { id } = await params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
        return NextResponse.json({ message: 'Coupon deleted' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
