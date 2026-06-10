import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { createPasswordResetToken } from '@/lib/passwordReset';
import { buildPasswordResetHtml } from '@/lib/email';
import { createAuditLog } from '@/lib/auditLog';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || (target.role !== 'COACH' && target.role !== 'ADMIN')) {
    return NextResponse.json({ ok: false, error: 'Coach not found' }, { status: 404 });
  }

  const token = await createPasswordResetToken(target.email);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BASE_PROD_URL ||
    process.env.NEXTAUTH_URL ||
    'https://spiritathletics.net';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `Spirit Athletics <${SENDER}>`,
      to: [target.email],
      subject: 'Reset your Spirit Athletics dashboard password',
      html: buildPasswordResetHtml(target.name || 'Coach', resetUrl),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Failed to send reset email' }, { status: 500 });
  }

  await createAuditLog({
    actorUserId: admin.id,
    action: 'SEND_PASSWORD_RESET',
    entity: 'User',
    entityId: id,
    meta: { email: target.email },
  });

  return NextResponse.json({ ok: true });
}
