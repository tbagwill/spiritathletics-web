import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/auditLog';
import { sendBookingEmails } from '@/lib/email';
import { buildICS } from '@/lib/ics';
import { formatPt } from '@/lib/time';

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

    const coach = await prisma.coachProfile.findUnique({ 
      where: { userId },
      include: { user: true, settings: true }
    });
    
    if (!coach) {
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

    // Verify the coach owns this booking
    if (booking.coachId !== coach.id && booking.service.coachId !== coach.id) {
      return NextResponse.json({ error: 'Not authorized to cancel this booking' }, { status: 403 });
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
          reason: 'Cancelled by coach'
        }
      });
    });

    // Prepare email data
    const title = isClass ? booking.service.title : 'Private Lesson';
    const when = formatPt(booking.startDateTimeUTC, "EEEE, MMMM d 'at' h:mm a 'PT'");
    const location = process.env.ORG_ADDRESS || 'Spirit Athletics';
    
    // Build cancellation emails
    const customerHtml = buildCancellationCustomerHtml(title, when, coach.user.name || 'Your coach');
    const coachHtml = buildCancellationCoachHtml(title, when, booking.customerName, booking.athleteName);
    
    // Build cancellation ICS (METHOD:CANCEL)
    const icsContent = buildICS({
      uid: `booking-${booking.id}@spiritathletics.net`,
      start: booking.startDateTimeUTC,
      end: booking.endDateTimeUTC,
      summary: `CANCELLED: ${title}`,
      location,
      description: `This ${isClass ? 'class' : 'private lesson'} has been cancelled by your coach.`,
      organizerEmail: coach.user.email,
      method: 'CANCEL'
    });

    // Send emails to customer and coach
    const coachEmails = [];
    
    // Add coach's primary email
    if (coach.settings?.emailBookingCancelled && coach.user.email) {
      coachEmails.push(coach.user.email);
    }
    
    // Add coach's alert emails
    if (coach.settings?.alertEmails) {
      coachEmails.push(...coach.settings.alertEmails);
    }

    await sendBookingEmails({
      customerEmail: booking.customerEmail,
      coachEmails,
      subject: `Your ${isClass ? 'class' : 'private lesson'} has been cancelled`,
      htmlCustomer: customerHtml,
      htmlCoach: coachHtml,
      icsContent
    });

    return NextResponse.json({ 
      success: true, 
      message: `${isClass ? 'Class' : 'Private lesson'} cancelled successfully` 
    });

  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel booking',
      details: error.message 
    }, { status: 500 });
  }
}

// Email template for customer cancellation notification
function buildCancellationCustomerHtml(title: string, when: string, coachName: string) {
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
      <h2 style="margin:0 0 12px 0;color:#dc2626">Your booking has been cancelled</h2>
      <p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
      <p style="margin:0 0 4px 0">${escape(when)}</p>
      <p style="margin:0 0 12px 0">Cancelled by: ${escape(coachName)}</p>
      <p style="margin:0 0 8px 0">We apologize for any inconvenience this may cause.</p>
      <p style="margin:0">If you have any questions, please don't hesitate to contact us.</p>
    </div>
  `;
}

// Email template for coach cancellation confirmation
function buildCancellationCoachHtml(title: string, when: string, customer: string, athlete: string) {
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
      <h2 style="margin:0 0 12px 0;color:#dc2626">Booking cancelled</h2>
      <p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
      <p style="margin:0 0 4px 0">${escape(when)}</p>
      <p style="margin:0 0 8px 0">Customer: ${escape(customer)} • Athlete: ${escape(athlete)}</p>
      <p style="margin:0">Cancellation notification has been sent to the customer.</p>
    </div>
  `;
}

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
