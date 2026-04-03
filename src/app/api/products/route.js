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
        const skip = pageSize * (page - 1);

        const keyword = searchParams.get('keyword');
        const category = searchParams.get('category');
        const subCategory = searchParams.get('subCategory');
        const minPrice = Number(searchParams.get('minPrice')) || 0;
        const maxPrice = Number(searchParams.get('maxPrice')) || Infinity;
        const sort = searchParams.get('sort');

        // Initial Match (Non-price filters)
        const matchStage = { isActive: true };
        if (keyword) {
            matchStage.title = { $regex: keyword, $options: 'i' };
        }
        if (category) {
            matchStage.category = new (require('mongoose')).Types.ObjectId(category);
        }
        if (subCategory) {
            matchStage.subCategory = new (require('mongoose')).Types.ObjectId(subCategory);
        }

        // Sorting Logic
        let sortStage = { createdAt: -1 };
        if (sort === 'price_asc') sortStage = { effectivePrice: 1 };
        if (sort === 'price_desc') sortStage = { effectivePrice: -1 };
        if (sort === 'popular') sortStage = { soldCount: -1 };

        const pipeline = [
            { $match: matchStage },
            {
                $addFields: {
                    effectivePrice: {
                        $cond: {
                            if: { $gt: ["$discountPrice", 0] },
                            then: "$discountPrice",
                            else: "$price"
                        }
                    }
                }
            },
            {
                $match: {
                    effectivePrice: { $gte: minPrice, $lte: maxPrice }
                }
            },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: sortStage },
                        { $skip: skip },
                        { $limit: pageSize },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'category',
                                foreignField: '_id',
                                as: 'category'
                            }
                        },
                        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'subcategories',
                                localField: 'subCategory',
                                foreignField: '_id',
                                as: 'subCategory'
                            }
                        },
                        { $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                'category.name': 1,
                                'category.slug': 1,
                                'subCategory.name': 1,
                                'subCategory.slug': 1,
                                title: 1,
                                slug: 1,
                                description: 1,
                                price: 1,
                                discountPrice: 1,
                                stock: 1,
                                images: 1,
                                isActive: 1,
                                effectivePrice: 1,
                                soldCount: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            }
        ];

        const [results] = await Product.aggregate(pipeline);
        const count = results.metadata[0]?.total || 0;
        const products = results.data;

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
