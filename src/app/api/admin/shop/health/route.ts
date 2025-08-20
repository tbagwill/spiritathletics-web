import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isStripeConfigured } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    // Check database connectivity
    const dbCheck = await prisma.shopOrder.count().catch(() => null);
    const dbHealthy = dbCheck !== null;

    // Check Stripe configuration
    const stripeHealthy = isStripeConfigured();

    // Basic order metrics
    const lookupStats = {
      total: 0,
      successful: 0,
      successRate: 'N/A',
      strategyUsage: {}
    };

    // Check recent orders
    const recentOrders = await prisma.shopOrder.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        stripePaymentId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }).catch(() => []);

    // Detect potential session ID issues
    const sessionIdIssues = recentOrders.filter(order => 
      !order.stripePaymentId || 
      order.stripePaymentId.length < 20 || 
      !order.stripePaymentId.startsWith('cs_')
    );

    const health = {
      status: dbHealthy && stripeHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      components: {
        database: {
          status: dbHealthy ? 'up' : 'down',
          orderCount: dbCheck
        },
        stripe: {
          status: stripeHealthy ? 'configured' : 'misconfigured'
        },
        orderLookup: {
          ...lookupStats,
          potentialIssues: sessionIdIssues.length
        }
      },
      recentOrders: recentOrders.length,
      potentialSessionIdIssues: sessionIdIssues.length,
      alerts: [] as string[]
    };

    // Add alerts for issues
    if (!dbHealthy) {
      health.alerts.push('Database connectivity issue detected');
    }
    if (!stripeHealthy) {
      health.alerts.push('Stripe configuration incomplete');
    }
    if (sessionIdIssues.length > 0) {
      health.alerts.push(`${sessionIdIssues.length} orders with potential session ID issues`);
    }
    if (lookupStats.total > 0 && parseFloat(lookupStats.successRate || '0') < 95) {
      health.alerts.push(`Order lookup success rate below 95%: ${lookupStats.successRate}`);
    }

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        alerts: ['System health check encountered an error']
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
