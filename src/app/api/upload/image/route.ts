import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { trackError } from '@/lib/monitoring';

const UploadSchema = z.object({
  type: z.enum(['product', 'campaign', 'profile', 'content']),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !(session as any)?.user?.role || !['ADMIN', 'COACH'].includes((session as any).user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const typeParam = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate input
    const validation = UploadSchema.safeParse({ type: typeParam });
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid type parameter',
        details: validation.error.errors 
      }, { status: 400 });
    }
    
    const { type } = validation.data;

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large',
        maxSize: MAX_FILE_SIZE 
      }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type',
        allowedTypes: ALLOWED_TYPES 
      }, { status: 400 });
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
    }

    // Process main image (max 2000px, high quality)
    const processedImage = await sharp(buffer)
      .resize(2000, 2000, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 90, 
        progressive: true,
        mozjpeg: true 
      })
      .toBuffer();

    // Generate thumbnail (400px)
    const thumbnail = await sharp(buffer)
      .resize(400, 400, { 
        fit: 'cover',
        position: 'centre'
      })
      .jpeg({ 
        quality: 80,
        progressive: true 
      })
      .toBuffer();

    // Generate medium size (800px)
    const medium = await sharp(buffer)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();

    // Create unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const baseFilename = `${type}/${timestamp}-${randomId}`;

    // Upload to Vercel Blob
    const [mainBlob, thumbnailBlob, mediumBlob] = await Promise.all([
      put(`${baseFilename}.jpg`, processedImage, {
        access: 'public',
        contentType: 'image/jpeg',
      }),
      put(`${baseFilename}-thumb.jpg`, thumbnail, {
        access: 'public',
        contentType: 'image/jpeg',
      }),
      put(`${baseFilename}-medium.jpg`, medium, {
        access: 'public',
        contentType: 'image/jpeg',
      }),
    ]);

    // Store in database
    const imageRecord = await prisma.uploadedImage.create({
      data: {
        url: mainBlob.url,
        publicId: baseFilename,
        type,
        variants: {
          original: mainBlob.url,
          medium: mediumBlob.url,
          thumbnail: thumbnailBlob.url,
        },
        metadata: {
          originalName: file.name,
          originalSize: file.size,
          originalType: file.type,
          processedSize: processedImage.length,
          width: metadata.width,
          height: metadata.height,
          uploadedBy: (session as any).user.id,
          uploadedAt: new Date().toISOString(),
        }
      }
    });

    // Track successful upload
    try {
      const { monitoring } = await import('@/lib/monitoring');
      await monitoring.trackMetric({
        type: 'BOOKING_RATE', // Using existing metric type
        name: 'image_upload_success',
        value: 1,
        metadata: {
          type,
          fileSize: file.size,
          userId: (session as any).user.id,
        }
      });
    } catch (monitoringError) {
      console.error('Failed to track image upload metric:', monitoringError);
    }

    return NextResponse.json({
      success: true,
      image: {
        id: imageRecord.id,
        url: imageRecord.url,
        variants: imageRecord.variants,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          size: processedImage.length,
          type: 'image/jpeg',
        }
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    // Track error
    try {
      await trackError(error as Error, {
        context: 'image_upload',
        url: req.url,
        userAgent: req.headers.get('user-agent') || 'unknown',
      });
    } catch (trackingError) {
      console.error('Failed to track upload error:', trackingError);
    }

    if (error instanceof Error) {
      if (error.message.includes('Invalid image')) {
        return NextResponse.json(
          { error: 'Invalid image file format' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('File too large')) {
        return NextResponse.json(
          { error: 'File size exceeds limit' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !(session as any)?.user?.role || !['ADMIN', 'COACH'].includes((session as any).user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    // Get image record
    const image = await prisma.uploadedImage.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from database (Vercel Blob files will be cleaned up automatically)
    await prisma.uploadedImage.delete({
      where: { id: imageId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Image deletion error:', error);
    
    await trackError(error as Error, {
      context: 'image_deletion',
      url: req.url,
    });

    return NextResponse.json(
      { error: 'Deletion failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
