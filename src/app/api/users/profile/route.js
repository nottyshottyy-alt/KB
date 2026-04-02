import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/middleware/authMiddleware';

export async function GET() {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const dbUser = await User.findById(user._id);
        if (dbUser) {
            return NextResponse.json({
                _id: dbUser._id,
                name: dbUser.name,
                email: dbUser.email,
                isAdmin: dbUser.isAdmin,
                phone: dbUser.phone,
                address: dbUser.address,
            });
        } else {
            // Admin user check (cached admin user doesn't have a DB doc)
            if (user.isAdmin && user._id === '000000000000000000000000') {
                 return NextResponse.json(user);
            }
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const dbUser = await User.findById(user._id);
        if (!dbUser) {
            return NextResponse.json({ message: 'User not found or Admin' }, { status: 404 });
        }

        const body = await req.json();
        dbUser.name = body.name || dbUser.name;
        dbUser.phone = body.phone !== undefined ? body.phone : dbUser.phone;
        if (body.avatar) dbUser.avatar = body.avatar;
        if (body.address) {
            dbUser.address = { ...dbUser.address, ...body.address };
        }
        if (body.password) {
            dbUser.password = body.password;
        }

        const updatedUser = await dbUser.save();
        return NextResponse.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            avatar: updatedUser.avatar,
            phone: updatedUser.phone,
            address: updatedUser.address,
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
