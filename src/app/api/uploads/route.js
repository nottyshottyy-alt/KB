import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { protect, admin } from '@/lib/middleware/authMiddleware';

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
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Name generation
        const originalName = file.name;
        const extension = originalName.split('.').pop();
        const fileName = `image-${Date.now()}.${extension}`;
        
        // Ensure static/uploads exists
        const uploadDir = join(process.cwd(), 'public', 'images', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Already exists or other error
        }

        const path = join(uploadDir, fileName);
        await writeFile(path, buffer);

        return NextResponse.json({
            message: 'Image Uploaded successfully',
            image: `/images/uploads/${fileName}`
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ message: 'Server error during file deployment' }, { status: 500 });
    }
}
