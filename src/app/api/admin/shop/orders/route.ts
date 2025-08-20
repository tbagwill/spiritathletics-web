import { NextRequest, NextResponse } from 'next/server';
import { requireShopAdminAccess } from '@/lib/shopAdminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireShopAdminAccess();

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (campaignId && campaignId !== 'all') {
      where.campaignId = campaignId;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.shopOrder.findMany({
        where,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          lineItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              },
              size: {
                select: {
                  id: true,
                  label: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.shopOrder.count({ where })
    ]);

    // Calculate summary statistics
    const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0);
    const itemCount = orders.reduce((sum, order) => 
      sum + order.lineItems.reduce((lineSum, item) => lineSum + item.quantity, 0), 0
    );

    return NextResponse.json({ 
      orders,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      summary: {
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalItems: itemCount,
        averageOrderValue: orders.length > 0 ? revenue / orders.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
