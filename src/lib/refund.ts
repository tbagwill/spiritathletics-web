import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export type RefundResult = {
  refunded: boolean;
  alreadyRefunded?: boolean;
};

/**
 * Refund a Stripe Checkout Session when a CARD payment was captured.
 * If this is the last active booking/registration on the session, refunds the
 * remaining charge in full (including card fee). Otherwise refunds `partialAmountCents`.
 *
 * Throws if Stripe is required (CARD + session) but the refund cannot be issued.
 */
export async function refundCheckoutSession(params: {
  stripeSessionId: string | null | undefined;
  paymentMethod?: string | null;
  remainingSiblings: number;
  partialAmountCents: number;
}): Promise<RefundResult> {
  const { stripeSessionId, paymentMethod, remainingSiblings, partialAmountCents } = params;

  if (paymentMethod !== 'CARD' || !stripeSessionId) {
    return { refunded: false };
  }
  if (!stripe) {
    throw new Error('Stripe is not configured; cannot refund this card payment.');
  }

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  if (session.payment_status !== 'paid' || !session.payment_intent) {
    return { refunded: false };
  }

  const piId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent.id;

  const charges = await stripe.charges.list({ payment_intent: piId, limit: 1 });
  const charge = charges.data[0];
  if (!charge) {
    throw new Error('Paid card charge not found; cannot issue a refund.');
  }

  const amountRefunded = charge.amount_refunded ?? 0;
  if (amountRefunded >= charge.amount) {
    return { refunded: true, alreadyRefunded: true };
  }

  const remainingCharge = charge.amount - amountRefunded;
  if (remainingCharge <= 0) {
    return { refunded: true, alreadyRefunded: true };
  }

  try {
    if (remainingSiblings <= 0) {
      await stripe.refunds.create({ payment_intent: piId });
    } else {
      const amount = Math.min(Math.max(partialAmountCents, 0), remainingCharge);
      if (amount <= 0) {
        return { refunded: false };
      }
      await stripe.refunds.create({ payment_intent: piId, amount });
    }
  } catch (err: unknown) {
    const code = typeof err === 'object' && err && 'code' in err ? String((err as { code?: string }).code) : '';
    if (code === 'charge_already_refunded') {
      return { refunded: true, alreadyRefunded: true };
    }
    throw err;
  }

  return { refunded: true };
}

export async function refundBookingIfPaid(booking: {
  id: string;
  stripeSessionId: string | null;
  paymentMethod: string;
  priceCents: number;
}): Promise<RefundResult> {
  const remainingSiblings = booking.stripeSessionId
    ? await prisma.booking.count({
        where: {
          stripeSessionId: booking.stripeSessionId,
          id: { not: booking.id },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      })
    : 0;

  return refundCheckoutSession({
    stripeSessionId: booking.stripeSessionId,
    paymentMethod: booking.paymentMethod,
    remainingSiblings,
    partialAmountCents: booking.priceCents,
  });
}

export async function refundClinicRegistrationIfPaid(reg: {
  id: string;
  stripeSessionId: string | null;
  paymentMethod: string;
  clinicId: string;
}): Promise<RefundResult> {
  const remainingSiblings = reg.stripeSessionId
    ? await prisma.clinicRegistration.count({
        where: {
          stripeSessionId: reg.stripeSessionId,
          id: { not: reg.id },
          status: 'CONFIRMED',
        },
      })
    : 0;

  const clinic = await prisma.clinic.findUnique({ where: { id: reg.clinicId }, select: { priceCents: true } });

  return refundCheckoutSession({
    stripeSessionId: reg.stripeSessionId,
    paymentMethod: reg.paymentMethod,
    remainingSiblings,
    partialAmountCents: clinic?.priceCents ?? 0,
  });
}
