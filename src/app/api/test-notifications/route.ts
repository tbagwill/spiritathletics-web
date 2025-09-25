import { NextRequest, NextResponse } from 'next/server';
import { processNotificationQueue, processExpiredBookings } from '@/lib/jobs/notificationProcessor';

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Testing notification processing...');
    
    // Process notification queue and expired bookings
    await Promise.all([
      processNotificationQueue(),
      processExpiredBookings(),
    ]);
    
    console.log('✅ Test notification processing completed');
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      message: 'Test notifications processed successfully'
    });
    
  } catch (error) {
    console.error('❌ Test notification processing failed:', error);
    return NextResponse.json(
      { 
        error: 'Test processing failed', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// Also handle POST requests
export async function POST(req: NextRequest) {
  return GET(req);
}
