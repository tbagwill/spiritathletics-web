import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { processNotificationQueue, processExpiredBookings } from '@/lib/jobs/notificationProcessor';

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !(session as any)?.user?.role || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Manual notification processing triggered by admin');
    
    // Process notification queue
    await processNotificationQueue();
    
    // Process expired bookings
    const expiredCount = await processExpiredBookings();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification processing completed',
      expiredBookings: expiredCount
    });
    
  } catch (error) {
    console.error('❌ Error processing notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}
