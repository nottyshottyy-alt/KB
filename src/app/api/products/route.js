import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import SubCategory from '@/lib/models/SubCategory';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        
        const pageSize = 12;
        const page = Number(searchParams.get('pageNumber')) || 1;

        const keyword = searchParams.get('keyword')
            ? { title: { $regex: searchParams.get('keyword'), $options: 'i' } }
            : {};

        const categoryFilter = searchParams.get('category') ? { category: searchParams.get('category') } : {};
        const subCategoryFilter = searchParams.get('subCategory') ? { subCategory: searchParams.get('subCategory') } : {};
        
        const minPrice = searchParams.get('minPrice') ? { price: { $gte: Number(searchParams.get('minPrice')) } } : {};
        const maxPrice = searchParams.get('maxPrice') 
            ? { price: { ...(minPrice.price || {}), $lte: Number(searchParams.get('maxPrice')) } } 
            : minPrice;

        const filter = { ...keyword, ...categoryFilter, ...subCategoryFilter, ...maxPrice, isActive: true };

        let sortOption = { createdAt: -1 };
        const sort = searchParams.get('sort');
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'popular') sortOption = { soldCount: -1 };

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        return NextResponse.json({ products, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        console.error('Products API Error:', error);
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
        const {
            title,
            description,
            price,
            discountPrice,
            stock,
            images,
            category,
            subCategory,
            isActive
        } = body;

        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const exists = await Product.findOne({ slug });
        if(exists) {
            slug = `${slug}-${Date.now()}`;
        }

        const product = new Product({
            user: user._id,
            title,
            slug,
            description,
            price,
            discountPrice,
            stock,
            images: images || [],
            category,
            subCategory,
            isActive: isActive !== undefined ? isActive : true
        });

        const createdProduct = await product.save();
        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
