import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireCoachOrAdmin() {
  const session = await getServerSession(authOptions as any);
  const email = (session as any)?.user?.email as string | undefined;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'COACH')) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await requireCoachOrAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { athleteFirstName: { contains: search, mode: 'insensitive' as const } },
          { athleteLastName: { contains: search, mode: 'insensitive' as const } },
          { parentFirstName: { contains: search, mode: 'insensitive' as const } },
          { parentLastName: { contains: search, mode: 'insensitive' as const } },
          { parentEmail: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [waivers, total] = await Promise.all([
    prisma.waiver.findMany({
      where,
      orderBy: { signedAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        athleteFirstName: true,
        athleteLastName: true,
        parentFirstName: true,
        parentLastName: true,
        parentEmail: true,
        waiverVersion: true,
        signedAt: true,
        createdAt: true,
      },
    }),
    prisma.waiver.count({ where }),
  ]);

  return NextResponse.json({
    waivers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export const dynamic = 'force-dynamic';
