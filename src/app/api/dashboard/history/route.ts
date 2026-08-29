import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ptMidnightUtc, ptTodayString } from '@/lib/time';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 50;

function monthRangePt(month: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [year, monthNum] = month.split('-').map(Number);
  if (monthNum < 1 || monthNum > 12) return null;
  const start = ptMidnightUtc(`${month}-01`);
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? year + 1 : year;
  const end = ptMidnightUtc(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01`);
  return { start, end };
}

function personSearch(q: string): Prisma.BookingWhereInput {
  return {
    OR: [
      { athleteName: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerEmail: { contains: q, mode: 'insensitive' } },
    ],
  };
}

async function requireStaff() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  const email = (session as any)?.user?.email as string | undefined;
  if (!userId && !email) return null;

  const user = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: email! },
  });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'COACH')) return null;

  const coach = await prisma.coachProfile.findUnique({ where: { userId: user.id } });

  return { user, coach, isAdmin: user.role === 'ADMIN' };
}

function coachBookingFilter(coachId: string): Prisma.BookingWhereInput {
  return { OR: [{ coachId }, { service: { coachId } }] };
}

export async function GET(req: NextRequest) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  if (!staff.isAdmin && !staff.coach) {
    return NextResponse.json({ ok: false, error: 'Coach profile not found' }, { status: 403 });
  }

  const url = req.nextUrl;
  const kind = (url.searchParams.get('kind') || 'private').toLowerCase();
  const month = url.searchParams.get('month') || ptTodayString().slice(0, 7);
  const q = (url.searchParams.get('q') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, parseInt(url.searchParams.get('pageSize') || String(PAGE_SIZE_DEFAULT), 10) || PAGE_SIZE_DEFAULT),
  );
  const requestedCoachId = url.searchParams.get('coachId') || '';

  const range = monthRangePt(month);
  if (!range) {
    return NextResponse.json({ ok: false, error: 'Invalid month. Use YYYY-MM.' }, { status: 400 });
  }

  let scopedCoachId: string | null = null;
  if (staff.isAdmin) {
    scopedCoachId = requestedCoachId || null;
  } else {
    scopedCoachId = staff.coach!.id;
  }

  const bookingCoachWhere: Prisma.BookingWhereInput | undefined = scopedCoachId
    ? coachBookingFilter(scopedCoachId)
    : undefined;

  const coaches = staff.isAdmin
    ? (await prisma.coachProfile.findMany({
        where: { isActive: true },
        select: { id: true, user: { select: { name: true } } },
        orderBy: { user: { name: 'asc' } },
      })).map((c) => ({ id: c.id, name: c.user.name || 'Coach' }))
    : [];

  if (kind === 'private') {
    const where: Prisma.BookingWhereInput = {
      AND: [
        {
          type: 'PRIVATE',
          isManualBlock: false,
          startDateTimeUTC: { gte: range.start, lt: range.end },
        },
        ...(bookingCoachWhere ? [bookingCoachWhere] : []),
        ...(q ? [personSearch(q)] : []),
      ],
    };

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          service: { include: { coach: { include: { user: { select: { name: true } } } } } },
          coach: { include: { user: { select: { name: true } } } },
        },
        orderBy: { startDateTimeUTC: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      kind: 'private',
      total,
      page,
      pageSize,
      coaches,
      rows: bookings.map((b) => ({
        id: b.id,
        title: 'Private Lesson',
        startISO: b.startDateTimeUTC.toISOString(),
        endISO: b.endDateTimeUTC.toISOString(),
        coachName: b.coach?.user?.name || b.service.coach?.user?.name || '',
        athleteName: b.athleteName,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        paymentMethod: b.paymentMethod,
        priceCents: b.priceCents,
        status: b.status,
        privateKind: b.privateKind,
      })),
    });
  }

  if (kind === 'class') {
    const bookingSome: Prisma.BookingWhereInput = {
      AND: [
        { isManualBlock: false },
        ...(bookingCoachWhere ? [bookingCoachWhere] : []),
        ...(q ? [personSearch(q)] : []),
      ],
    };

    const where: Prisma.ClassOccurrenceWhereInput = {
      startDateTimeUTC: { gte: range.start, lt: range.end },
      bookings: {
        some: {
          AND: [{ isManualBlock: false }, ...(bookingCoachWhere ? [bookingCoachWhere] : [])],
        },
      },
      ...(q
        ? {
            OR: [
              { classTemplate: { service: { title: { contains: q, mode: 'insensitive' } } } },
              { bookings: { some: bookingSome } },
            ],
          }
        : {}),
    };

    const [total, occurrences] = await Promise.all([
      prisma.classOccurrence.count({ where }),
      prisma.classOccurrence.findMany({
        where,
        include: {
          classTemplate: {
            include: { service: { include: { coach: { include: { user: { select: { name: true } } } } } } },
          },
          bookings: {
            where: { isManualBlock: false, ...(bookingCoachWhere || {}) },
            orderBy: { athleteName: 'asc' },
          },
        },
        orderBy: { startDateTimeUTC: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      kind: 'class',
      total,
      page,
      pageSize,
      coaches,
      sessions: occurrences.map((occ) => {
        const durationMin = occ.classTemplate.service.durationMinutes ?? 60;
        const end = new Date(occ.startDateTimeUTC.getTime() + durationMin * 60000);
        const allCancelled = occ.bookings.length > 0 && occ.bookings.every((b) => b.status === 'CANCELLED');
        const anyPending = occ.bookings.some((b) => b.status === 'PENDING');
        return {
          id: occ.id,
          title: occ.classTemplate.service.title,
          startISO: occ.startDateTimeUTC.toISOString(),
          endISO: end.toISOString(),
          coachName: occ.classTemplate.service.coach?.user?.name || '',
          status: occ.status === 'CANCELLED' || allCancelled ? 'CANCELLED' : anyPending ? 'PENDING' : 'CONFIRMED',
          athletes: occ.bookings.map((b) => ({
            id: b.id,
            athleteName: b.athleteName,
            customerName: b.customerName,
            customerEmail: b.customerEmail,
            paymentMethod: b.paymentMethod,
            priceCents: b.priceCents,
            status: b.status,
          })),
        };
      }),
    });
  }

  if (kind === 'clinic') {
    const where: Prisma.ClinicWhereInput = {
      dateTimeUTC: { gte: range.start, lt: range.end },
      registrations: { some: {} },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              {
                registrations: {
                  some: {
                    OR: [
                      { athleteFirstName: { contains: q, mode: 'insensitive' } },
                      { customerName: { contains: q, mode: 'insensitive' } },
                      { customerEmail: { contains: q, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, clinics] = await Promise.all([
      prisma.clinic.count({ where }),
      prisma.clinic.findMany({
        where,
        include: {
          registrations: { orderBy: { athleteFirstName: 'asc' } },
        },
        orderBy: { dateTimeUTC: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      kind: 'clinic',
      total,
      page,
      pageSize,
      coaches,
      sessions: clinics.map((clinic) => {
        const allCancelled =
          clinic.registrations.length > 0 && clinic.registrations.every((r) => r.status === 'CANCELLED');
        return {
          id: clinic.id,
          title: clinic.title,
          startISO: clinic.dateTimeUTC.toISOString(),
          endISO: clinic.endDateTimeUTC.toISOString(),
          coachName: '',
          status: allCancelled ? 'CANCELLED' : 'CONFIRMED',
          athletes: clinic.registrations.map((r) => ({
            id: r.id,
            athleteName: r.athleteFirstName,
            customerName: r.customerName,
            customerEmail: r.customerEmail,
            paymentMethod: r.paymentMethod,
            priceCents: clinic.priceCents,
            status: r.status,
          })),
        };
      }),
    });
  }

  return NextResponse.json({ ok: false, error: 'Invalid kind' }, { status: 400 });
}
