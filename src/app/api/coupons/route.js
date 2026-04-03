import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET() {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }
        const body = await req.json();
        
        // Expiry precision
        if (body.isActive && body.expiresAt) {
            const expiry = new Date(body.expiresAt);
            if (expiry < new Date()) {
                return NextResponse.json({ message: 'Cannot activate an expired coupon. Please extend the expiry date.' }, { status: 400 });
            }
        }

        const coupon = new Coupon(body);
        const created = await coupon.save();
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
