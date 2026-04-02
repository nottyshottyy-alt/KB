import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import SubCategory from '@/lib/models/SubCategory';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const product = await Product.findById(id)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        if (product && product.isActive) {
            return NextResponse.json(product);
        } else {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }

        const { id } = await params;
        const product = await Product.findById(id);

        if (product) {
            const body = await req.json();
            product.title = body.title || product.title;
            product.description = body.description || product.description;
            product.price = body.price !== undefined ? body.price : product.price;
            product.discountPrice = body.discountPrice !== undefined ? body.discountPrice : product.discountPrice;
            product.stock = body.stock !== undefined ? body.stock : product.stock;
            product.images = body.images || product.images;
            product.category = body.category || product.category;
            product.subCategory = body.subCategory || product.subCategory;
            product.isActive = body.isActive !== undefined ? body.isActive : product.isActive;

            if (body.title) {
                let slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const exists = await Product.findOne({ slug, _id: { $ne: product._id } });
                if(exists) {
                    slug = `${slug}-${Date.now()}`;
                }
                product.slug = slug;
            }

            const updatedProduct = await product.save();
            return NextResponse.json(updatedProduct);
        } else {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }

        const { id } = await params;
        const product = await Product.findById(id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            return NextResponse.json({ message: 'Product removed' });
        } else {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
