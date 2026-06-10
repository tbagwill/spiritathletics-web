import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEmailForResetToken, consumePasswordResetToken } from '@/lib/passwordReset';
import { rateLimitHit } from '@/lib/rateLimit';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: validate a token (used by the page to show a valid/invalid state)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const email = await getEmailForResetToken(token);
  if (!email) return NextResponse.json({ ok: false, error: 'Invalid or expired link' }, { status: 400 });
  return NextResponse.json({ ok: true });
}

const ResetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

// POST: consume the token and set the new password
export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  if (!rateLimitHit(`reset:${ip}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  const json = await req.json();
  const parsed = ResetSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const email = await consumePasswordResetToken(parsed.data.token);
  if (!email) return NextResponse.json({ ok: false, error: 'Invalid or expired link' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 });

  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
