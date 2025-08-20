import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireShopAdminAccess } from '@/lib/shopAdminAuth';
import { prisma } from '@/lib/prisma';

const ProductSchema = z.object({
  campaignId: z.string(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  basePrice: z.number().min(0, 'Price must be non-negative'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sizes: z.array(z.object({
    label: z.string().min(1, 'Size label is required'),
    priceDelta: z.number().default(0)
  })).min(1, 'At least one size is required')
});

export async function GET(req: NextRequest) {
  try {
    await requireShopAdminAccess();

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    const where = campaignId ? { campaignId } : {};
    
    const products = await prisma.shopProduct.findMany({
      where,
      include: {
        sizes: {
          orderBy: { label: 'asc' }
        },
        campaign: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireShopAdminAccess();

    const body = await req.json();
    const validatedData = ProductSchema.parse(body);

    // Check if campaign exists
    const campaign = await prisma.shopCampaign.findUnique({
      where: { id: validatedData.campaignId }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check for unique slug within campaign
    const existingProduct = await prisma.shopProduct.findFirst({
      where: { 
        campaignId: validatedData.campaignId,
        slug: validatedData.slug 
      }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists in this campaign' },
        { status: 400 }
      );
    }

    // Convert price from dollars to cents
    const basePriceCents = Math.round(validatedData.basePrice * 100);

    const product = await prisma.shopProduct.create({
      data: {
        campaignId: validatedData.campaignId,
        name: validatedData.name,
        slug: validatedData.slug,
        basePrice: basePriceCents,
        description: validatedData.description || null,
        imageUrl: validatedData.imageUrl || null,
        sizes: {
          create: validatedData.sizes.map(size => ({
            label: size.label,
            priceDelta: Math.round(size.priceDelta * 100) // Convert to cents
          }))
        }
      },
      include: {
        sizes: {
          orderBy: { label: 'asc' }
        },
        campaign: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
