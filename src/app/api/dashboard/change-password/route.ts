import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { compare, hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  const email = (session as any)?.user?.email as string | undefined;
  if (!userId && !email) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: userId ? { id: userId } : { email: email! } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 });
  }

  const ok = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'Current password is incorrect' }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
