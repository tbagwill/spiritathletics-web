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

const CreateSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  slug: z.string().min(1).max(200).trim().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  description: z.string().min(1).max(5000).trim(),
  dateTimeUTC: z.string(),
  endDateTimeUTC: z.string(),
  durationMinutes: z.number().int().min(1),
  priceCents: z.number().int().min(0),
  capacity: z.number().int().min(1),
  location: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(true),
});

export async function GET(_req: NextRequest) {
  const user = await requireCoachOrAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clinics = await prisma.clinic.findMany({
    orderBy: { dateTimeUTC: 'desc' },
    include: {
      registrations: {
        where: { status: 'CONFIRMED' },
        select: { id: true, athleteFirstName: true, customerName: true, customerEmail: true, paymentMethod: true, stripeSessionId: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({ ok: true, clinics });
}

export async function POST(req: NextRequest) {
  const user = await requireCoachOrAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parse = CreateSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parse.error.format() }, { status: 400 });
  }

  const { imageUrl, ...rest } = parse.data;

  try {
    const clinic = await prisma.clinic.create({
      data: {
        ...rest,
        dateTimeUTC: new Date(rest.dateTimeUTC),
        endDateTimeUTC: new Date(rest.endDateTimeUTC),
        imageUrl: imageUrl || null,
      },
    });
    return NextResponse.json({ ok: true, clinic }, { status: 201 });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A clinic with that slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 });
  }
}
