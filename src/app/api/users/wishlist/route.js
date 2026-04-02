import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET() {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

        if (user._id === '000000000000000000000000') {
            return NextResponse.json([]);
        }

        const dbUser = await User.findById(user._id).populate({
            path: 'wishlist',
            select: 'title price discountPrice images rating numReviews stock isActive slug',
            populate: { path: 'category', select: 'name' }
        });

        if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        return NextResponse.json(dbUser.wishlist.filter(p => p && p.isActive !== false));
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

        if (user._id === '000000000000000000000000') {
            return NextResponse.json({ message: 'Wishlist not available for admin', wishlist: [] });
        }

        const dbUser = await User.findById(user._id);
        const { productId } = await req.json();

        if (!dbUser.wishlist.map(id => id.toString()).includes(productId)) {
            dbUser.wishlist.push(productId);
            await dbUser.save();
        }
        return NextResponse.json({ message: 'Added to wishlist', wishlist: dbUser.wishlist });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
