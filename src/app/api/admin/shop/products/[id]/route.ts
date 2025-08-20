import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireShopAdminAccess } from '@/lib/shopAdminAuth';
import { prisma } from '@/lib/prisma';

const ProductUpdateSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  basePrice: z.number().min(0, 'Price must be non-negative').optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sizes: z.array(z.object({
    id: z.string().optional(), // For updating existing sizes
    label: z.string().min(1, 'Size label is required'),
    priceDelta: z.number().default(0)
  })).optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireShopAdminAccess();
    const { id } = await params;

    const product = await prisma.shopProduct.findUnique({
      where: { id },
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
          include: {
            order: {
              select: {
                id: true,
                email: true,
                customerName: true,
                status: true,
                createdAt: true
              }
            },
            size: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
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
    const validatedData = ProductUpdateSchema.parse(body);

    // Check if slug is being updated and ensure uniqueness within campaign
    if (validatedData.slug) {
      const product = await prisma.shopProduct.findUnique({
        where: { id },
        select: { campaignId: true }
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      const existingProduct = await prisma.shopProduct.findFirst({
        where: { 
          campaignId: product.campaignId,
          slug: validatedData.slug,
          id: { not: id }
        }
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: 'A product with this slug already exists in this campaign' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.basePrice !== undefined) updateData.basePrice = Math.round(validatedData.basePrice * 100);
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl || null;

    // Handle sizes update if provided
    if (validatedData.sizes) {
      // First check if any sizes are referenced in orders
      const sizeIdsInOrders = await prisma.shopOrderItem.findMany({
        where: {
          productId: id
        },
        select: {
          sizeId: true
        },
        distinct: ['sizeId']
      });

      const sizeIdsInUse = new Set(sizeIdsInOrders.map(item => item.sizeId).filter(Boolean));
      
      // Get existing sizes
      const existingSizes = await prisma.productSize.findMany({
        where: { productId: id }
      });

      // Update existing sizes that are in use, delete others
      const updatedSizeLabels = new Set(validatedData.sizes.map(s => s.label));
      
      // Delete sizes that are not in the new list AND not in use
      const sizesToDelete = existingSizes.filter(
        s => !updatedSizeLabels.has(s.label) && !sizeIdsInUse.has(s.id)
      );
      
      if (sizesToDelete.length > 0) {
        await prisma.productSize.deleteMany({
          where: {
            id: { in: sizesToDelete.map(s => s.id) }
          }
        });
      }

      // Update or create sizes
      for (const newSize of validatedData.sizes) {
        const existingSize = existingSizes.find(s => s.label === newSize.label);
        
        if (existingSize) {
          // Update existing size
          await prisma.productSize.update({
            where: { id: existingSize.id },
            data: {
              priceDelta: Math.round(newSize.priceDelta * 100)
            }
          });
        } else {
          // Create new size
          await prisma.productSize.create({
            data: {
              productId: id,
              label: newSize.label,
              priceDelta: Math.round(newSize.priceDelta * 100)
            }
          });
        }
      }
    }

    // Remove sizes from updateData since we handled them separately
    delete updateData.sizes;
    
    const product = await prisma.shopProduct.update({
      where: { id },
      data: updateData,
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

    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
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

    // Check if product has orders
    const orderItemsCount = await prisma.shopOrderItem.count({
      where: { productId: id }
    });

    if (orderItemsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      );
    }

    // Delete in a transaction to handle all relationships
    await prisma.$transaction(async (tx) => {
      // First delete all product sizes
      await tx.productSize.deleteMany({
        where: { productId: id }
      });
      
      // Then delete the product
      await tx.shopProduct.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
