import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildCustomerDeclinedHtml } from '@/lib/email';
import { formatPt } from '@/lib/time';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';

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
      if (booking.type !== 'PRIVATE') throw new Error('Only private lessons can be declined');

      // Verify the session user is the coach for this booking
      const coachProfile = await tx.coachProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!coachProfile || coachProfile.id !== booking.coachId) {
        throw new Error('You are not authorized to decline this booking');
      }

      // Update booking to cancelled
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });

      return { booking: updatedBooking };
    });

    const title = 'Private Lesson';
    const when = formatPt(result.booking.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'");

    // Send decline email to customer
    await resend.emails.send({
      from: `Spirit Athletics <${SENDER}>`,
      to: [result.booking.customerEmail],
      subject: `Request Update: ${title} (${when})`,
      html: buildCustomerDeclinedHtml(title, when),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Decline booking error:', e);
    return NextResponse.json({ ok: false, error: e.message ?? 'Failed to decline booking' }, { status: 400 });
  }
}

