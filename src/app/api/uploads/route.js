import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { protect, admin } from '@/lib/middleware/authMiddleware';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
    try {
        // Auth check
        const authResponse = await protect(req);
        if (authResponse instanceof NextResponse) return authResponse;
        
        const adminResponse = await admin(req);
        if (adminResponse instanceof NextResponse) return adminResponse;

        const formData = await req.formData();
        const file = formData.get('image');

        if (!file) {
            return NextResponse.json({ message: 'No identification visual detected' }, { status: 400 });
        }

        // Convert file to buffer for Cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary using a Promise
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'kb_computers',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            message: 'Asset deployed successfully',
            image: uploadResponse.secure_url
        });
    } catch (error) {
        console.error('Deployment Failure:', error);
        return NextResponse.json({ message: 'Operational failure: Cloud synchronization failed' }, { status: 500 });
    }
}
