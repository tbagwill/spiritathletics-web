import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const decodedSessionId = decodeURIComponent(sessionId);

    // Try multiple lookup strategies for robustness
    let order = await prisma.shopOrder.findFirst({
      where: { 
        OR: [
          { stripePaymentId: sessionId },
          { stripePaymentId: decodedSessionId }
        ]
      },
      include: {
        campaign: {
          select: {
            title: true,
            slug: true,
          }
        },
        lineItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              }
            },
            size: {
              select: {
                label: true,
              }
            }
          },
          orderBy: { id: 'asc' }
        }
      }
    });

    // Fallback: prefix match if exact match fails
    if (!order && sessionId.length >= 10) {
      order = await prisma.shopOrder.findFirst({
        where: { 
          stripePaymentId: {
            startsWith: sessionId.substring(0, 20)
          }
        },
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            }
          },
          lineItems: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                }
              },
              size: {
                select: {
                  label: true,
                }
              }
            },
            orderBy: { id: 'asc' }
          }
        }
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. This may happen if the payment is still being processed. Please wait a moment and refresh the page.' },
        { status: 404 }
      );
    }

    // Only return orders that are confirmed (not pending)
    if (order.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Order is still being processed' },
        { status: 202 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order by session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
