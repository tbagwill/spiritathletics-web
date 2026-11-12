import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Active coaches for pickers (e.g. assigning coaches to a class). Any signed-in staff member. */
export async function GET() {
  const session = await getServerSession(authOptions as any);
  const email = (session as any)?.user?.email as string | undefined;
  if (!email) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || (user.role !== 'ADMIN' && user.role !== 'COACH')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const coaches = await prisma.coachProfile.findMany({
    where: { isActive: true, user: { isActive: true } },
    select: { id: true, userId: true, user: { select: { name: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  return NextResponse.json(
    {
      ok: true,
      coaches: coaches.map((c) => ({ id: c.id, name: c.user.name ?? 'Coach', isMe: c.userId === user.id })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
