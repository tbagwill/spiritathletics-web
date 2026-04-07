import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const now = new Date();

    const clinics = await prisma.clinic.findMany({
      where: {
        isActive: true,
        endDateTimeUTC: { gte: now }, // only upcoming/ongoing clinics
      },
      orderBy: { dateTimeUTC: 'asc' },
      include: {
        registrations: {
          where: { status: 'CONFIRMED' },
          select: {
            id: true,
            athleteFirstName: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, clinics });
  } catch (e: any) {
    console.error('Error fetching clinics:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load clinics' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
