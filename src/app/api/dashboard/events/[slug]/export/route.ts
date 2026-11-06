import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPt } from '@/lib/time';

function csvEscape(v: unknown): string {
  if (v == null) return '';
  let s = String(v);
  // Buyer-typed names like "=HYPERLINK(...)" would run as formulas in Excel/Sheets; a leading ' forces text.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const tickets = await prisma.ticket.findMany({
    where: { order: { eventId: event.id } },
    include: { order: true, tier: true },
    orderBy: [{ order: { customerName: 'asc' } }, { createdAt: 'asc' }],
  });

  const header = [
    'Ticket ID',
    'Customer Name',
    'Email',
    'Tier',
    'Price (USD)',
    'Status',
    'Redeemed At (PT)',
    'Order ID',
    'Ordered At (PT)',
  ];
  const rows = tickets.map((t) => [
    t.id,
    t.order.customerName,
    t.order.email,
    t.tier.name,
    (t.priceCents / 100).toFixed(2),
    t.status,
    t.redeemedAt ? formatPt(t.redeemedAt, "yyyy-MM-dd HH:mm 'PT'") : '',
    t.orderId,
    formatPt(t.order.createdAt, "yyyy-MM-dd HH:mm 'PT'"),
  ]);

  // BOM so Excel reads accented names (José, Zoë) as UTF-8.
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n');
  const filename = `${event.slug}-attendance-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export const dynamic = 'force-dynamic';
