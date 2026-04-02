import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import generateToken from '@/lib/utils/generateToken';

export async function POST(req) {
    try {
        await connectDB();
        const { name, email, password } = await req.json();

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            await generateToken(user._id);
            return NextResponse.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            }, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const user = await getAuthUser();
        if (!user || !user.isAdmin) {
             return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
        }
        const users = await User.find({});
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
