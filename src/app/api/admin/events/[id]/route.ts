import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { ptDateTimeLocalToUtc } from '@/lib/time';
import { scheduleIssues } from '@/lib/eventSchedule';

const tierSchema = z.object({
  id: z.string().optional(),
  tierCode: z.enum(['STANDARD', 'SENIOR_CHILD', 'VIP']),
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional().nullable(),
  earlyBirdPriceCents: z.number().int().min(0),
  doorPriceCents: z.number().int().min(0),
  capacity: z.number().int().min(0).nullable(),
  showOnline: z.boolean(),
  earlyBirdEnabled: z.boolean(),
  sortOrder: z.number().int().min(0),
});

const patchSchema = z.object({
  event: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(80),
    title: z.string().min(1).max(120),
    description: z.string().max(2000).optional().nullable(),
    venue: z.string().max(200).optional().nullable(),
    venueAddress: z.string().max(300).optional().nullable(),
    heroImageUrl: z.string().url().optional().nullable(),
    startDateTime: z.string().min(1),
    doorsOpen: z.string().optional().nullable(),
    endDateTime: z.string().optional().nullable(),
    salesOpenAt: z.string().min(1),
    earlyBirdEndsAt: z.string().min(1),
    doorSalesOpenAt: z.string().min(1),
    salesCloseAt: z.string().min(1),
    convenienceFeeCents: z.number().int().min(0).max(100000),
    status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED']),
  }),
  tiers: z.array(tierSchema).min(1),
});

function toUtcOrNull(local: string | null | undefined): Date | null {
  if (!local) return null;
  return ptDateTimeLocalToUtc(local);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
  }
  const { event, tiers } = parsed.data;

  const issues = scheduleIssues(event);
  if (issues.length) {
    return NextResponse.json({ error: issues[0].message, issues }, { status: 400 });
  }

  const salesOpen = ptDateTimeLocalToUtc(event.salesOpenAt);
  const earlyBirdEnds = ptDateTimeLocalToUtc(event.earlyBirdEndsAt);
  const doorOpen = ptDateTimeLocalToUtc(event.doorSalesOpenAt);
  const salesClose = ptDateTimeLocalToUtc(event.salesCloseAt);
  const start = ptDateTimeLocalToUtc(event.startDateTime);

  const existing = await prisma.event.findUnique({
    where: { id },
    include: { tiers: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Slug uniqueness (if changed)
  if (event.slug !== existing.slug) {
    const clash = await prisma.event.findUnique({ where: { slug: event.slug } });
    if (clash) return NextResponse.json({ error: `Slug "${event.slug}" is already in use.` }, { status: 409 });
  }

  // Tier validations
  const codes = new Set<string>();
  for (const t of tiers) {
    if (codes.has(t.tierCode)) {
      return NextResponse.json({ error: `Duplicate tier code: ${t.tierCode}` }, { status: 400 });
    }
    codes.add(t.tierCode);
    if (t.earlyBirdPriceCents > t.doorPriceCents) {
      return NextResponse.json({ error: `${t.name}: Early Bird price must be ≤ Door price.` }, { status: 400 });
    }
    if (t.capacity != null) {
      const prior = existing.tiers.find((x) => x.id === t.id);
      if (prior && t.capacity < prior.sold) {
        return NextResponse.json(
          { error: `${t.name}: capacity (${t.capacity}) can't be less than tickets already sold (${prior.sold}).` },
          { status: 400 },
        );
      }
    }
  }

  const incomingIds = new Set(tiers.map((t) => t.id).filter(Boolean) as string[]);
  const tiersToDelete = existing.tiers.filter((t) => !incomingIds.has(t.id));
  for (const t of tiersToDelete) {
    if (t.sold > 0) {
      return NextResponse.json(
        { error: `Can't remove tier "${t.name}" because ${t.sold} tickets are already sold.` },
        { status: 400 },
      );
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id },
        data: {
          slug: event.slug,
          title: event.title,
          description: event.description || null,
          venue: event.venue || null,
          venueAddress: event.venueAddress || null,
          heroImageUrl: event.heroImageUrl || null,
          startDateTimeUTC: start,
          doorsOpenUTC: toUtcOrNull(event.doorsOpen),
          endDateTimeUTC: toUtcOrNull(event.endDateTime),
          salesOpenAtUTC: salesOpen,
          earlyBirdEndsAtUTC: earlyBirdEnds,
          doorSalesOpenAtUTC: doorOpen,
          salesCloseAtUTC: salesClose,
          convenienceFeeCents: event.convenienceFeeCents,
          status: event.status,
        },
      });

      for (const t of tiersToDelete) {
        await tx.ticketTier.delete({ where: { id: t.id } });
      }

      for (const t of tiers) {
        if (t.id) {
          await tx.ticketTier.update({
            where: { id: t.id },
            data: {
              name: t.name,
              description: t.description || null,
              earlyBirdPriceCents: t.earlyBirdPriceCents,
              doorPriceCents: t.doorPriceCents,
              capacity: t.capacity,
              showOnline: t.showOnline,
              earlyBirdEnabled: t.earlyBirdEnabled,
              sortOrder: t.sortOrder,
            },
          });
        } else {
          await tx.ticketTier.create({
            data: {
              eventId: id,
              tierCode: t.tierCode,
              name: t.name,
              description: t.description || null,
              earlyBirdPriceCents: t.earlyBirdPriceCents,
              doorPriceCents: t.doorPriceCents,
              capacity: t.capacity,
              showOnline: t.showOnline,
              earlyBirdEnabled: t.earlyBirdEnabled,
              sortOrder: t.sortOrder,
            },
          });
        }
      }

      return tx.event.findUnique({ where: { id } });
    });

    return NextResponse.json({ ok: true, id: updated?.id });
  } catch (err) {
    console.error('Update event failed:', err);
    return NextResponse.json({ error: 'Failed to update event.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (event._count.orders > 0) {
    return NextResponse.json(
      { error: `Can't delete: ${event._count.orders} orders exist. Set status to Completed instead.` },
      { status: 400 },
    );
  }

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete event failed:', err);
    return NextResponse.json({ error: 'Failed to delete event.' }, { status: 500 });
  }
}
