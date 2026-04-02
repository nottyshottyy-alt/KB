import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SubCategory from '@/lib/models/SubCategory';

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { categoryId } = await params;
        const subCategories = await SubCategory.find({ category: categoryId });
        return NextResponse.json(subCategories);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
