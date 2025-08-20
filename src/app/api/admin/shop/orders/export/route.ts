import { NextRequest, NextResponse } from 'next/server';
import { requireShopAdminAccess } from '@/lib/shopAdminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireShopAdminAccess();

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const format = searchParams.get('format') || 'csv';

    const where: any = {};
    if (campaignId && campaignId !== 'all') {
      where.campaignId = campaignId;
    }

    const orders = await prisma.shopOrder.findMany({
      where,
      include: {
        campaign: {
          select: {
            title: true
          }
        },
        lineItems: {
          include: {
            product: {
              select: {
                name: true
              }
            },
            size: {
              select: {
                label: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      // Generate CSV
      const csvRows = [
        // Header
        'Order ID,Date,Campaign,Customer Name,Email,Product,Size,Quantity,Unit Price,Line Total,Order Total,Status'
      ];

      orders.forEach(order => {
        order.lineItems.forEach(item => {
          csvRows.push([
            order.id,
            order.createdAt.toISOString().split('T')[0],
            order.campaign.title,
            order.customerName || '',
            order.email,
            item.product.name,
            item.size.label,
            item.quantity.toString(),
            (item.unitPrice / 100).toFixed(2),
            (item.lineTotal / 100).toFixed(2),
            (order.totalCents / 100).toFixed(2),
            order.status
          ].map(field => `"${field}"`).join(','));
        });
      });

      const csvContent = csvRows.join('\n');
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="shop-orders-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Default to JSON if format not supported
    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export orders' },
      { status: error instanceof Error && error.message.includes('access') ? 403 : 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
