import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function POST(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const { id } = await params;
        const { rating, comment, images } = await req.json();
        const product = await Product.findById(id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === user._id.toString()
            );

            if (alreadyReviewed) {
                return NextResponse.json({ message: 'Product already reviewed' }, { status: 400 });
            }

            const review = {
                name: user.name,
                rating: Number(rating),
                comment,
                images: images || [],
                user: user._id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
            return NextResponse.json({ message: 'Review added' }, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
