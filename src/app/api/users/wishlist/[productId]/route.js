import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

        if (user._id === '000000000000000000000000') {
            return NextResponse.json({ message: 'Wishlist not available for admin', wishlist: [] });
        }

        const dbUser = await User.findById(user._id);
        const { productId } = await params;

        dbUser.wishlist = dbUser.wishlist.filter(id => id.toString() !== productId);
        await dbUser.save();
        return NextResponse.json({ message: 'Removed from wishlist', wishlist: dbUser.wishlist });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
