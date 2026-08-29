import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';
import { ptMidnightUtc, ptTodayString } from '@/lib/time';
import FrontDeskBoard, { type DeskBooking } from './FrontDeskBoard';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  const userRole = (session as any)?.user?.role as string | undefined;
  const coach = userId ? await prisma.coachProfile.findUnique({ where: { userId } }) : null;
  const isAdmin = userRole === 'ADMIN';

  if (!coach && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Coach profile not found</h1>
          <p className="text-gray-600 mt-2">Unable to load your schedule. Please contact support.</p>
          <Link href="/dashboard" className="inline-block mt-6 text-sm font-semibold text-blue-700">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const rangeStart = ptMidnightUtc(ptTodayString());
  const rangeEnd = addDays(rangeStart, 15);
  const coachFilter = !isAdmin && coach
    ? { OR: [{ coachId: coach.id }, { service: { coachId: coach.id } }] }
    : {};

  const [bookings, clinics] = await Promise.all([
    prisma.booking.findMany({
      where: {
        AND: [
          coachFilter,
          {
            OR: [
              { status: 'PENDING' },
              { status: 'CONFIRMED', startDateTimeUTC: { gte: rangeStart, lt: rangeEnd } },
              { status: 'CANCELLED', cancelledAt: { gte: rangeStart } },
            ],
          },
        ],
      },
      include: {
        service: { include: { coach: { include: { user: { select: { name: true } } } } } },
        coach: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startDateTimeUTC: 'asc' },
      take: 800,
    }),
    prisma.clinic.findMany({
      where: {
        dateTimeUTC: { gte: rangeStart, lt: rangeEnd },
      },
      include: {
        registrations: {
          where: { status: 'CONFIRMED' },
          select: {
            id: true,
            athleteFirstName: true,
            customerName: true,
            customerEmail: true,
            paymentMethod: true,
            status: true,
          },
        },
      },
      orderBy: { dateTimeUTC: 'asc' },
    }),
  ]);

  const rows: DeskBooking[] = [];

  for (const booking of bookings) {
    const isClass = booking.type === 'CLASS' || !!booking.classOccurrenceId;
    rows.push({
      id: booking.id,
      kind: booking.isManualBlock ? 'HOLD' : isClass ? 'CLASS' : 'PRIVATE',
      status: booking.status,
      startISO: booking.startDateTimeUTC.toISOString(),
      endISO: booking.endDateTimeUTC.toISOString(),
      title: booking.isManualBlock
        ? (booking.notes || 'Reserved slot')
        : isClass
          ? booking.service.title
          : 'Private Lesson',
      coachName: booking.coach?.user?.name || booking.service.coach?.user?.name || '',
      athleteName: booking.isManualBlock ? '' : booking.athleteName,
      customerName: booking.isManualBlock ? '' : booking.customerName,
      customerEmail: booking.isManualBlock ? '' : booking.customerEmail,
      paymentMethod: booking.isManualBlock ? null : booking.paymentMethod,
      priceCents: booking.priceCents,
      notes: booking.notes,
      privateKind: booking.privateKind,
      cancelable: !booking.isManualBlock && booking.status === 'CONFIRMED',
    });
  }

  for (const clinic of clinics) {
    for (const reg of clinic.registrations) {
        rows.push({
          id: reg.id,
          kind: 'CLINIC',
          status: reg.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
          startISO: clinic.dateTimeUTC.toISOString(),
          endISO: clinic.endDateTimeUTC.toISOString(),
          title: clinic.title,
          coachName: '',
          athleteName: reg.athleteFirstName,
          customerName: reg.customerName,
          customerEmail: reg.customerEmail,
          paymentMethod: reg.paymentMethod,
          priceCents: clinic.priceCents,
          cancelable: false,
        });
      }
    }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Front Desk Board' : 'Upcoming Bookings'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isAdmin
                ? 'All privates, classes, and clinics for the next two weeks — search by athlete, parent, or coach.'
                : 'Your scheduled privates and classes. Front desk admins see every coach.'}
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <FrontDeskBoard rows={rows} canCancel={isAdmin || !!coach} />
      </div>
    </div>
  );
}
