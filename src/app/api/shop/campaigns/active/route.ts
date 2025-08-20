import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    
    // Find the currently active campaign
    const activeCampaign = await prisma.shopCampaign.findFirst({
      where: {
        status: 'ACTIVE',
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        products: {
          include: {
            sizes: {
              orderBy: { label: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!activeCampaign) {
      return NextResponse.json({ campaign: null });
    }

    return NextResponse.json({ campaign: activeCampaign });
  } catch (error) {
    console.error('Error fetching active campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active campaign' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
