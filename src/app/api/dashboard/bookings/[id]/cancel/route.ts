import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/auditLog';
import { sendBookingEmails, buildCancellationCustomerHtml, buildCancellationCoachHtml } from '@/lib/email';
import { buildICS } from '@/lib/ics';
import { formatPt } from '@/lib/time';
import { refundBookingIfPaid } from '@/lib/refund';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params since it's a Promise in newer Next.js versions
    const { id } = await params;
    
    // Get authenticated coach
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.user?.id || (session as any)?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [coach, actor] = await Promise.all([
      prisma.coachProfile.findUnique({
        where: { userId },
        include: { user: true, settings: true },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { role: true, name: true, email: true } }),
    ]);
    const isAdmin = actor?.role === 'ADMIN';

    if (!coach && !isAdmin) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    // Get the booking to cancel
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { 
        service: { 
          include: { 
            coach: { 
              include: { user: true, settings: true } 
            } 
          } 
        }, 
        classOccurrence: {
          include: {
            classTemplate: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!isAdmin) {
      if (!coach || (booking.coachId !== coach.id && booking.service.coachId !== coach.id)) {
        return NextResponse.json({ error: 'Not authorized to cancel this booking' }, { status: 403 });
      }
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // Check if booking is in the past
    if (new Date(booking.startDateTimeUTC) < new Date()) {
      return NextResponse.json({ error: 'Cannot cancel past bookings' }, { status: 400 });
    }

    const isClass = !!booking.classOccurrenceId;

    let refunded = false;
    try {
      const refund = await refundBookingIfPaid(booking);
      refunded = refund.refunded;
    } catch (err) {
      console.error('Stripe refund failed on coach cancel:', err);
      return NextResponse.json({
        error: 'Card refund failed. The booking was not cancelled.',
      }, { status: 500 });
    }

    // Start transaction to cancel booking and handle related records
    await prisma.$transaction(async (tx) => {
      // Update booking status
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      // For class bookings, check if this was the last booking and cancel the occurrence if needed
      if (isClass && booking.classOccurrenceId) {
        const remainingBookings = await tx.booking.count({
          where: {
            classOccurrenceId: booking.classOccurrenceId,
            status: 'CONFIRMED'
          }
        });

        // If no confirmed bookings remain, cancel the class occurrence
        if (remainingBookings === 0) {
          await tx.classOccurrence.update({
            where: { id: booking.classOccurrenceId },
            data: { status: 'CANCELLED' }
          });
        }
      }

      // Create audit log
      await createAuditLog({
        actorUserId: userId,
        action: 'CANCEL_BOOKING',
        entity: 'Booking',
        entityId: id,
        meta: {
          bookingType: booking.type,
          isClass,
          customerEmail: booking.customerEmail,
          startDateTime: booking.startDateTimeUTC,
          reason: isAdmin ? 'Cancelled by front desk' : 'Cancelled by coach'
        }
      });
    });

    // Prepare email data
    const title = isClass ? booking.service.title : 'Private Lesson';
    const when = formatPt(booking.startDateTimeUTC, "EEEE, MMMM d 'at' h:mm a 'PT'");
    const location = process.env.ORG_ADDRESS || 'Spirit Athletics';
    
    // Build branded cancellation emails (cancelledByCoach = true)
    const notifyCoach = booking.service.coach || coach;
    const actorName = isAdmin
      ? (actor?.name || 'Front desk')
      : (coach?.user.name || 'Your coach');

    const customerHtml = buildCancellationCustomerHtml(title, when, actorName, true, refunded, isClass ? 'CLASS' : 'PRIVATE');
    const coachHtml = buildCancellationCoachHtml(title, when, booking.customerName, booking.athleteName, true, refunded, isClass ? 'CLASS' : 'PRIVATE');
    
    const icsContent = buildICS({
      uid: `booking-${booking.id}@spiritathletics.net`,
      start: booking.startDateTimeUTC,
      end: booking.endDateTimeUTC,
      summary: `CANCELLED: ${title}`,
      location,
      description: `This ${isClass ? 'class' : 'private lesson'} has been cancelled.`,
      organizerEmail: notifyCoach?.user.email || process.env.SENDER_EMAIL || 'booking@spiritathletics.net',
      method: 'CANCEL'
    });

    const coachEmails = [];
    if (notifyCoach?.settings?.emailBookingCancelled !== false && notifyCoach?.user.email) {
      coachEmails.push(notifyCoach.user.email);
    }
    if (notifyCoach?.settings?.alertEmails) {
      coachEmails.push(...notifyCoach.settings.alertEmails);
    }

    await sendBookingEmails({
      customerEmail: booking.customerEmail,
      coachEmails,
      subject: `${isClass ? '[Class]' : '[Private]'} Booking cancelled: ${title}`,
      htmlCustomer: customerHtml,
      htmlCoach: coachHtml,
      icsContent
    });

    return NextResponse.json({ 
      success: true,
      refunded,
      message: refunded
        ? `${isClass ? 'Class' : 'Private lesson'} cancelled and a card refund was issued.`
        : `${isClass ? 'Class' : 'Private lesson'} cancelled successfully.`
    });

  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel booking',
      details: error.message 
    }, { status: 500 });
  }
}

