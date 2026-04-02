import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SubCategory from '@/lib/models/SubCategory';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function POST(req) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }

        const { name, category } = await req.json();
        let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const subCategoryExists = await SubCategory.findOne({ slug, category });
        if (subCategoryExists) {
            return NextResponse.json({ message: 'SubCategory already exists in this category' }, { status: 400 });
        }

        const subCategory = await SubCategory.create({
            name,
            slug,
            category
        });

        return NextResponse.json(subCategory, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
