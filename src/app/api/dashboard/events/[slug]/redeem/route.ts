import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import type { Event } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPt } from '@/lib/time';
import { parseOrderQrPayload } from '@/lib/ticketing';

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Check in every still-active ticket on an order in one atomic update. */
async function redeemOrder(accessToken: string, event: Event, userId: string, now: Date) {
  const order = await prisma.ticketOrder.findUnique({
    where: { accessToken },
    include: { event: { select: { title: true } } },
  });
  if (!order) {
    return NextResponse.json(
      { ok: false, reason: 'NOT_FOUND', message: 'No order matches that code.' },
      { status: 404 },
    );
  }
  if (order.eventId !== event.id) {
    return NextResponse.json(
      { ok: false, reason: 'WRONG_EVENT', message: `This order is for ${order.event.title}.` },
      { status: 409 },
    );
  }
  if (order.status !== 'PAID') {
    return NextResponse.json(
      { ok: false, reason: 'VOIDED', message: 'This order was refunded or canceled.' },
      { status: 409 },
    );
  }

  const redeemed = await prisma.ticket.updateManyAndReturn({
    where: { orderId: order.id, status: 'ACTIVE' },
    data: { status: 'REDEEMED', redeemedAt: now, redeemedByUserId: userId },
    select: { tierId: true },
  });

  const all = await prisma.ticket.findMany({
    where: { orderId: order.id },
    select: { status: true, tierId: true, tier: { select: { name: true, sortOrder: true } } },
  });
  const tiers = new Map(all.map((t) => [t.tierId, t.tier]));
  const alreadyCount = all.filter((t) => t.status === 'REDEEMED').length - redeemed.length;

  if (redeemed.length === 0) {
    if (alreadyCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'ALREADY_REDEEMED',
          message: `All ${plural(alreadyCount, 'ticket')} on this order ${alreadyCount === 1 ? 'is' : 'are'} already checked in.`,
          ticket: { customerName: order.customerName, tierName: plural(all.length, 'ticket') },
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, reason: 'VOIDED', message: 'No valid tickets on this order.' },
      { status: 409 },
    );
  }

  const counts = new Map<string, number>();
  for (const t of redeemed) counts.set(t.tierId, (counts.get(t.tierId) || 0) + 1);
  const breakdown = [...counts.entries()]
    .sort((a, b) => (tiers.get(a[0])?.sortOrder ?? 0) - (tiers.get(b[0])?.sortOrder ?? 0))
    .map(([tierId, count]) => ({ tierName: tiers.get(tierId)?.name || 'Ticket', count }));

  return NextResponse.json({
    ok: true,
    kind: 'ORDER',
    redeemedCount: redeemed.length,
    alreadyCount,
    breakdown,
    ticket: {
      customerName: order.customerName,
      tierName: breakdown.map((b) => `${b.count} ${b.tierName}`).join(', '),
    },
  });
}

const bodySchema = z.object({
  // Exactly one of qrToken or ticketId must be present.
  qrToken: z.string().min(1).optional(),
  ticketId: z.string().min(1).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { qrToken, ticketId } = parsed.data;
  if (!qrToken && !ticketId) {
    return NextResponse.json({ error: 'Provide qrToken or ticketId.' }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const now = new Date();
  const orderToken = qrToken ? parseOrderQrPayload(qrToken) : null;
  if (orderToken) return redeemOrder(orderToken, event, userId, now);

  // Atomically mark ACTIVE → REDEEMED. If zero rows are updated, we have a
  // reason: already redeemed, or no such token / wrong event.
  const result = await prisma.ticket.updateMany({
    where: {
      ...(qrToken ? { qrToken } : { id: ticketId }),
      status: 'ACTIVE',
      order: { eventId: event.id },
    },
    data: {
      status: 'REDEEMED',
      redeemedAt: now,
      redeemedByUserId: userId,
    },
  });

  if (result.count === 1) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        ...(qrToken ? { qrToken } : { id: ticketId }),
        order: { eventId: event.id },
      },
      include: {
        tier: true,
        order: true,
      },
    });
    return NextResponse.json({
      ok: true,
      ticket: ticket
        ? {
            id: ticket.id,
            tierName: ticket.tier.name,
            status: ticket.status,
            customerName: ticket.order.customerName,
            email: ticket.order.email,
            redeemedAt: ticket.redeemedAt,
          }
        : null,
    });
  }

  // Figure out *why* it didn't redeem.
  const existing = await prisma.ticket.findFirst({
    where: {
      ...(qrToken ? { qrToken } : { id: ticketId }),
      order: { eventId: event.id },
    },
    include: {
      tier: true,
      order: true,
    },
  });

  if (!existing) {
    // Check if the ticket exists at all (wrong event).
    const otherEvent = await prisma.ticket.findFirst({
      where: qrToken ? { qrToken } : { id: ticketId },
      include: { order: { include: { event: true } } },
    });
    if (otherEvent) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'WRONG_EVENT',
          message: `This ticket is for ${otherEvent.order.event.title}, not ${event.slug}.`,
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, reason: 'NOT_FOUND', message: 'No ticket matches that code.' },
      { status: 404 },
    );
  }

  if (existing.status === 'REDEEMED') {
    const redeemer = existing.redeemedByUserId
      ? await prisma.user.findUnique({ where: { id: existing.redeemedByUserId } })
      : null;
    return NextResponse.json(
      {
        ok: false,
        reason: 'ALREADY_REDEEMED',
        message: `Already checked in${existing.redeemedAt ? ` at ${formatPt(existing.redeemedAt, "h:mm a 'PT'")}` : ''}${
          redeemer?.name ? ` by ${redeemer.name}` : ''
        }.`,
        ticket: {
          id: existing.id,
          tierName: existing.tier.name,
          status: existing.status,
          customerName: existing.order.customerName,
          email: existing.order.email,
          redeemedAt: existing.redeemedAt,
          redeemedByName: redeemer?.name || null,
        },
      },
      { status: 409 },
    );
  }

  if (existing.status === 'VOIDED') {
    return NextResponse.json(
      { ok: false, reason: 'VOIDED', message: 'This ticket has been voided.' },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: false, reason: 'UNKNOWN' }, { status: 409 });
}

export const dynamic = 'force-dynamic';
