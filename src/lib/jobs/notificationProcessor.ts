import { prisma } from '@/lib/prisma';
import { sendBookingEmails, buildCustomerHtml, buildCoachHtml } from '@/lib/email';

export async function processNotificationQueue() {
  console.log('🔄 Processing notification queue...');
  
  const notifications = await prisma.notificationQueue.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: new Date() },
      attempts: { lt: 3 },
    },
    take: 10,
    orderBy: { scheduledFor: 'asc' },
  });
  
  console.log(`Found ${notifications.length} notifications to process`);
  
  for (const notification of notifications) {
    try {
      console.log(`📧 Processing notification: ${notification.type} (ID: ${notification.id})`);
      
      await prisma.notificationQueue.update({
        where: { id: notification.id },
        data: { 
          status: 'PROCESSING',
          lastAttempt: new Date(),
          attempts: { increment: 1 },
        },
      });
      
      await processNotification(notification);
      
      await prisma.notificationQueue.update({
        where: { id: notification.id },
        data: { 
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });
      
      console.log(`✅ Notification processed successfully: ${notification.id}`);
    } catch (error) {
      console.error(`❌ Error processing notification ${notification.id}:`, error);
      
      await prisma.notificationQueue.update({
        where: { id: notification.id },
        data: { 
          status: notification.attempts >= 2 ? 'FAILED' : 'PENDING',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}

async function processNotification(notification: any) {
  const data = notification.data;
  
  switch (notification.type) {
    case 'BOOKING_REQUEST':
      await sendBookingRequestEmail(data, notification.recipientId);
      break;
    case 'BOOKING_REMINDER':
      await sendBookingReminderEmail(data, notification.recipientId);
      break;
    case 'BOOKING_APPROVED':
      await sendBookingApprovedEmail(data);
      break;
    case 'BOOKING_DENIED':
      await sendBookingDeniedEmail(data);
      break;
    case 'BOOKING_EXPIRED':
      await sendBookingExpiredEmail(data);
      break;
    default:
      throw new Error(`Unknown notification type: ${notification.type}`);
  }
}

async function sendBookingRequestEmail(data: any, coachId: string) {
  console.log('📧 Sending booking request email to coach');
  
  // Get coach details
  const coach = await prisma.coachProfile.findUnique({
    where: { id: coachId },
    include: { user: true }
  });
  
  if (!coach || !coach.user?.email) {
    throw new Error('Coach not found or no email');
  }
  
  const approvalUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/api/booking/approve?token=${data.approvalToken}&action=approve`;
  const denyUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/api/booking/approve?token=${data.approvalToken}&action=deny`;
  const dashboardUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/dashboard/bookings`;
  
  const subject = `🏃‍♀️ New Private Lesson Request - ${data.customerName}`;
  
  const htmlCoach = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #1d4ed8; margin-bottom: 20px;">New Private Lesson Request</h2>
        
        <p>Hi ${coach.user.name || 'Coach'},</p>
        
        <p>You have a new private lesson request that needs your approval:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Athlete:</strong> ${data.athleteName}</p>
          <p><strong>Requested Time:</strong> ${new Date(data.startTime).toLocaleString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit',
            timeZone: 'America/Los_Angeles'
          })} PT</p>
          <p style="color: #ef4444; font-size: 14px;">
            ⏰ This request will expire 1 hour before the lesson time
          </p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${approvalUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-right: 10px;">
            ✓ Approve Request
          </a>
          <a href="${denyUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            ✗ Deny Request
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">
          You can also manage this request in your <a href="${dashboardUrl}" style="color: #1d4ed8;">coach dashboard</a>.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated message from Spirit Athletics. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
  
  await sendBookingEmails({
    customerEmail: '', // No customer email for this notification
    coachEmails: [coach.user.email],
    subject,
    htmlCustomer: '',
    htmlCoach,
    icsContent: '', // No ICS for approval requests
  });
}

async function sendBookingReminderEmail(data: any, coachId: string) {
  console.log('📧 Sending booking reminder email to coach');
  
  // Get coach details
  const coach = await prisma.coachProfile.findUnique({
    where: { id: coachId },
    include: { user: true }
  });
  
  if (!coach || !coach.user?.email) {
    throw new Error('Coach not found or no email');
  }
  
  const approvalUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/api/booking/approve?token=${data.approvalToken}&action=approve`;
  const denyUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL}/api/booking/approve?token=${data.approvalToken}&action=deny`;
  
  const subject = `⏰ Reminder: Private Lesson Request Expires Soon`;
  
  const htmlCoach = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #ef4444; margin-bottom: 20px;">⏰ Reminder: Approval Request Expires Soon</h2>
        
        <p>Hi ${coach.user.name || 'Coach'},</p>
        
        <p>You have a pending private lesson request that will expire soon if not approved or denied.</p>
        
        <div style="margin: 30px 0;">
          <a href="${approvalUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-right: 10px;">
            ✓ Approve Request
          </a>
          <a href="${denyUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            ✗ Deny Request
          </a>
        </div>
      </div>
    </div>
  `;
  
  await sendBookingEmails({
    customerEmail: '',
    coachEmails: [coach.user.email],
    subject,
    htmlCustomer: '',
    htmlCoach,
    icsContent: '',
  });
}

async function sendBookingApprovedEmail(data: any) {
  console.log('📧 Sending booking approved email');
  // Implementation for approved booking email
}

async function sendBookingDeniedEmail(data: any) {
  console.log('📧 Sending booking denied email');
  // Implementation for denied booking email
}

async function sendBookingExpiredEmail(data: any) {
  console.log('📧 Sending booking expired email');
  // Implementation for expired booking email
}

// Auto-expire handler
export async function processExpiredBookings() {
  console.log('🔄 Processing expired bookings...');
  
  const expired = await prisma.booking.updateMany({
    where: {
      approvalStatus: 'PENDING',
      autoExpireAt: { lte: new Date() },
    },
    data: {
      approvalStatus: 'EXPIRED',
      status: 'CANCELLED',
    },
  });
  
  if (expired.count > 0) {
    console.log(`⏰ Auto-expired ${expired.count} bookings`);
  }
  
  return expired.count;
}
