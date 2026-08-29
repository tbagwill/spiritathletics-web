import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { refundClinicRegistrationIfPaid } from '@/lib/refund';
import { buildCancellationCustomerHtml, buildCancellationCoachHtml } from '@/lib/email';
import { formatPt } from '@/lib/time';
import { buildICS } from '@/lib/ics';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';

async function requireCoachOrAdmin() {
  const session = await getServerSession(authOptions as any);
  const email = (session as any)?.user?.email as string | undefined;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'COACH')) return null;
  return user;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ regId: string }> }) {
  const user = await requireCoachOrAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { regId } = await params;

  const reg = await prisma.clinicRegistration.findUnique({
    where: { id: regId },
    include: { clinic: true },
  });
  if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  if (reg.status === 'CANCELLED') return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });

  let refunded = false;
  try {
    const refund = await refundClinicRegistrationIfPaid(reg);
    refunded = refund.refunded;
  } catch (err) {
    console.error('Stripe refund failed on clinic remove:', err);
    return NextResponse.json({ error: 'Card refund failed. Registration was not removed.' }, { status: 500 });
  }

  await prisma.clinicRegistration.update({
    where: { id: regId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  const title = `Clinic: ${reg.clinic.title}`;
  const when = formatPt(reg.clinic.dateTimeUTC, "EEEE, MMMM d 'at' h:mm a 'PT'");
  const actorName = user.name || 'Staff';
  const location = reg.clinic.location || process.env.ORG_ADDRESS || 'Spirit Athletics';

  try {
    const ics = buildICS({
      uid: `clinic-reg-${reg.id}@spiritathletics.net`,
      start: reg.clinic.dateTimeUTC,
      end: reg.clinic.endDateTimeUTC,
      summary: `CANCELLED: ${reg.clinic.title}`,
      location,
      description: 'This clinic registration has been cancelled.',
      organizerEmail: SENDER,
      method: 'CANCEL',
    });

    await resend.emails.send({
      from: `Spirit Athletics <${SENDER}>`,
      to: [reg.customerEmail],
        subject: `[Clinic] Clinic Cancelled: ${reg.clinic.title}`,
      html: buildCancellationCustomerHtml(title, when, actorName, true, refunded, 'CLINIC'),
      attachments: [{ filename: 'cancel.ics', content: ics, contentType: 'text/calendar' }],
    });

    if (user.email) {
      await resend.emails.send({
        from: `Spirit Athletics <${SENDER}>`,
        to: [user.email],
        subject: `[Coach] [Clinic] Clinic Cancelled: ${reg.clinic.title}`,
        html: buildCancellationCoachHtml(title, when, reg.customerName, reg.athleteFirstName, true, refunded, 'CLINIC'),
        attachments: [{ filename: 'cancel.ics', content: ics, contentType: 'text/calendar' }],
      });
    }
  } catch (err) {
    console.error('Clinic cancellation email failed:', err);
  }

  return NextResponse.json({ ok: true, refunded });
}
