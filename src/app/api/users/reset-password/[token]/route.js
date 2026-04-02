import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import generateToken from '@/lib/utils/generateToken';

export async function POST(req, { params }) {
    try {
        await connectDB();
        const { token } = await params;
        const { password } = await req.json();

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        await generateToken(user._id);
        return NextResponse.json({ message: 'Password reset successful' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
