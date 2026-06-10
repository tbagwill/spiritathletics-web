import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const coach = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || !booking.isManualBlock || booking.coachId !== coach.id) {
    return NextResponse.json({ ok: false, error: 'Reservation not found' }, { status: 404 });
  }

  await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  return NextResponse.json({ ok: true });
}
