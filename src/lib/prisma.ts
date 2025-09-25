import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  // Set up monitoring event listeners
  client.$on('query', async (e) => {
    // Only track slow queries to avoid overwhelming the monitoring system
    if (e.duration > 100) { // > 100ms
      try {
        const { monitoring } = await import('@/lib/monitoring');
        await monitoring.trackDatabaseQuery(e.query, e.duration, e.target);
      } catch (error) {
        console.error('Failed to track database query:', error);
      }
    }
  });

  client.$on('error', async (e) => {
    try {
      const { trackError } = await import('@/lib/monitoring');
      await trackError(new Error(e.message), {
        target: e.target,
        timestamp: e.timestamp,
        database: true
      });
    } catch (error) {
      console.error('Failed to track database error:', error);
    }
  });

  client.$on('warn', async (e) => {
    console.warn('Database warning:', e);
  });

  return client;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 