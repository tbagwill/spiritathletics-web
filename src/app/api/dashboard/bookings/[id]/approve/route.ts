import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildICS } from '@/lib/ics';
import { buildCoachHtml, buildCustomerHtml, sendBookingEmails } from '@/lib/email';
import { formatPt } from '@/lib/time';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const bookingId = params.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the booking
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          service: { include: { coach: { include: { user: true } } } },
        },
      });

      if (!booking) throw new Error('Booking not found');
      if (booking.status !== 'PENDING') throw new Error('Booking is not pending');
      if (booking.type !== 'PRIVATE') throw new Error('Only private lessons can be approved');

      // Verify the session user is the coach for this booking
      const coachProfile = await tx.coachProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!coachProfile || coachProfile.id !== booking.coachId) {
        throw new Error('You are not authorized to approve this booking');
      }

      // Check for conflicts with confirmed bookings
      const overlapCount = await tx.booking.count({
        where: {
          coachId: booking.coachId!,
          status: 'CONFIRMED',
          id: { not: bookingId }, // Exclude current booking
          OR: [
            {
              AND: [
                { startDateTimeUTC: { lt: booking.startDateTimeUTC } },
                { endDateTimeUTC: { gt: booking.startDateTimeUTC } }
              ]
            },
            {
              AND: [
                { startDateTimeUTC: { lt: booking.endDateTimeUTC } },
                { endDateTimeUTC: { gt: booking.endDateTimeUTC } }
              ]
            },
            {
              AND: [
                { startDateTimeUTC: { gte: booking.startDateTimeUTC } },
                { endDateTimeUTC: { lte: booking.endDateTimeUTC } }
              ]
            },
            {
              AND: [
                { startDateTimeUTC: { lte: booking.startDateTimeUTC } },
                { endDateTimeUTC: { gte: booking.endDateTimeUTC } }
              ]
            }
          ]
        }
      });

      if (overlapCount > 0) {
        throw new Error('Time slot is no longer available - another booking has been confirmed');
      }

      // Update booking to confirmed
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

      // Auto-decline all other pending bookings for this coach that overlap
      await tx.booking.updateMany({
        where: {
          coachId: booking.coachId!,
          status: 'PENDING',
          id: { not: bookingId },
          OR: [
            {
              AND: [
                { startDateTimeUTC: { lt: booking.endDateTimeUTC } },
                { endDateTimeUTC: { gt: booking.startDateTimeUTC } }
              ]
            }
          ]
        },
        data: { status: 'CANCELLED', cancelledAt: new Date() }
      });

      return { booking: updatedBooking, service: booking.service };
    });

    // Get coach settings and emails
    const settings = await prisma.coachSettings.findUnique({ 
      where: { coachId: result.booking.coachId! } 
    }).catch(() => null);
    
    const coachEmail = result.service.coach?.user?.email || null;
    const coachEmails = (settings?.emailBookingConfirmed === false) 
      ? [] 
      : [coachEmail, ...(settings?.alertEmails || [])].filter((e): e is string => !!e);
    
    const coachName = result.service.coach?.user?.name || 'Coach';
    const title = 'Private Lesson';
    const when = formatPt(result.booking.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
    const location = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
    const cancelUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net'}/cancel?token=${result.booking.cancellationToken}`;

    // Build calendar invite
    const ics = buildICS({
      uid: result.booking.id,
      start: result.booking.startDateTimeUTC,
      end: result.booking.endDateTimeUTC,
      summary: `${title} — ${coachName}`,
      location,
      description: `Cancel: ${cancelUrl}`,
      organizerEmail: process.env.SENDER_EMAIL || 'booking@spiritathletics.net',
      method: 'REQUEST',
    });

    // Send confirmation emails with calendar invite
    await sendBookingEmails({
      customerEmail: result.booking.customerEmail,
      coachEmails,
      subject: `Booking Confirmed: ${title} (${when})`,
      htmlCustomer: buildCustomerHtml(title, when, location, cancelUrl),
      htmlCoach: buildCoachHtml(title, when, result.booking.customerName, result.booking.athleteName),
      icsContent: ics,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Approve booking error:', e);
    return NextResponse.json({ ok: false, error: e.message ?? 'Failed to approve booking' }, { status: 400 });
  }
}

