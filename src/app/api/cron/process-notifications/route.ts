import { NextRequest, NextResponse } from 'next/server';
import { processNotificationQueue, processExpiredBookings } from '@/lib/jobs/notificationProcessor';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🔄 Cron job started: Processing notifications...');
    
    // Process notification queue and expired bookings
    await Promise.all([
      processNotificationQueue(),
      processExpiredBookings(),
    ]);
    
    console.log('✅ Cron job completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      message: 'Notifications processed successfully'
    });
    
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// Also handle POST requests for manual testing
export async function POST(req: NextRequest) {
  return GET(req);
}
