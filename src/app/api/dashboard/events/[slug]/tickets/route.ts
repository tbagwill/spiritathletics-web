import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '50', 10) || 50));

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const whereClause: any = {
    order: { eventId: event.id },
  };

  if (q.length > 0) {
    whereClause.order = {
      eventId: event.id,
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
      ],
    };
  }

  const tickets = await prisma.ticket.findMany({
    where: whereClause,
    include: {
      order: true,
      tier: true,
    },
    orderBy: [{ order: { customerName: 'asc' } }, { createdAt: 'asc' }],
    take: limit,
  });

  // Also give counts (not filtered by q) so the board can show overall stats.
  const [totalTickets, redeemedTickets, tierBreakdown] = await Promise.all([
    prisma.ticket.count({ where: { order: { eventId: event.id } } }),
    prisma.ticket.count({ where: { order: { eventId: event.id }, status: 'REDEEMED' } }),
    prisma.ticket.groupBy({
      by: ['tierId', 'status'],
      where: { order: { eventId: event.id } },
      _count: { _all: true },
    }),
  ]);

  const byTier = event.tiers.map((t) => {
    const soldCount = tierBreakdown
      .filter((b) => b.tierId === t.id)
      .reduce((sum, b) => sum + b._count._all, 0);
    const redeemed = tierBreakdown
      .filter((b) => b.tierId === t.id && b.status === 'REDEEMED')
      .reduce((sum, b) => sum + b._count._all, 0);
    return {
      id: t.id,
      name: t.name,
      tierCode: t.tierCode,
      capacity: t.capacity,
      sold: soldCount,
      redeemed,
    };
  });

  return NextResponse.json({
    event: { id: event.id, slug: event.slug, title: event.title },
    stats: { totalTickets, redeemedTickets, byTier },
    tickets: tickets.map((t) => ({
      id: t.id,
      qrToken: t.qrToken,
      status: t.status,
      redeemedAt: t.redeemedAt,
      redeemedByUserId: t.redeemedByUserId,
      priceCents: t.priceCents,
      tierId: t.tierId,
      tierName: t.tier.name,
      tierCode: t.tier.tierCode,
      orderId: t.orderId,
      customerName: t.order.customerName,
      email: t.order.email,
      orderedAt: t.order.createdAt,
    })),
    returned: tickets.length,
    limit,
  });
}

export const dynamic = 'force-dynamic';
