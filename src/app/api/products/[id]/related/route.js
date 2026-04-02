import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        })
            .populate('category', 'name')
            .sort({ soldCount: -1 })
            .limit(4);

        return NextResponse.json(related);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
