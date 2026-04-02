import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/lib/models/Category';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({});
        return NextResponse.json(categories);
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

        const { name, description } = await req.json();
        let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const categoryExists = await Category.findOne({ slug });
        if (categoryExists) {
            return NextResponse.json({ message: 'Category already exists' }, { status: 400 });
        }

        const category = await Category.create({
            name,
            slug,
            description
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
