import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendBookingEmails, buildCustomerHtml, buildCoachHtml } from '@/lib/email';
import { buildICS } from '@/lib/ics';
import { formatPt } from '@/lib/time';

const ApprovalSchema = z.object({
  token: z.string().uuid().optional(),
  bookingId: z.string().cuid().optional(),
  action: z.enum(['approve', 'deny']),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    const validation = ApprovalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    const { token, bookingId, action, reason } = validation.data;
    
    // Find booking by token or ID
    const booking = await prisma.booking.findFirst({
      where: token 
        ? { approvalToken: token }
        : { 
            id: bookingId,
            // Ensure coach owns this booking
            coachId: session ? (session as any)?.user?.coachProfile?.id : undefined
          },
      include: {
        service: { 
          include: { 
            coach: { 
              include: { user: true } 
            } 
          } 
        },
      }
    });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    if (booking.approvalStatus !== 'PENDING') {
      return NextResponse.json({ 
        error: `Booking already ${booking.approvalStatus?.toLowerCase()}` 
      }, { status: 400 });
    }
    
    // Check if expired
    if (booking.autoExpireAt && new Date() > booking.autoExpireAt) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { 
          approvalStatus: 'EXPIRED',
          status: 'CANCELLED',
        }
      });
      
      return NextResponse.json({ 
        error: 'This booking request has expired' 
      }, { status: 400 });
    }
    
    // Process approval/denial
    if (action === 'approve') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          status: 'CONFIRMED',
        }
      });
      
      // Send confirmation emails
      await sendApprovalConfirmationEmails(booking);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Booking approved successfully' 
      });
      
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          approvalStatus: 'DENIED',
          deniedAt: new Date(),
          denialReason: reason,
          status: 'CANCELLED',
        }
      });
      
      // Send denial notification
      await sendDenialNotificationEmails(booking, reason);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Booking denied' 
      });
    }
    
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}

// Handle GET requests for email link clicks
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const action = url.searchParams.get('action') as 'approve' | 'deny';
  
  if (!token || !action) {
    return NextResponse.redirect(`${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/dashboard/bookings?error=invalid-link`);
  }
  
  try {
    const response = await POST(new NextRequest(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    }));
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.redirect(`${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/dashboard/bookings?success=${encodeURIComponent(data.message)}`);
    } else {
      return NextResponse.redirect(`${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/dashboard/bookings?error=${encodeURIComponent(data.error)}`);
    }
  } catch (error) {
    return NextResponse.redirect(`${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/dashboard/bookings?error=processing-failed`);
  }
}

async function sendApprovalConfirmationEmails(booking: any) {
  const coachName = booking.service?.coach?.user?.name || 'Coach';
  const title = 'Private Lesson';
  const when = formatPt(booking.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
  const location = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
  const cancelUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/cancel?token=${booking.cancellationToken}`;
  
  const subject = `✅ Private Lesson Confirmed - ${when}`;
  
  const htmlCustomer = buildCustomerHtml(title, when, location, cancelUrl);
  const htmlCoach = buildCoachHtml(title, when, booking.customerName, booking.athleteName);
  
  const icsContent = buildICS({
    uid: `booking-${booking.id}`,
    summary: title,
    start: booking.startDateTimeUTC,
    end: booking.endDateTimeUTC,
    location,
    description: `Private lesson with ${coachName} for ${booking.athleteName}`,
    organizerEmail: booking.service?.coach?.user?.email || 'noreply@spiritathletics.net',
  });
  
  await sendBookingEmails({
    customerEmail: booking.customerEmail,
    coachEmails: [booking.service?.coach?.user?.email].filter(Boolean),
    subject,
    htmlCustomer,
    htmlCoach,
    icsContent,
  });
}

async function sendDenialNotificationEmails(booking: any, reason?: string) {
  const coachName = booking.service?.coach?.user?.name || 'Coach';
  const when = formatPt(booking.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
  
  const subject = `❌ Private Lesson Request Declined - ${when}`;
  
  const htmlCustomer = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #ef4444; margin-bottom: 20px;">Private Lesson Request Declined</h2>
        
        <p>Hi ${booking.customerName},</p>
        
        <p>Unfortunately, your private lesson request has been declined by ${coachName}.</p>
        
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Requested Time:</strong> ${when}</p>
          <p><strong>Athlete:</strong> ${booking.athleteName}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p>Please feel free to request a different time that works better for your coach.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/book/privates" style="background-color: #1d4ed8; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Book Another Time
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated message from Spirit Athletics. 
          If you have questions, please contact us directly.
        </p>
      </div>
    </div>
  `;
  
  await sendBookingEmails({
    customerEmail: booking.customerEmail,
    coachEmails: [],
    subject,
    htmlCustomer,
    htmlCoach: '',
    icsContent: '',
  });
}
