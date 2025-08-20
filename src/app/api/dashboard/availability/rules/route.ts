import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const RuleSchema = z.object({
  ruleType: z.literal('WEEKLY'),
  byDay: z.array(z.enum(['SU','MO','TU','WE','TH','FR','SA'])).min(1),
  startTimeMinutes: z.number().int().min(0).max(1440),
  endTimeMinutes: z.number().int().min(0).max(1440),
  effectiveFrom: z.string().transform((s) => new Date(s)),
  effectiveTo: z.string().transform((s) => new Date(s)).optional().nullable(),
});

async function requireCoachProfile() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  if (!userId) return null;
  const coach = await prisma.coachProfile.findUnique({ where: { userId } });
  return coach;
}

export async function GET() {
  try {
    const coach = await requireCoachProfile();
    if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const rules = await prisma.availabilityRule.findMany({ where: { coachId: coach.id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ ok: true, rules }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const coach = await requireCoachProfile();
    if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = RuleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
    const data = parsed.data;
    if (data.endTimeMinutes <= data.startTimeMinutes) return NextResponse.json({ ok: false, error: 'End time must be after start time' }, { status: 400 });
    const created = await prisma.availabilityRule.create({
      data: {
        coachId: coach.id,
        ruleType: 'WEEKLY',
        byDay: data.byDay,
        startTimeMinutes: data.startTimeMinutes,
        endTimeMinutes: data.endTimeMinutes,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo ?? null,
      },
    });
    return NextResponse.json({ ok: true, rule: created }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}
