import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const QuerySchema = z.object({
  range: z.enum(['1h', '6h', '24h', '7d', '30d']).default('1h'),
  type: z.enum(['API_LATENCY', 'DATABASE_QUERY', 'ERROR_RATE', 'BOOKING_RATE']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !(session as any)?.user?.role || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = QuerySchema.parse({
      range: searchParams.get('range') || '1h',
      type: searchParams.get('type') || undefined,
    });

    // Calculate time range
    const now = new Date();
    const timeRanges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '6h': new Date(now.getTime() - 6 * 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    const fromTime = timeRanges[query.range];

    // Build where clause
    const whereClause: any = {
      timestamp: { gte: fromTime }
    };
    if (query.type) {
      whereClause.type = query.type;
    }

    // Get metrics data
    const [metrics, performanceStats, errorStats, bookingStats] = await Promise.all([
      // Raw metrics
      prisma.systemMetric.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: 1000, // Limit to prevent overwhelming response
      }),

      // Performance statistics
      prisma.performanceLog.aggregate({
        where: { timestamp: { gte: fromTime } },
        _avg: { duration: true },
        _max: { duration: true },
        _count: true,
      }),

      // Error statistics
      prisma.errorLog.aggregate({
        where: { 
          timestamp: { gte: fromTime },
          level: { in: ['ERROR', 'CRITICAL'] }
        },
        _count: { level: true },
      }),

      // Booking statistics
      prisma.booking.aggregate({
        where: { createdAt: { gte: fromTime } },
        _count: true,
      }),
    ]);

    // Calculate derived metrics
    const totalRequests = performanceStats._count;
    const errorCount = errorStats._count.level;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    const avgLatency = performanceStats._avg.duration || 0;
    const maxLatency = performanceStats._max.duration || 0;

    // Group metrics by time buckets for charting
    const bucketSize = getBucketSize(query.range);
    const buckets = groupMetricsByTime(metrics, bucketSize, fromTime, now);

    // Get top slow endpoints
    const slowEndpoints = await prisma.performanceLog.groupBy({
      by: ['route'],
      where: { 
        timestamp: { gte: fromTime },
        duration: { gt: 1000 } // > 1 second
      },
      _avg: { duration: true },
      _count: true,
      orderBy: { _avg: { duration: 'desc' } },
      take: 10,
    });

    return NextResponse.json({
      summary: {
        totalRequests,
        errorCount,
        errorRate: Math.round(errorRate * 100) / 100,
        avgLatency: Math.round(avgLatency),
        maxLatency,
        bookingsToday: bookingStats._count,
      },
      performance: {
        buckets,
        slowEndpoints: slowEndpoints.map(endpoint => ({
          route: endpoint.route,
          avgDuration: Math.round(endpoint._avg.duration || 0),
          count: endpoint._count,
        })),
      },
      timeRange: {
        from: fromTime.toISOString(),
        to: now.toISOString(),
        range: query.range,
      },
    });
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

function getBucketSize(range: string): number {
  switch (range) {
    case '1h': return 5 * 60 * 1000; // 5 minutes
    case '6h': return 30 * 60 * 1000; // 30 minutes
    case '24h': return 60 * 60 * 1000; // 1 hour
    case '7d': return 6 * 60 * 60 * 1000; // 6 hours
    case '30d': return 24 * 60 * 60 * 1000; // 24 hours
    default: return 5 * 60 * 1000;
  }
}

function groupMetricsByTime(metrics: any[], bucketSize: number, fromTime: Date, toTime: Date) {
  const buckets: { [key: string]: { timestamp: string; apiLatency: number; errorRate: number; count: number } } = {};
  
  // Initialize buckets
  for (let time = fromTime.getTime(); time <= toTime.getTime(); time += bucketSize) {
    const bucketKey = new Date(time).toISOString();
    buckets[bucketKey] = {
      timestamp: bucketKey,
      apiLatency: 0,
      errorRate: 0,
      count: 0,
    };
  }
  
  // Fill buckets with data
  metrics.forEach(metric => {
    const bucketTime = Math.floor(metric.timestamp.getTime() / bucketSize) * bucketSize;
    const bucketKey = new Date(bucketTime).toISOString();
    
    if (buckets[bucketKey]) {
      buckets[bucketKey].count++;
      
      if (metric.type === 'API_LATENCY') {
        buckets[bucketKey].apiLatency += metric.value;
      } else if (metric.type === 'ERROR_RATE') {
        buckets[bucketKey].errorRate += metric.value;
      }
    }
  });
  
  // Calculate averages
  return Object.values(buckets).map(bucket => ({
    ...bucket,
    apiLatency: bucket.count > 0 ? Math.round(bucket.apiLatency / bucket.count) : 0,
    errorRate: bucket.count > 0 ? Math.round((bucket.errorRate / bucket.count) * 100) / 100 : 0,
  }));
}

export const dynamic = 'force-dynamic';
