import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SubCategory from '@/lib/models/SubCategory';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }

        const { id } = await params;
        const subCategory = await SubCategory.findById(id);

        if (subCategory) {
            await SubCategory.deleteOne({ _id: subCategory._id });
            return NextResponse.json({ message: 'SubCategory removed' });
        } else {
            return NextResponse.json({ message: 'SubCategory not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
