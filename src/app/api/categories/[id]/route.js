import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/lib/models/Category';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }

        const { id } = await params;
        const { name, description } = await req.json();
        const category = await Category.findById(id);

        if (category) {
            category.name = name || category.name;
            if (name) {
                category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }
            category.description = description || category.description;

            const updatedCategory = await category.save();
            return NextResponse.json(updatedCategory);
        } else {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
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
        const category = await Category.findById(id);

        if (category) {
            await Category.deleteOne({ _id: category._id });
            return NextResponse.json({ message: 'Category removed' });
        } else {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
