import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const coach = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const rule = await prisma.availabilityRule.findUnique({ where: { id: resolvedParams.id } });
  if (!rule || rule.coachId !== coach.id) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  await prisma.availabilityRule.delete({ where: { id: resolvedParams.id } });
  return NextResponse.json({ ok: true });
}
