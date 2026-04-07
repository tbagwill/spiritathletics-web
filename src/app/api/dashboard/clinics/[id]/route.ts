import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

async function requireCoachOrAdmin() {
  const session = await getServerSession(authOptions as any);
  const email = (session as any)?.user?.email as string | undefined;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'COACH')) return null;
  return user;
}

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().min(1).max(5000).trim().optional(),
  dateTimeUTC: z.string().optional(),
  endDateTimeUTC: z.string().optional(),
  durationMinutes: z.number().int().min(1).optional(),
  priceCents: z.number().int().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  location: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCoachOrAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      registrations: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          athleteFirstName: true,
          customerName: true,
          customerEmail: true,
          status: true,
          createdAt: true,
          stripeSessionId: true,
        },
      },
    },
  });

  if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, clinic });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCoachOrAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const json = await req.json();
  const parse = UpdateSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parse.error.format() }, { status: 400 });
  }

  const data: Record<string, any> = { ...parse.data };
  if (data.dateTimeUTC) data.dateTimeUTC = new Date(data.dateTimeUTC);
  if (data.endDateTimeUTC) data.endDateTimeUTC = new Date(data.endDateTimeUTC);
  if (data.imageUrl === '') data.imageUrl = null;

  try {
    const clinic = await prisma.clinic.update({ where: { id }, data });
    return NextResponse.json({ ok: true, clinic });
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCoachOrAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.clinic.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 });
  }
}
