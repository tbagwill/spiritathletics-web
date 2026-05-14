import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

async function requireCoachOrAdmin() {
  const session = await getServerSession(authOptions as any);
  const email = (session as any)?.user?.email as string | undefined;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'COACH')) return null;
  return user;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ regId: string }> }) {
  const user = await requireCoachOrAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { regId } = await params;
  const url = new URL(req.url);
  const shouldRefund = url.searchParams.get('refund') === 'true';

  const reg = await prisma.clinicRegistration.findUnique({ where: { id: regId } });
  if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  if (reg.status === 'CANCELLED') return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });

  let refunded = false;

  if (shouldRefund && reg.paymentMethod === 'CARD' && reg.stripeSessionId && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(reg.stripeSessionId);
      if (session.payment_intent) {
        const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;

        const siblingCount = await prisma.clinicRegistration.count({
          where: { stripeSessionId: reg.stripeSessionId, status: 'CONFIRMED' },
        });

        if (siblingCount <= 1) {
          await stripe.refunds.create({ payment_intent: piId });
        } else {
          const clinic = await prisma.clinic.findUnique({ where: { id: reg.clinicId } });
          if (clinic) {
            await stripe.refunds.create({ payment_intent: piId, amount: clinic.priceCents });
          }
        }
        refunded = true;
      }
    } catch (err) {
      console.error('Stripe refund error:', err);
      return NextResponse.json({ error: 'Stripe refund failed. Registration was NOT removed.' }, { status: 500 });
    }
  }

  await prisma.clinicRegistration.update({
    where: { id: regId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  return NextResponse.json({ ok: true, refunded });
}
