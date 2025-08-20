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

  const tpl = await prisma.classTemplate.findUnique({ where: { id: resolvedParams.id }, include: { service: true } });
  if (!tpl || tpl.service.coachId !== coach.id) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  // Delete in proper order to handle foreign key constraints
  // First delete any class occurrences
  await prisma.classOccurrence.deleteMany({ where: { classTemplateId: resolvedParams.id } });
  // Then delete the template
  await prisma.classTemplate.delete({ where: { id: resolvedParams.id } });
  // Finally delete the service if it has no other dependencies
  await prisma.service.delete({ where: { id: tpl.serviceId } });

  return NextResponse.json({ ok: true });
}
