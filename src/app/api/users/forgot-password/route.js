import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        await connectDB();
        const { email } = await req.json();
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ message: 'No account with that email found' }, { status: 404 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        if (process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
            await transporter.sendMail({
                from: `KB COMPUTERS <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Password Reset Request',
                html: `<p>You requested a password reset. Click the link below (valid for 30 minutes):</p><a href="${resetUrl}">${resetUrl}</a>`
            });
        }

        return NextResponse.json({ message: 'Password reset email sent', resetUrl });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
