import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Only allow in development or if specific debug header is present
  const debugKey = req.headers.get('x-debug-key');
  if (process.env.NODE_ENV === 'production' && debugKey !== process.env.DEBUG_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Present' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing',
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Present (hidden)' : '❌ Missing',
    };

    // Test database connection
    let dbCheck = '❌ Failed';
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      dbCheck = '✅ Connected';
    } catch (error) {
      console.error('DB connection error:', error);
      dbCheck = `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Check if any users exist
    let sampleUser = null;
    try {
      const user = await prisma.user.findFirst({
        where: { role: { in: ['COACH', 'ADMIN'] } },
        select: { id: true, email: true, role: true, passwordHash: true }
      });
      sampleUser = user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.passwordHash
      } : 'No coach/admin users found';
    } catch (error) {
      sampleUser = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      environment: envCheck,
      database: {
        status: dbCheck,
        userCount,
        sampleUser
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
