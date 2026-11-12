import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ptDateString } from '@/lib/time';
import { Prisma } from '@prisma/client';
import { MAX_EXTRA_COACHES, MIN_CLASS_CAPACITY, coachRuleError } from '@/lib/classCoaches';
import { notifyAssignedCoaches, resolveExtraCoachIds } from '@/lib/classCoachesServer';
import { formatPt } from '@/lib/time';

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  weekday: z.number().int().min(0).max(6).optional(),
  startTimeMinutes: z.number().int().min(0).max(1440).optional(),
  durationMinutes: z.number().int().min(15).max(600).optional(),
  basePriceCents: z.number().int().min(0).optional(),
  capacity: z.number().int().min(MIN_CLASS_CAPACITY).optional(),
  /** Full list of extra coaches (replaces the current list). Omit to leave unchanged. */
  coachIds: z.array(z.string().min(1)).max(MAX_EXTRA_COACHES).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

async function pruneUnbookedOccurrences(
  templateId: string,
  startDate: Date | null,
  endDate: Date | null,
) {
  const startBound = startDate ? startDate.toISOString().slice(0, 10) : null;
  const endBound = endDate ? endDate.toISOString().slice(0, 10) : null;
  if (!startBound && !endBound) return;

  const occurrences = await prisma.classOccurrence.findMany({
    where: { classTemplateId: templateId, status: 'SCHEDULED' },
    include: { bookings: { where: { status: 'CONFIRMED' }, select: { id: true } } },
  });

  const toDelete = occurrences.filter((occ) => {
    if (occ.bookings.length > 0) return false;
    const occDate = ptDateString(occ.startDateTimeUTC);
    if (startBound && occDate < startBound) return true;
    if (endBound && occDate > endBound) return true;
    return false;
  });

  if (toDelete.length > 0) {
    await prisma.classOccurrence.deleteMany({ where: { id: { in: toDelete.map((o) => o.id) } } });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const coach = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const tpl = await prisma.classTemplate.findUnique({
    where: { id: resolvedParams.id },
    include: { service: true, coaches: { select: { coachId: true } } },
  });
  if (!tpl || tpl.service.coachId !== coach.id) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const json = await req.json();
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;

  // Multi-coach rule: up to 10 athletes per coach (lead coach + extra coaches).
  const currentExtra = tpl.coaches.map((c) => c.coachId);
  let nextExtra = currentExtra;
  if (data.coachIds !== undefined) {
    const resolved = await resolveExtraCoachIds(data.coachIds, tpl.service.coachId);
    if (resolved.error) return NextResponse.json({ ok: false, error: resolved.error }, { status: 400 });
    nextExtra = resolved.ids;
  }
  const nextCapacity = data.capacity ?? tpl.capacity;
  const ruleError = coachRuleError(nextCapacity, 1 + nextExtra.length);
  if (ruleError) return NextResponse.json({ ok: false, error: ruleError }, { status: 400 });

  // Don't let spots drop below athletes already booked on an upcoming session.
  if (nextCapacity < tpl.capacity) {
    const upcoming = await prisma.classOccurrence.findMany({
      where: { classTemplateId: tpl.id, status: 'SCHEDULED', startDateTimeUTC: { gte: new Date() } },
      select: { startDateTimeUTC: true, _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } } },
    });
    const busiest = upcoming.reduce<(typeof upcoming)[number] | null>(
      (max, o) => (!max || o._count.bookings > max._count.bookings ? o : max),
      null,
    );
    if (busiest && busiest._count.bookings > nextCapacity) {
      const n = busiest._count.bookings;
      return NextResponse.json({
        ok: false,
        error: `${n} athletes are already booked on ${formatPt(busiest.startDateTimeUTC, 'EEE MMM d')}, so spots can't go below ${n}.`,
      }, { status: 400 });
    }
  }

  const added = nextExtra.filter((id) => !currentExtra.includes(id));
  const removed = currentExtra.filter((id) => !nextExtra.includes(id));

  const serviceData: Prisma.ServiceUpdateInput = {};
  if (data.title !== undefined) serviceData.title = data.title;
  if (data.description !== undefined) serviceData.description = data.description;
  if (data.durationMinutes !== undefined) serviceData.durationMinutes = data.durationMinutes;
  if (data.basePriceCents !== undefined) serviceData.basePriceCents = data.basePriceCents;

  const templateData: Prisma.ClassTemplateUpdateInput = {};
  if (data.weekday !== undefined) templateData.weekday = data.weekday;
  if (data.startTimeMinutes !== undefined) templateData.startTimeMinutes = data.startTimeMinutes;
  if (data.capacity !== undefined) templateData.capacity = data.capacity;
  if (data.startDate !== undefined) templateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) templateData.endDate = data.endDate ? new Date(data.endDate) : null;

  const updated = await prisma.$transaction(async (tx) => {
    if (Object.keys(serviceData).length > 0) {
      await tx.service.update({ where: { id: tpl.serviceId }, data: serviceData });
    }
    if (removed.length > 0) {
      await tx.classTemplateCoach.deleteMany({ where: { classTemplateId: tpl.id, coachId: { in: removed } } });
    }
    if (added.length > 0) {
      await tx.classTemplateCoach.createMany({
        data: added.map((coachId) => ({ classTemplateId: tpl.id, coachId })),
        skipDuplicates: true,
      });
    }
    return Object.keys(templateData).length > 0
      ? tx.classTemplate.update({ where: { id: tpl.id }, data: templateData })
      : tpl;
  });

  await notifyAssignedCoaches(tpl.id, added);

  const nextStart = (data.startDate !== undefined)
    ? (data.startDate ? new Date(data.startDate) : null)
    : tpl.startDate;
  const nextEnd = (data.endDate !== undefined)
    ? (data.endDate ? new Date(data.endDate) : null)
    : tpl.endDate;
  await pruneUnbookedOccurrences(tpl.id, nextStart, nextEnd);

  return NextResponse.json({ ok: true, template: updated }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const coach = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const tpl = await prisma.classTemplate.findUnique({ where: { id: resolvedParams.id }, include: { service: true } });
  if (!tpl || tpl.service.coachId !== coach.id) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  // Delete in proper order to handle foreign key constraints
  // First delete any class occurrences
  await prisma.classOccurrence.deleteMany({ where: { classTemplateId: resolvedParams.id } });
  // Then delete the template
  await prisma.classTemplate.delete({ where: { id: resolvedParams.id } });
  // Finally delete the service if it has no other dependencies
  await prisma.service.delete({ where: { id: tpl.serviceId } });

  return NextResponse.json({ ok: true });
}
