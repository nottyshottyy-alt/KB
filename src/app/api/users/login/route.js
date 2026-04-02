import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import generateToken from '@/lib/utils/generateToken';

export async function POST(req) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        // Admin hardcoded check
        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                const adminId = '000000000000000000000000';
                await generateToken(adminId);
                return NextResponse.json({
                    _id: adminId,
                    name: 'Store Admin',
                    email: process.env.ADMIN_EMAIL,
                    isAdmin: true,
                });
            }
        }

        const user = await User.findOne({ email });

        if (user && user.password && (await user.matchPassword(password))) {
            await generateToken(user._id);
            return NextResponse.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                avatar: user.avatar
            });
        } else {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
