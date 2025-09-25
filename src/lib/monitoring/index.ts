import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export interface Metric {
  type: 'API_LATENCY' | 'DATABASE_QUERY' | 'MEMORY_USAGE' | 'CACHE_HIT_RATE' | 'BOOKING_RATE' | 'ERROR_RATE';
  name: string;
  value: number;
  metadata?: any;
}

export interface ErrorContext {
  userId?: string;
  url?: string;
  userAgent?: string;
  componentStack?: string;
  [key: string]: any;
}

class MonitoringService {
  private static instance: MonitoringService;
  private metricsQueue: Metric[] = [];
  private flushInterval: NodeJS.Timeout;
  private isShuttingDown = false;

  static getInstance(): MonitoringService {
    if (!this.instance) {
      this.instance = new MonitoringService();
    }
    return this.instance;
  }

  private constructor() {
    // Flush metrics every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flushMetrics().catch(console.error);
    }, 10000);

    // Note: Graceful shutdown handlers are disabled to maintain Edge Runtime compatibility
    // In production, the monitoring service will shut down when the process exits
  }

  async trackMetric(metric: Metric): Promise<void> {
    if (this.isShuttingDown) return;
    
    this.metricsQueue.push({
      ...metric,
      metadata: metric.metadata || {}
    });
    
    // Immediate flush for critical errors or high-priority metrics
    if (metric.type === 'ERROR_RATE' && metric.value > 0.1) { // >10% error rate
      await this.flushMetrics();
    }
  }

  async trackAPICall(req: NextRequest, res: NextResponse, duration: number): Promise<void> {
    if (this.isShuttingDown) return;

    try {
      await prisma.performanceLog.create({
        data: {
          route: req.nextUrl.pathname,
          method: req.method,
          statusCode: res.status || 200,
          duration,
        }
      });

      // Track slow API calls as metrics
      if (duration > 1000) { // > 1 second
        await this.trackMetric({
          type: 'API_LATENCY',
          name: req.nextUrl.pathname,
          value: duration,
          metadata: {
            method: req.method,
            statusCode: res.status,
            slow: true
          }
        });
      }
    } catch (error) {
      console.error('Failed to track API call:', error);
    }
  }

  async trackError(error: Error, context?: ErrorContext): Promise<void> {
    if (this.isShuttingDown) return;

    try {
      await prisma.errorLog.create({
        data: {
          level: 'ERROR',
          message: error.message,
          stack: error.stack,
          context: context || {},
          userId: context?.userId,
          url: context?.url,
          userAgent: context?.userAgent,
        }
      });

      // Track error rate metric
      await this.trackMetric({
        type: 'ERROR_RATE',
        name: 'application_errors',
        value: 1,
        metadata: {
          errorType: error.constructor.name,
          message: error.message,
          url: context?.url
        }
      });
    } catch (dbError) {
      console.error('Failed to track error:', dbError);
    }
  }

  async trackCriticalError(error: Error, context?: ErrorContext): Promise<void> {
    if (this.isShuttingDown) return;

    try {
      await prisma.errorLog.create({
        data: {
          level: 'CRITICAL',
          message: error.message,
          stack: error.stack,
          context: context || {},
          userId: context?.userId,
          url: context?.url,
          userAgent: context?.userAgent,
        }
      });

      // Immediate flush for critical errors
      await this.flushMetrics();
    } catch (dbError) {
      console.error('Failed to track critical error:', dbError);
    }
  }

  async trackDatabaseQuery(query: string, duration: number, target?: string): Promise<void> {
    if (this.isShuttingDown) return;

    // Only track slow queries to avoid overwhelming the system
    if (duration > 100) { // > 100ms
      await this.trackMetric({
        type: 'DATABASE_QUERY',
        name: 'slow_query',
        value: duration,
        metadata: {
          query: query.substring(0, 200), // Truncate long queries
          target,
          slow: true
        }
      });
    }
  }

  async trackBookingEvent(eventType: 'created' | 'cancelled' | 'approved' | 'denied'): Promise<void> {
    if (this.isShuttingDown) return;

    await this.trackMetric({
      type: 'BOOKING_RATE',
      name: `booking_${eventType}`,
      value: 1,
      metadata: {
        eventType,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsQueue.length === 0) return;
    
    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];
    
    try {
      // Convert metrics to database format
      const dbMetrics = metrics.map(metric => ({
        type: metric.type,
        name: metric.name,
        value: metric.value,
        metadata: metric.metadata,
      }));

      await prisma.systemMetric.createMany({
        data: dbMetrics
      });
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-queue metrics for retry (but limit to prevent memory leaks)
      if (this.metricsQueue.length < 1000) {
        this.metricsQueue.unshift(...metrics.slice(0, 100));
      }
    }
  }

  private async shutdown(): Promise<void> {
    console.log('Shutting down monitoring service...');
    this.isShuttingDown = true;
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Final flush
    await this.flushMetrics();
    console.log('Monitoring service shutdown complete');
  }

  // Health check method
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    metrics: {
      errorRate: number;
      avgLatency: number;
      queueSize: number;
    }
  }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check recent error rate
      const recentErrors = await prisma.errorLog.count({
        where: {
          timestamp: { gte: oneHourAgo },
          level: { in: ['ERROR', 'CRITICAL'] }
        }
      });

      // Check average API latency
      const avgLatency = await prisma.performanceLog.aggregate({
        where: {
          timestamp: { gte: oneHourAgo }
        },
        _avg: {
          duration: true
        }
      });

      const checks = {
        database: true, // If we got here, DB is working
        errorRate: recentErrors < 10, // < 10 errors per hour
        latency: (avgLatency._avg.duration || 0) < 2000, // < 2 seconds average
        queue: this.metricsQueue.length < 100 // Queue not backing up
      };

      const allHealthy = Object.values(checks).every(Boolean);
      const status = allHealthy ? 'healthy' : 
                   checks.database && checks.queue ? 'degraded' : 'unhealthy';

      return {
        status,
        checks,
        metrics: {
          errorRate: recentErrors,
          avgLatency: avgLatency._avg.duration || 0,
          queueSize: this.metricsQueue.length
        }
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        checks: { database: false, errorRate: false, latency: false, queue: false },
        metrics: { errorRate: -1, avgLatency: -1, queueSize: this.metricsQueue.length }
      };
    }
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Convenience functions
export const trackError = (error: Error, context?: ErrorContext) => 
  monitoring.trackError(error, context);

export const trackCriticalError = (error: Error, context?: ErrorContext) => 
  monitoring.trackCriticalError(error, context);

export const trackMetric = (metric: Metric) => 
  monitoring.trackMetric(metric);

export const trackBookingEvent = (eventType: 'created' | 'cancelled' | 'approved' | 'denied') =>
  monitoring.trackBookingEvent(eventType);

export default MonitoringService;
