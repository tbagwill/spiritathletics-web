import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { monitoring } from '@/lib/monitoring';

export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !(session as any)?.user?.role || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get system health from monitoring service
    const health = await monitoring.getSystemHealth();
    
    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check endpoint error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        checks: { database: false, errorRate: false, latency: false, queue: false },
        metrics: { errorRate: -1, avgLatency: -1, queueSize: -1 }
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
