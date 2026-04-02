import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import generateToken from '@/lib/utils/generateToken';

export async function POST(req) {
    try {
        await connectDB();
        const { credential } = await req.json();

        // useGoogleLogin returns an access token — verify via userinfo endpoint
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` },
        });

        if (!response.ok) {
            return NextResponse.json({ message: 'Failed to verify Google access token' }, { status: 401 });
        }

        const payload = await response.json();
        const { sub, email, name, picture } = payload;

        // If the Google email matches the hardcoded admin email, grant admin access
        if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
            const adminId = '000000000000000000000000';
            await generateToken(adminId);
            return NextResponse.json({
                _id: adminId,
                name: 'Store Admin',
                email: email,
                isAdmin: true,
                avatar: picture || null,
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
                isAdmin: false
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            user.avatar = picture || user.avatar;
            await user.save();
        }

        await generateToken(user._id);
        return NextResponse.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Google Auth Error Details:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
