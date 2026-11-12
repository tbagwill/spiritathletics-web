import type { Prisma } from '@prisma/client';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendBookingUnavailableRefundEmail } from '@/lib/email';

/**
 * Thrown when a booking can't be fulfilled because the class/clinic is full,
 * cancelled, or gone. Unlike other errors, retrying won't help, so the Stripe
 * webhook refunds instead of asking Stripe to retry.
 */
export class CapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CapacityError';
  }
}

/**
 * Row-locks a class session for the rest of the transaction. Concurrent bookings
 * for the same session wait here, so each one counts spots after the previous
 * one has committed. Other sessions are unaffected.
 */
export async function lockClassOccurrence(tx: Prisma.TransactionClient, classOccurrenceId: string) {
  await tx.$queryRaw`SELECT "id" FROM "ClassOccurrence" WHERE "id" = ${classOccurrenceId} FOR UPDATE`;
}

/** Same as lockClassOccurrence, for clinics. */
export async function lockClinic(tx: Prisma.TransactionClient, clinicId: string) {
  await tx.$queryRaw`SELECT "id" FROM "Clinic" WHERE "id" = ${clinicId} FOR UPDATE`;
}

/** Locks a coach's schedule so two private lessons can't take the same time slot. */
export async function lockCoachSchedule(tx: Prisma.TransactionClient, coachId: string) {
  await tx.$queryRaw`SELECT "id" FROM "CoachProfile" WHERE "id" = ${coachId} FOR UPDATE`;
}

export function spotsLeftMessage(spotsLeft: number) {
  const n = Math.max(0, spotsLeft);
  return n === 0 ? 'This is now full.' : `Only ${n} spot${n !== 1 ? 's' : ''} remaining`;
}

const REFUND_AUDIT_ACTION = 'BOOKING_UNAVAILABLE_REFUNDED';

/**
 * A card payment went through for a class/clinic that filled up (or was cancelled)
 * while the family was paying. Refund in full, record it, and tell the customer.
 * Safe to call again for the same session (webhook redelivery): it won't refund
 * or email twice.
 */
export async function refundUnavailableCheckout(
  session: Stripe.Checkout.Session,
  details: { kind: 'CLASS' | 'CLINIC'; title: string; when: string | null; reason: string },
) {
  const already = await prisma.auditLog.findFirst({
    where: { action: REFUND_AUDIT_ACTION, entity: 'CheckoutSession', entityId: session.id },
    select: { id: true },
  });
  if (already) return;

  const meta = session.metadata || {};
  const customerEmail = meta.customerEmail || session.customer_details?.email || '';
  const customerName = meta.customerName || session.customer_details?.name || '';
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  let refunded = false;
  try {
    if (paymentIntentId && stripe) {
      await stripe.refunds.create(
        { payment_intent: paymentIntentId, reason: 'requested_by_customer' },
        { idempotencyKey: `unavailable-refund-${session.id}` },
      );
      refunded = true;
    }
  } catch (err) {
    console.error(`Refund failed for unavailable ${details.kind} booking (session ${session.id})`, err);
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: null,
      action: REFUND_AUDIT_ACTION,
      entity: 'CheckoutSession',
      entityId: session.id,
      meta: {
        kind: details.kind,
        title: details.title,
        reason: details.reason,
        customerEmail,
        paymentIntentId,
        refunded,
        classOccurrenceId: meta.classOccurrenceId ?? null,
        clinicId: meta.clinicId ?? null,
      },
    },
  }).catch((err) => console.error('Failed to write refund audit log', err));

  if (customerEmail) {
    try {
      await sendBookingUnavailableRefundEmail({
        to: customerEmail,
        customerName,
        kind: details.kind,
        title: details.title,
        when: details.when,
        refunded,
      });
    } catch (err) {
      console.error('Failed to send booking-unavailable email', err);
    }
  }
}
