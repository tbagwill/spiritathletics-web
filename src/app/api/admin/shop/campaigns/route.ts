import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireShopAdminAccess } from '@/lib/shopAdminAuth';
import { prisma } from '@/lib/prisma';

const CampaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  heroImageUrl: z.string().url().optional().or(z.literal('')),
  startsAt: z.string().transform(str => new Date(str)),
  endsAt: z.string().transform(str => new Date(str)),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'FULFILLED', 'CANCELED']),
});

export async function GET() {
  try {
    await requireShopAdminAccess();

    const campaigns = await prisma.shopCampaign.findMany({
      include: {
        products: {
          include: {
            sizes: true
          }
        },
        orders: {
          select: {
            id: true,
            totalCents: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch campaigns' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireShopAdminAccess();

    const body = await req.json();
    const validatedData = CampaignSchema.parse(body);

    // Validate dates
    if (validatedData.endsAt <= validatedData.startsAt) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check for unique slug
    const existingCampaign = await prisma.shopCampaign.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingCampaign) {
      return NextResponse.json(
        { error: 'A campaign with this slug already exists' },
        { status: 400 }
      );
    }

    const campaign = await prisma.shopCampaign.create({
      data: validatedData,
      include: {
        products: {
          include: {
            sizes: true
          }
        },
        orders: true
      }
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create campaign' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
