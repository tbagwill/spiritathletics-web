import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BookingsList from './BookingsList';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  const coach = userId ? await prisma.coachProfile.findUnique({ where: { userId } }) : null;

  const now = new Date();
  const bookings = coach ? await prisma.booking.findMany({
    where: {
      startDateTimeUTC: { gte: now },
      status: { in: ['PENDING', 'CONFIRMED'] }, // Explicitly include pending and confirmed
      OR: [
        { coachId: coach.id },
        { service: { coachId: coach.id } },
      ],
    },
    include: { service: { include: { coach: { include: { user: true } } } }, classOccurrence: true },
    orderBy: [{ status: 'asc' }, { startDateTimeUTC: 'asc' }],
    take: 100,
  }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-slide-up">
            {/* Mobile-first layout: stack vertically on small screens */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upcoming Bookings</h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">View your scheduled classes and private lessons</p>
              </div>
              <div className="flex justify-center sm:justify-end">
                <Link href="/dashboard" className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md text-sm sm:text-base">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!coach ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coach Profile Not Found</h3>
            <p className="text-gray-600">Unable to load your coach profile. Please contact support.</p>
          </div>
        ) : (
          <BookingsList bookings={bookings.map(booking => ({
            ...booking,
            startDateTimeUTC: booking.startDateTimeUTC.toISOString(),
            endDateTimeUTC: booking.endDateTimeUTC.toISOString(),
            classOccurrenceId: booking.classOccurrenceId || undefined
          }))} />
        )}
      </div>
    </div>
  );
}
