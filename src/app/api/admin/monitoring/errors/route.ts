import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const QuerySchema = z.object({
  range: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
  level: z.enum(['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']).optional(),
  resolved: z.enum(['true', 'false', 'all']).default('all'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
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
      range: searchParams.get('range') || '24h',
      level: searchParams.get('level') || undefined,
      resolved: searchParams.get('resolved') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
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
    
    if (query.level) {
      whereClause.level = query.level;
    }
    
    if (query.resolved !== 'all') {
      whereClause.resolved = query.resolved === 'true';
    }

    // Get paginated errors
    const [errors, totalCount, errorsByLevel] = await Promise.all([
      prisma.errorLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          level: true,
          message: true,
          url: true,
          timestamp: true,
          resolved: true,
          resolvedAt: true,
          resolvedBy: true,
          context: true,
        },
      }),
      
      prisma.errorLog.count({ where: whereClause }),
      
      // Error distribution by level
      prisma.errorLog.groupBy({
        by: ['level'],
        where: { timestamp: { gte: fromTime } },
        _count: true,
        orderBy: { _count: { level: 'desc' } },
      }),
    ]);

    // Get error trends (hourly buckets for last 24h)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const errorTrends = await prisma.$queryRaw<Array<{ hour: Date; count: number }>>`
      SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as count
      FROM "ErrorLog"
      WHERE timestamp >= ${oneDayAgo}
        AND level IN ('ERROR', 'CRITICAL')
      GROUP BY hour
      ORDER BY hour
    `;

    // Get most common error messages
    const commonErrors = await prisma.errorLog.groupBy({
      by: ['message'],
      where: {
        timestamp: { gte: fromTime },
        level: { in: ['ERROR', 'CRITICAL'] }
      },
      _count: true,
      orderBy: { _count: { message: 'desc' } },
      take: 10,
    });

    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      errors: errors.map(error => ({
        ...error,
        // Sanitize context for frontend (remove sensitive data)
        context: error.context ? sanitizeContext(error.context as any) : null,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
      statistics: {
        byLevel: errorsByLevel.reduce((acc, item) => {
          acc[item.level] = item._count;
          return acc;
        }, {} as Record<string, number>),
        trends: errorTrends.map(trend => ({
          timestamp: trend.hour.toISOString(),
          count: Number(trend.count),
        })),
        commonErrors: commonErrors.map(error => ({
          message: error.message.substring(0, 100), // Truncate long messages
          count: error._count,
        })),
      },
      timeRange: {
        from: fromTime.toISOString(),
        to: now.toISOString(),
        range: query.range,
      },
    });
  } catch (error) {
    console.error('Errors endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !(session as any)?.user?.role || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { errorIds, resolved } = await req.json();
    
    if (!Array.isArray(errorIds) || typeof resolved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Update error resolution status
    const result = await prisma.errorLog.updateMany({
      where: { id: { in: errorIds } },
      data: {
        resolved,
        resolvedAt: resolved ? new Date() : null,
        resolvedBy: resolved ? (session as any).user.id : null,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error resolution endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to update errors' },
      { status: 500 }
    );
  }
}

function sanitizeContext(context: any): any {
  if (!context || typeof context !== 'object') return context;
  
  const sensitive = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...context };
  
  for (const key in sanitized) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

export const dynamic = 'force-dynamic';
