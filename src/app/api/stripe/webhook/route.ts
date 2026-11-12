import { NextRequest, NextResponse } from 'next/server';
import { classCoachNames, joinNames } from '@/lib/classCoaches';
import { classCoachEmailRecipients } from '@/lib/classCoachesServer';
import { CapacityError, lockClassOccurrence, lockClinic, lockCoachSchedule, refundUnavailableCheckout } from '@/lib/capacity';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, getStripeConfig } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { generateOrderConfirmationEmail } from '@/lib/emailTemplates';
import { buildICS } from '@/lib/ics';
import { buildCustomerHtml, buildCoachHtml, sendBookingEmails, sendPendingRequestEmails, programSubjectPrefix } from '@/lib/email';
import { computePrivatePrice } from '@/lib/pricing';
import { formatPt } from '@/lib/time';
import { v4 as uuidv4 } from 'uuid';
import { generateQrToken, orderQrPayload, ticketPagePath } from '@/lib/ticketing';
import { sendTicketOrderEmail, sendTicketOrderFailedEmail } from '@/lib/ticketEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const { webhookSecret } = getStripeConfig();
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        try {
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        } catch (error) {
          console.error('Error processing checkout.session.completed:', error);
          throw error;
        }
        break;
      case 'charge.succeeded':
        break;
      case 'charge.updated':
        break;
      case 'charge.refunded':
        try {
          await handleChargeRefunded(event.data.object as Stripe.Charge);
        } catch (error) {
          console.error('Error processing charge.refunded:', error);
        }
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingType = session.metadata?.bookingType;

  if (bookingType === 'CLASS') {
    await handleClassBookingCompleted(session);
  } else if (bookingType === 'PRIVATE') {
    await handlePrivateBookingCompleted(session);
  } else if (bookingType === 'CLINIC') {
    await handleClinicRegistrationCompleted(session);
  } else if (bookingType === 'TICKET_ORDER') {
    await handleTicketOrderCompleted(session);
  } else {
    // Existing shop order flow
    await handleShopCheckoutCompleted(session);
  }
}

// ─── Ticket Orders (Spirit Spectacular etc.) ──────────────────────────────────

type TicketMetaItem = { tierId: string; quantity: number; unitPrice: number };

async function handleTicketOrderCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  const eventId = meta.eventId;
  const customerName = meta.customerName || '';
  const subtotalCents = parseInt(meta.subtotalCents || '0', 10) || 0;
  const feeCents = parseInt(meta.feeCents || '0', 10) || 0;
  const items: TicketMetaItem[] = meta.items ? JSON.parse(meta.items) : [];
  const email = session.customer_details?.email || session.customer_email || '';
  const paymentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || null;

  if (!eventId || !email || items.length === 0) {
    console.error('TICKET_ORDER missing fields', { eventId, email, items });
    return;
  }

  // Idempotency: if we've already created an order for this Stripe session, bail.
  const existing = await prisma.ticketOrder.findUnique({
    where: { stripeSessionId: session.id },
    include: { tickets: true },
  });
  if (existing) {
    return;
  }

  let created: {
    orderId: string;
    accessToken: string;
    tickets: { id: string; tierId: string; qrToken: string; priceCents: number }[];
  };
  try {
    created = await prisma.$transaction(async (tx) => {
      const ev = await tx.event.findUnique({ where: { id: eventId }, include: { tiers: true } });
      if (!ev) throw new Error('Event not found');

      const tiersById = new Map(ev.tiers.map((t) => [t.id, t]));

      // Atomic sold-count updates with capacity guard per tier.
      for (const item of items) {
        const tier = tiersById.get(item.tierId);
        if (!tier) throw new Error(`Unknown tier ${item.tierId}`);
        // Conditional update: only increment if remaining allows it.
        const affected = await tx.$executeRaw`
          UPDATE "TicketTier"
          SET "sold" = "sold" + ${item.quantity}
          WHERE "id" = ${tier.id}
            AND ("capacity" IS NULL OR "sold" + ${item.quantity} <= "capacity")
        `;
        if (Number(affected) !== 1) {
          throw new Error(`Capacity exceeded for ${tier.name}`);
        }
      }

      const totalCents = subtotalCents + feeCents;
      const order = await tx.ticketOrder.create({
        data: {
          eventId,
          email,
          customerName,
          subtotalCents,
          feeCents,
          totalCents,
          stripeSessionId: session.id,
          stripePaymentId: paymentId,
          accessToken: generateQrToken(),
          status: 'PAID',
        },
      });

      const ticketsCreated: { id: string; tierId: string; qrToken: string; priceCents: number }[] = [];
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const qrToken = generateQrToken();
          const t = await tx.ticket.create({
            data: {
              orderId: order.id,
              tierId: item.tierId,
              priceCents: item.unitPrice,
              qrToken,
              status: 'ACTIVE',
            },
          });
          ticketsCreated.push({ id: t.id, tierId: t.tierId, qrToken: t.qrToken, priceCents: t.priceCents });
        }
      }

      return { orderId: order.id, accessToken: order.accessToken, tickets: ticketsCreated };
    });
  } catch (err) {
    console.error('Ticket order fulfillment failed', err);
    // Payment went through but we couldn't fulfill — initiate a refund and alert.
    let refunded = false;
    try {
      if (paymentId && stripe) {
        await stripe.refunds.create({ payment_intent: paymentId });
        refunded = true;
      }
    } catch (refundErr) {
      console.error('Refund attempt also failed', refundErr);
    }
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        action: 'TICKET_ORDER_FULFILLMENT_FAILED',
        entity: 'Event',
        entityId: eventId,
        meta: {
          stripeSessionId: session.id,
          email,
          items,
          error: err instanceof Error ? err.message : String(err),
          refunded,
        },
      },
    }).catch(() => {});

    try {
      const ev = await prisma.event.findUnique({ where: { id: eventId }, select: { title: true } });
      await sendTicketOrderFailedEmail({
        to: email,
        customerName,
        eventTitle: ev?.title || 'Spirit Athletics event',
        refunded,
      });
    } catch (mailErr) {
      console.error('Failed to send ticket order failure email', mailErr);
    }
    return;
  }

  // Load fresh event + tier labels for the email.
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  const tiersById = new Map(
    (await prisma.ticketTier.findMany({ where: { eventId } })).map((t) => [t.id, t]),
  );
  if (!event) return;

  const ticketsForEmail = created.tickets.map((t) => ({
    id: t.id,
    tierName: tiersById.get(t.tierId)?.name || 'Ticket',
    priceCents: t.priceCents,
  }));
  const ticketsUrl = `${getStripeConfig().baseUrl}${ticketPagePath(created.accessToken)}`;

  const icsStart = event.doorsOpenUTC || event.startDateTimeUTC;
  const icsEnd = event.endDateTimeUTC || new Date(event.startDateTimeUTC.getTime() + 4 * 60 * 60 * 1000);
  const location = [event.venue, event.venueAddress].filter(Boolean).join(', ');
  const icsContent = buildICS({
    uid: `ticket-order-${created.orderId}@spiritathletics.net`,
    start: icsStart,
    end: icsEnd,
    summary: event.title,
    location: location || 'Spirit Athletics',
    description: `Your tickets: ${ticketsUrl}${event.doorsOpenUTC ? ` · Doors open ${formatPt(event.doorsOpenUTC, "h:mm a 'PT'")}` : ''}`,
    organizerEmail: process.env.TICKETS_SENDER_EMAIL || 'tickets@spiritathletics.net',
  });

  try {
    await sendTicketOrderEmail({
      to: email,
      event: {
        title: event.title,
        startDateTimeUTC: event.startDateTimeUTC,
        doorsOpenUTC: event.doorsOpenUTC,
        endDateTimeUTC: event.endDateTimeUTC,
        venue: event.venue,
        venueAddress: event.venueAddress,
      },
      order: {
        id: created.orderId,
        customerName,
        subtotalCents,
        feeCents,
        totalCents: subtotalCents + feeCents,
      },
      tickets: ticketsForEmail,
      ticketsUrl,
      checkinQrPayload: orderQrPayload(created.accessToken),
      icsContent,
    });
  } catch (err) {
    console.error('Failed to send ticket confirmation email', err);
    // We don't fail the webhook — tickets exist in DB; admin can resend.
  }
}

// ─── Class Booking ────────────────────────────────────────────────────────────

async function handleClassBookingCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata!;
  const { classOccurrenceId, serviceId, customerName, customerEmail, notes } = meta;

  // Support multi-athlete (new) and single-athlete (legacy) metadata
  let athleteNamesList: string[];
  if (meta.athleteNames) {
    athleteNamesList = JSON.parse(meta.athleteNames);
  } else {
    athleteNamesList = [meta.athleteName];
  }

  const existing = await prisma.booking.findFirst({ where: { stripeSessionId: session.id } });
  if (existing) return;

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      // Serialize bookings for this session so concurrent payments can't overbook it.
      await lockClassOccurrence(tx, classOccurrenceId);

      // Re-check under the lock: a redelivered webhook may have fulfilled this session already.
      const already = await tx.booking.findFirst({ where: { stripeSessionId: session.id }, select: { id: true } });
      if (already) return null;

      const occ = await tx.classOccurrence.findUnique({
        where: { id: classOccurrenceId },
        include: {
          classTemplate: {
            include: {
              service: { include: { coach: { include: { user: true } } } },
              coaches: { include: { coach: { include: { user: true } } }, orderBy: { createdAt: 'asc' } },
            },
          },
        },
      });
      if (!occ || occ.status !== 'SCHEDULED') throw new CapacityError('Class occurrence not available');

      const count = await tx.booking.count({ where: { classOccurrenceId, status: 'CONFIRMED' } });
      if (count + athleteNamesList.length > occ.capacity) throw new CapacityError('Class is full');

      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service) throw new CapacityError('Service not found');

      const bookings = [];
      for (const athleteName of athleteNamesList) {
        const cancellationToken = uuidv4();
        const booking = await tx.booking.create({
          data: {
            type: 'CLASS',
            status: 'CONFIRMED',
            customerName,
            customerEmail,
            athleteName,
            notes: notes || null,
            coachId: service.coachId,
            serviceId,
            classOccurrenceId,
            startDateTimeUTC: occ.startDateTimeUTC,
            endDateTimeUTC: new Date(occ.startDateTimeUTC.getTime() + (service.durationMinutes ?? 60) * 60000),
            priceCents: service.basePriceCents,
            paymentMethod: 'CARD',
            cancellationToken,
            stripeSessionId: session.id,
            numAthletes: 1,
          },
        });
        bookings.push(booking);
      }
      return { bookings, occ, service };
    });
  } catch (err) {
    if (!(err instanceof CapacityError)) throw err; // transient: let Stripe retry
    // Paid, but the class filled up (or was cancelled) during checkout. Refund instead of retrying.
    const occ = await prisma.classOccurrence.findUnique({
      where: { id: classOccurrenceId },
      include: { classTemplate: { include: { service: { select: { title: true } } } } },
    }).catch(() => null);
    await refundUnavailableCheckout(session, {
      kind: 'CLASS',
      title: occ?.classTemplate.service.title ?? 'Spirit Athletics class',
      when: occ ? formatPt(occ.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'") : null,
      reason: err.message,
    });
    return;
  }
  if (!result) return;

  // Emails go out after the transaction commits, so a slow email provider never holds the lock.
  const { bookings, occ, service } = result;
  try {
    const firstBooking = bookings[0];
    const coachEmails = await classCoachEmailRecipients(occ.classTemplateId, occ.classTemplate.service.coachId)
      .catch(() => [] as string[]);
    const coachNames = joinNames(classCoachNames(occ.classTemplate)) || 'Coach';
    const when = formatPt(occ.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
    const location = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
    const baseUrl = process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
    const cancelUrl = `${baseUrl}/cancel?token=${firstBooking.cancellationToken}`;
    const title = service.title;
    const allAthleteNames = athleteNamesList.join(', ');

    const ics = buildICS({
      uid: firstBooking.cancellationToken,
      start: occ.startDateTimeUTC,
      end: new Date(occ.startDateTimeUTC.getTime() + (service.durationMinutes ?? 60) * 60000),
      summary: `${title} — ${coachNames}`,
      location,
      description: `Cancel: ${cancelUrl}`,
      organizerEmail: process.env.SENDER_EMAIL || 'booking@spiritathletics.net',
      method: 'REQUEST',
    });

    const totalCents = service.basePriceCents * athleteNamesList.length;
    await sendBookingEmails({
      customerEmail,
      coachEmails,
      subject: `${programSubjectPrefix('CLASS')}Class Reserved & Paid: ${title} (${when})`,
      htmlCustomer: buildCustomerHtml(title, when, location, cancelUrl, {
        athleteNames: allAthleteNames,
        customerName,
        paymentMethod: 'CARD',
        priceCents: totalCents,
        coachName: coachNames,
        kind: 'CLASS',
      }),
      htmlCoach: buildCoachHtml(title, when, customerName, allAthleteNames, {
        paymentMethod: 'CARD',
        customerEmail,
        kind: 'CLASS',
        priceCents: totalCents,
      }),
      icsContent: ics,
    });
  } catch (err) {
    // The booking is saved; don't make Stripe retry (it would be a no-op anyway).
    console.error('Class booking confirmation email failed', err);
  }
}

// ─── Private Lesson Booking ───────────────────────────────────────────────────

async function handlePrivateBookingCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata!;
  const { coachId, serviceId, startDateTimeUTC, endDateTimeUTC, customerName, customerEmail, athleteName, selectionKind, selectionDuration } = meta;

  const existing = await prisma.booking.findFirst({ where: { stripeSessionId: session.id } });
  if (existing) return;

  const startUTC = new Date(startDateTimeUTC);
  const endUTC = new Date(endDateTimeUTC);

  const selection = selectionKind === 'SEMI_PRIVATE'
    ? { kind: 'SEMI_PRIVATE' as const, duration: 60 as const }
    : { kind: 'SOLO' as const, duration: Number(selectionDuration) as 30 | 45 | 60 };

  const pricing = computePrivatePrice(selection);

  await prisma.$transaction(async (tx) => {
    // Serialize bookings for this coach so concurrent payments can't take the same slot.
    await lockCoachSchedule(tx, coachId);
    // Final conflict check
    const overlapCount = await tx.booking.count({
      where: {
        coachId,
        status: 'CONFIRMED',
        OR: [
          { AND: [{ startDateTimeUTC: { lt: startUTC } }, { endDateTimeUTC: { gt: startUTC } }] },
          { AND: [{ startDateTimeUTC: { lt: endUTC } }, { endDateTimeUTC: { gt: endUTC } }] },
          { AND: [{ startDateTimeUTC: { gte: startUTC } }, { endDateTimeUTC: { lte: endUTC } }] },
          { AND: [{ startDateTimeUTC: { lte: startUTC } }, { endDateTimeUTC: { gte: endUTC } }] },
        ],
      },
    });
    if (overlapCount > 0) throw new Error('Time slot no longer available');

    const service = await tx.service.findUnique({
      where: { id: serviceId },
      include: { coach: { include: { user: true } } },
    });
    if (!service || service.type !== 'PRIVATE') throw new Error('Service not found');

    const settings = await tx.coachSettings.findUnique({ where: { coachId } }).catch(() => null);
    const requiresApproval = settings?.mustApproveRequests ?? false;
    const cancellationToken = uuidv4();

    const booking = await tx.booking.create({
      data: {
        type: 'PRIVATE',
        status: requiresApproval ? 'PENDING' : 'CONFIRMED',
        privateKind: pricing.privateKind as any,
        numAthletes: pricing.numAthletes,
        customerName,
        customerEmail,
        athleteName,
        coachId,
        serviceId,
        startDateTimeUTC: startUTC,
        endDateTimeUTC: endUTC,
        priceCents: pricing.priceCents,
        perAthletePriceCents: pricing.perAthletePriceCents,
        cancellationToken,
        stripeSessionId: session.id,
      },
    });

    const coachEmail = service.coach?.user?.email || null;
    const coachEmails = [coachEmail, ...(settings?.alertEmails || [])].filter((e): e is string => !!e);
    const coachName = service.coach?.user?.name || 'Coach';
    const title = 'Private Lesson';
    const when = formatPt(startUTC, "EEE, MMM d • h:mm a 'PT'");
    const location = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
    const baseUrl = process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
    const cancelUrl = `${baseUrl}/cancel?token=${cancellationToken}`;
    const dashboardUrl = `${baseUrl}/dashboard/bookings`;

    if (requiresApproval) {
      await sendPendingRequestEmails({
        customerEmail,
        coachEmails,
        title,
        when,
        location,
        customerName,
        athleteName,
        cancelUrl,
        dashboardUrl,
        coachName,
      });
    } else {
      const ics = buildICS({
        uid: booking.id,
        start: startUTC,
        end: endUTC,
        summary: `${title} — ${coachName}`,
        location,
        description: `Cancel: ${cancelUrl}`,
        organizerEmail: process.env.SENDER_EMAIL || 'booking@spiritathletics.net',
        method: 'REQUEST',
      });

      const finalCoachEmails = settings?.emailBookingConfirmed === false ? [] : coachEmails;

      await sendBookingEmails({
        customerEmail,
        coachEmails: finalCoachEmails,
        subject: `${programSubjectPrefix('PRIVATE')}Private Lesson Booked & Paid (${when})`,
        htmlCustomer: buildCustomerHtml(title, when, location, cancelUrl, {
          athleteNames: athleteName,
          customerName,
          paymentMethod: 'CARD',
          priceCents: pricing.priceCents,
          coachName,
          kind: 'PRIVATE',
        }),
        htmlCoach: buildCoachHtml(title, when, customerName, athleteName, {
          paymentMethod: 'CARD',
          customerEmail,
          kind: 'PRIVATE',
          priceCents: pricing.priceCents,
        }),
        icsContent: ics,
      });
    }
  });
}

// ─── Clinic Registration ──────────────────────────────────────────────────────

async function handleClinicRegistrationCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata!;
  const { clinicId, customerName, customerEmail } = meta;

  // Support multi-athlete (new) and single-athlete (legacy) metadata
  let athleteFirstNames: string[];
  if (meta.athleteFirstNames) {
    athleteFirstNames = JSON.parse(meta.athleteFirstNames);
  } else {
    athleteFirstNames = [meta.athleteFirstName];
  }

  const existing = await prisma.clinicRegistration.findFirst({ where: { stripeSessionId: session.id } });
  if (existing) return;

  let clinic;
  try {
    clinic = await prisma.$transaction(async (tx) => {
      // Serialize registrations for this clinic so concurrent payments can't overbook it.
      await lockClinic(tx, clinicId);

      // Re-check under the lock: a redelivered webhook may have fulfilled this session already.
      const already = await tx.clinicRegistration.findFirst({ where: { stripeSessionId: session.id }, select: { id: true } });
      if (already) return null;

      const c = await tx.clinic.findUnique({ where: { id: clinicId } });
      if (!c || !c.isActive) throw new CapacityError('Clinic not available');

      const count = await tx.clinicRegistration.count({ where: { clinicId, status: 'CONFIRMED' } });
      if (count + athleteFirstNames.length > c.capacity) throw new CapacityError('Clinic is full');

      await tx.clinicRegistration.createMany({
        data: athleteFirstNames.map((athleteFirstName) => ({
          clinicId,
          customerName,
          customerEmail,
          athleteFirstName,
          stripeSessionId: session.id,
          paymentMethod: 'CARD' as const,
          status: 'CONFIRMED' as const,
        })),
      });
      return c;
    });
  } catch (err) {
    if (!(err instanceof CapacityError)) throw err; // transient: let Stripe retry
    // Paid, but the clinic filled up (or was deactivated) during checkout. Refund instead of retrying.
    const c = await prisma.clinic.findUnique({ where: { id: clinicId } }).catch(() => null);
    await refundUnavailableCheckout(session, {
      kind: 'CLINIC',
      title: c?.title ?? 'Spirit Athletics clinic',
      when: c ? formatPt(c.dateTimeUTC, "EEE, MMM d • h:mm a 'PT'") : null,
      reason: err.message,
    });
    return;
  }
  if (!clinic) return;

  try {
    const when = formatPt(clinic.dateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
    const location = clinic.location || process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
    const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';
    const athleteLabel = athleteFirstNames.join(', ');
    const totalPaidCents = clinic.priceCents * athleteFirstNames.length;

    await resend.emails.send({
      from: `Spirit Athletics <${SENDER}>`,
      to: [customerEmail],
      subject: `[Clinic] Registration Confirmed & Paid: ${clinic.title}`,
      html: buildClinicConfirmationHtml(clinic.title, when, location, customerName, athleteLabel, totalPaidCents),
    });
  } catch (err) {
    console.error('Error sending clinic confirmation email:', err);
  }
}

function buildClinicConfirmationHtml(title: string, when: string, location: string, customerName: string, athleteFirstName: string, totalPaidCents?: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
  const priceText = totalPaidCents ? `$${(totalPaidCents / 100).toFixed(2)}` : null;
  const isMultiple = athleteFirstName.includes(',');
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Clinic Registration Confirmed</title></head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
<tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 40px 32px;">
<h1 style="margin:0 0 8px 0;color:#ffffff;font-size:28px;font-weight:700;">You're Registered!</h1>
<p style="margin:0 0 12px 0;color:rgba(255,255,255,0.85);font-size:16px;">Hi ${escapeHtml(customerName)}, your spot${isMultiple ? 's are' : ' is'} confirmed!</p>
<span style="display:inline-block;background-color:rgba(255,255,255,0.2);color:#ffffff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;">PAID${priceText ? ` — ${priceText}` : ''}</span>
</td></tr>
<tr><td style="padding:32px 40px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:8px;overflow:hidden;">
<tr><td style="padding:24px;">
<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Clinic</p>
<p style="margin:0 0 16px 0;color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(title)}</p>
<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Athlete${isMultiple ? 's' : ''}</p>
<p style="margin:0 0 16px 0;color:#ffffff;font-size:18px;font-weight:600;">${escapeHtml(athleteFirstName)}</p>
<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Date &amp; Time</p>
<p style="margin:0 0 16px 0;color:#ffffff;font-size:18px;font-weight:600;">${escapeHtml(when)}</p>
<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Location</p>
<p style="margin:0;color:#ffffff;font-size:16px;font-weight:500;">${escapeHtml(location)}</p>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:0 40px 32px 40px;">
<div style="background-color:#f0f9ff;border-left:4px solid #7c3aed;padding:16px 20px;border-radius:6px;">
<p style="margin:0 0 8px 0;color:#4c1d95;font-size:14px;font-weight:700;">Important Information</p>
<p style="margin:0;color:#4c1d95;font-size:14px;line-height:1.6;">
&bull; Please arrive 5-10 minutes early and check in at the front desk<br>
&bull; Bring water and a positive attitude!
</p>
</div>
</td></tr>
<tr><td style="padding:32px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
<p style="margin:0 0 8px 0;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
Questions? Contact us at <a href="mailto:info@spiritathletics.net" style="color:#7c3aed;text-decoration:none;font-weight:600;">info@spiritathletics.net</a>
</p>
<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">Spirit Athletics &bull; 17537 Bear Valley Rd, Hesperia, CA 92345</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Shop Order (existing) ────────────────────────────────────────────────────

async function handleShopCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.metadata?.campaignId || !session.metadata?.cartItems) {
    throw new Error('Missing required metadata in checkout session');
  }

  const existingOrder = await prisma.shopOrder.findFirst({ where: { stripePaymentId: session.id } });
  if (existingOrder) return;

  const campaignId = session.metadata.campaignId;
  const campaign = await prisma.shopCampaign.findUnique({
    where: { id: campaignId },
    include: { products: { include: { sizes: true } } },
  });
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  let cartItems;
  try {
    const rawCartItems = JSON.parse(session.metadata.cartItems);
    if (rawCartItems.length > 0 && rawCartItems[0].p) {
      cartItems = rawCartItems.map((item: any) => {
        const product = campaign.products.find((p) => p.id.endsWith(item.p));
        if (!product) throw new Error(`Product not found for suffix ${item.p}`);
        const size = product.sizes.find((s) => s.id.endsWith(item.s));
        if (!size) throw new Error(`Size not found for suffix ${item.s}`);
        return { productId: product.id, sizeId: size.id, quantity: item.q, unitPrice: item.u, lineTotal: item.t };
      });
    } else {
      cartItems = rawCartItems;
    }
  } catch (error) {
    throw new Error('Invalid cart items in session metadata');
  }

  const customerEmail = session.customer_email || session.customer_details?.email;
  if (!customerEmail) throw new Error('No customer email found in session');

  const subtotalCents = session.amount_subtotal || 0;
  const totalCents = session.amount_total || 0;

  const order = await prisma.shopOrder.create({
    data: {
      campaignId,
      email: customerEmail,
      customerName: session.customer_details?.name || null,
      subtotalCents,
      totalCents,
      stripePaymentId: session.id,
      status: 'PAID',
      lineItems: {
        create: cartItems.map((item: any) => ({
          productId: item.productId,
          sizeId: item.sizeId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      },
    },
    include: {
      lineItems: { include: { product: true, size: true } },
      campaign: true,
    },
  });

  await sendShopOrderConfirmationEmail(order);
}

async function sendShopOrderConfirmationEmail(order: any) {
  try {
    const emailData = {
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.email,
      campaignTitle: order.campaign.title,
      campaignEndDate: order.campaign.endsAt,
      totalCents: order.totalCents,
      lineItems: order.lineItems.map((item: any) => ({
        productName: item.product.name,
        sizeName: item.size.label,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    };

    const emailHtml = generateOrderConfirmationEmail(emailData);
    await resend.emails.send({
      from: process.env.SHOP_SUPPORT_EMAIL || process.env.SENDER_EMAIL!,
      to: order.email,
      subject: `Order Confirmed - Spirit Athletics ${order.campaign.title}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending shop confirmation email:', error);
  }
}

// ─── Refund Handling ──────────────────────────────────────────────────────────

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!stripe || !charge.payment_intent) return;

  const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string, {
    expand: ['invoice', 'latest_charge'],
  });

  let sessionId: string | null = null;
  if (paymentIntent.metadata?.checkout_session_id) {
    sessionId = paymentIntent.metadata.checkout_session_id;
  } else {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id, limit: 1 });
    if (sessions.data.length > 0) sessionId = sessions.data[0].id;
  }

  if (!sessionId) return;

  // Full refund on a ticket order: void any tickets not yet used so they stop scanning.
  const ticketOrder = await prisma.ticketOrder.findUnique({ where: { stripeSessionId: sessionId } });
  if (ticketOrder) {
    if (charge.refunded && ticketOrder.status === 'PAID') {
      await prisma.$transaction([
        prisma.ticketOrder.update({ where: { id: ticketOrder.id }, data: { status: 'REFUNDED' } }),
        prisma.ticket.updateMany({
          where: { orderId: ticketOrder.id, status: 'ACTIVE' },
          data: { status: 'VOIDED' },
        }),
      ]);
    }
    return;
  }

  let order = await prisma.shopOrder.findFirst({ where: { stripePaymentId: sessionId } });
  if (!order) order = await prisma.shopOrder.findFirst({ where: { stripePaymentId: paymentIntent.id } });

  if (order && order.status !== 'REFUNDED') {
    await prisma.shopOrder.update({ where: { id: order.id }, data: { status: 'REFUNDED' } });
  }
}

export const dynamic = 'force-dynamic';
