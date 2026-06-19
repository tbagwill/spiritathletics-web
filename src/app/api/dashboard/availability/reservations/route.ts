import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { combineLocalDateAndMinutesPT, ptMidnightUtc } from '@/lib/time';

export const dynamic = 'force-dynamic';

// Accepts a PT date string + minute offsets to match the rest of the availability system
const ReservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  startTimeMinutes: z.number().int().min(0).max(1439),
  endTimeMinutes: z.number().int().min(1).max(1440),
  label: z.string().max(100).optional().nullable(),
});

async function requireCoachProfile() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  if (!userId) return null;
  const coach = await prisma.coachProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
  return coach;
}

export async function GET() {
  try {
    const coach = await requireCoachProfile();
    if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const reservations = await prisma.booking.findMany({
      where: {
        coachId: coach.id,
        isManualBlock: true,
        status: 'CONFIRMED',
        startDateTimeUTC: { gte: new Date() },
      },
      orderBy: { startDateTimeUTC: 'asc' },
      select: {
        id: true,
        startDateTimeUTC: true,
        endDateTimeUTC: true,
        notes: true,
      },
    });

    return NextResponse.json({ ok: true, reservations }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const coach = await requireCoachProfile();
    if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = ReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
    }
    const { date, startTimeMinutes, endTimeMinutes, label } = parsed.data;

    if (endTimeMinutes <= startTimeMinutes) {
      return NextResponse.json({ ok: false, error: 'End time must be after start time' }, { status: 400 });
    }

    // Convert PT date + minutes to UTC using the same helper as slot generation
    const localDate = ptMidnightUtc(date);
    const startDateTimeUTC = combineLocalDateAndMinutesPT(localDate, startTimeMinutes);
    const endDateTimeUTC = combineLocalDateAndMinutesPT(localDate, endTimeMinutes);

    // Find the coach's PRIVATE service (needed for the serviceId FK)
    const privateService = await prisma.service.findFirst({
      where: { coachId: coach.id, type: 'PRIVATE', isActive: true },
    });
    if (!privateService) {
      return NextResponse.json({ ok: false, error: 'No active private lesson service found for this coach' }, { status: 404 });
    }

    // Check for overlaps with existing CONFIRMED bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        coachId: coach.id,
        status: 'CONFIRMED',
        startDateTimeUTC: { lt: endDateTimeUTC },
        endDateTimeUTC: { gt: startDateTimeUTC },
      },
    });
    if (overlapping) {
      return NextResponse.json({ ok: false, error: 'This time slot overlaps with an existing booking or reservation' }, { status: 409 });
    }

    const reservation = await prisma.booking.create({
      data: {
        type: 'PRIVATE',
        status: 'CONFIRMED',
        isManualBlock: true,
        coachId: coach.id,
        serviceId: privateService.id,
        startDateTimeUTC,
        endDateTimeUTC,
        customerName: 'Reserved',
        customerEmail: coach.user.email,
        athleteName: 'Reserved',
        notes: label ?? null,
        priceCents: 0,
        paymentMethod: 'CASH',
        cancellationToken: uuidv4(),
      },
    });

    return NextResponse.json({ ok: true, reservation }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}
