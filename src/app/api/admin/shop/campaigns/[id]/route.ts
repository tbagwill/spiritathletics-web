import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireShopAdminAccess } from '@/lib/shopAdminAuth';
import { prisma } from '@/lib/prisma';

const CampaignUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().optional(),
  heroImageUrl: z.string().url().optional().or(z.literal('')),
  startsAt: z.string().transform(str => new Date(str)).optional(),
  endsAt: z.string().transform(str => new Date(str)).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'FULFILLED', 'CANCELED']).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireShopAdminAccess();
    const { id } = await params;

    const campaign = await prisma.shopCampaign.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            sizes: {
              orderBy: { label: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        },
        orders: {
          include: {
            lineItems: {
              include: {
                product: true,
                size: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch campaign' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireShopAdminAccess();
    const { id } = await params;

    const body = await req.json();
    const validatedData = CampaignUpdateSchema.parse(body);

    // Validate dates if both are provided
    if (validatedData.startsAt && validatedData.endsAt) {
      if (validatedData.endsAt <= validatedData.startsAt) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Check for unique slug if slug is being updated
    if (validatedData.slug) {
      const existingCampaign = await prisma.shopCampaign.findFirst({
        where: { 
          slug: validatedData.slug,
          id: { not: id }
        }
      });

      if (existingCampaign) {
        return NextResponse.json(
          { error: 'A campaign with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Get the current campaign to compare changes
    const currentCampaign = await prisma.shopCampaign.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            sizes: true
          }
        }
      }
    });

    if (!currentCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Use a transaction for cascading updates
    const campaign = await prisma.$transaction(async (tx) => {
      // Update the campaign
      const updatedCampaign = await tx.shopCampaign.update({
        where: { id },
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

      // Handle cascading effects based on what changed
      
      // 1. If status changed to CLOSED or CANCELED, log the change
      if (validatedData.status && 
          validatedData.status !== currentCampaign.status &&
          ['CLOSED', 'CANCELED'].includes(validatedData.status)) {
        
        console.log(`Campaign ${id} status changed to ${validatedData.status}. Products are now unavailable for purchase.`);
        
        // Note: We don't need to update products directly since the shop will check campaign status
        // when displaying products and during checkout
      }

      // 2. If dates changed, log for awareness
      if (validatedData.startsAt || validatedData.endsAt) {
        console.log(`Campaign ${id} dates updated. New availability window: ${updatedCampaign.startsAt} to ${updatedCampaign.endsAt}`);
      }

      // 3. If slug changed, the new URL will be available immediately
      if (validatedData.slug && validatedData.slug !== currentCampaign.slug) {
        console.log(`Campaign ${id} slug changed from "${currentCampaign.slug}" to "${validatedData.slug}". New URL: /shop/${validatedData.slug}`);
      }

      return updatedCampaign;
    });

    return NextResponse.json({ 
      campaign,
      message: 'Campaign updated successfully. Changes will be reflected immediately in the shop.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update campaign' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireShopAdminAccess();
    const { id } = await params;

    // Check if campaign has orders
    const ordersCount = await prisma.shopOrder.count({
      where: { campaignId: id }
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campaign with existing orders' },
        { status: 400 }
      );
    }

    await prisma.shopCampaign.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete campaign' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
