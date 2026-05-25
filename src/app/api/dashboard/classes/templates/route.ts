import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TemplateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  weekday: z.number().int().min(0).max(6),
  startTimeMinutes: z.number().int().min(0).max(1440),
  durationMinutes: z.number().int().min(15).max(600),
  basePriceCents: z.number().int().min(0),
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

    const templates = await prisma.classTemplate.findMany({
      where: coach ? { service: { coachId: coach.id, type: 'CLASS' } } : { service: { type: 'CLASS' } },
      include: { service: { include: { coach: { include: { user: { select: { name: true } } } } } } },
      orderBy: { weekday: 'asc' },
    });
    return NextResponse.json({ ok: true, templates }, { headers: { 'Cache-Control': 'no-store' } });
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
    const BUSINESS_ADDRESS = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';

    const service = await prisma.service.create({
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

    const tpl = await prisma.classTemplate.create({
      data: {
        serviceId: service.id,
        weekday: data.weekday,
        startTimeMinutes: data.startTimeMinutes,
        capacity: 10,
        location: BUSINESS_ADDRESS,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true, template: tpl }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}
