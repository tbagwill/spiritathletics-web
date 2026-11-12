import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { MAX_EXTRA_COACHES, MIN_CLASS_CAPACITY, coachRuleError } from '@/lib/classCoaches';
import { notifyAssignedCoaches, resolveExtraCoachIds } from '@/lib/classCoachesServer';

export const dynamic = 'force-dynamic';

const TemplateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  weekday: z.number().int().min(0).max(6),
  startTimeMinutes: z.number().int().min(0).max(1440),
  durationMinutes: z.number().int().min(15).max(600),
  basePriceCents: z.number().int().min(0),
  capacity: z.number().int().min(MIN_CLASS_CAPACITY).default(10),
  /** Extra coaches on top of the creator (the lead coach). */
  coachIds: z.array(z.string().min(1)).max(MAX_EXTRA_COACHES).default([]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

async function getCoachAndRole() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  const role = (session as any)?.user?.role as string | undefined;
  if (!userId) return { coach: null, role: undefined };
  const coach = await prisma.coachProfile.findUnique({ where: { userId } });
  return { coach, role };
}

export async function GET() {
  try {
    const { coach, role } = await getCoachAndRole();
    const isAdmin = role === 'ADMIN';
    if (!coach && !isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const coachName = { include: { user: { select: { name: true } } } } as const;
    const templates = await prisma.classTemplate.findMany({
      where: coach
        ? {
            service: { type: 'CLASS' },
            OR: [{ service: { coachId: coach.id } }, { coaches: { some: { coachId: coach.id } } }],
          }
        : { service: { type: 'CLASS' } },
      include: {
        service: { include: { coach: coachName } },
        coaches: { include: { coach: coachName }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { weekday: 'asc' },
    });
    const withOwner = templates.map((t) => ({ ...t, isOwner: !!coach && t.service.coachId === coach.id }));
    return NextResponse.json({ ok: true, templates: withOwner }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { coach } = await getCoachAndRole();
    if (!coach) return NextResponse.json({ ok: false, error: 'A coach profile is required to create classes' }, { status: 401 });
    const json = await req.json();
    const parsed = TemplateSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
    const data = parsed.data;

    const extra = await resolveExtraCoachIds(data.coachIds, coach.id);
    if (extra.error) return NextResponse.json({ ok: false, error: extra.error }, { status: 400 });
    const ruleError = coachRuleError(data.capacity, 1 + extra.ids.length);
    if (ruleError) return NextResponse.json({ ok: false, error: ruleError }, { status: 400 });

    const BUSINESS_ADDRESS = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';

    const tpl = await prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          coachId: coach.id,
          type: 'CLASS',
          title: data.title,
          description: data.description,
          durationMinutes: data.durationMinutes,
          basePriceCents: data.basePriceCents,
          isActive: true,
        },
      });

      return tx.classTemplate.create({
        data: {
          serviceId: service.id,
          weekday: data.weekday,
          startTimeMinutes: data.startTimeMinutes,
          capacity: data.capacity,
          location: BUSINESS_ADDRESS,
          isActive: true,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          coaches: { create: extra.ids.map((coachId) => ({ coachId })) },
        },
      });
    });

    await notifyAssignedCoaches(tpl.id, extra.ids);

    return NextResponse.json({ ok: true, template: tpl }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}
