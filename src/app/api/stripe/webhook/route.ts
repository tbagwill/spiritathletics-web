import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, getStripeConfig } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { generateOrderConfirmationEmail } from '@/lib/emailTemplates';
import { buildICS } from '@/lib/ics';
import { buildCustomerHtml, buildCoachHtml, sendBookingEmails, sendPendingRequestEmails } from '@/lib/email';
import { computePrivatePrice } from '@/lib/pricing';
import { formatPt } from '@/lib/time';
import { v4 as uuidv4 } from 'uuid';

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
  } else {
    // Existing shop order flow
    await handleShopCheckoutCompleted(session);
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

  await prisma.$transaction(async (tx) => {
    const occ = await tx.classOccurrence.findUnique({
      where: { id: classOccurrenceId },
      include: {
        classTemplate: { include: { service: { include: { coach: { include: { user: true } } } } } },
      },
    });
    if (!occ || occ.status !== 'SCHEDULED') throw new Error('Class occurrence not available');

    const count = await tx.booking.count({ where: { classOccurrenceId, status: 'CONFIRMED' } });
    if (count + athleteNamesList.length > occ.capacity) throw new Error('Class is full');

    const service = await tx.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error('Service not found');

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

    const firstBooking = bookings[0];
    const coachEmail = occ.classTemplate.service.coach?.user?.email || null;
    const coachId = occ.classTemplate.service.coachId;
    const settings = coachId
      ? await tx.coachSettings.findUnique({ where: { coachId } }).catch(() => null)
      : null;
    const sendCoachConfirmation = settings?.emailBookingConfirmed !== false;
    const coachEmails = sendCoachConfirmation ? [coachEmail, ...(settings?.alertEmails || [])] : [];
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
      summary: `${title} — ${occ.classTemplate.service.coach?.user?.name ?? 'Coach'}`,
      location,
      description: `Cancel: ${cancelUrl}`,
      organizerEmail: process.env.SENDER_EMAIL || 'booking@spiritathletics.net',
      method: 'REQUEST',
    });

    const totalCents = service.basePriceCents * athleteNamesList.length;
    await sendBookingEmails({
      customerEmail,
      coachEmails,
      subject: `Class Reserved & Paid: ${title} (${when})`,
      htmlCustomer: buildCustomerHtml(title, when, location, cancelUrl, {
        athleteNames: allAthleteNames,
        customerName,
        paymentMethod: 'CARD',
        priceCents: totalCents,
      }),
      htmlCoach: buildCoachHtml(title, when, customerName, allAthleteNames, 'CARD'),
      icsContent: ics,
    });
  });
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
        subject: `Private Lesson Booked & Paid (${when})`,
        htmlCustomer: buildCustomerHtml(title, when, location, cancelUrl, {
          athleteNames: athleteName,
          customerName,
          paymentMethod: 'CARD',
          priceCents: pricing.priceCents,
        }),
        htmlCoach: buildCoachHtml(title, when, customerName, athleteName, 'CARD'),
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

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new Error(`Clinic ${clinicId} not found`);

  const count = await prisma.clinicRegistration.count({
    where: { clinicId, status: 'CONFIRMED' },
  });
  if (count + athleteFirstNames.length > clinic.capacity) throw new Error('Clinic is full');

  for (const athleteFirstName of athleteFirstNames) {
    await prisma.clinicRegistration.create({
      data: {
        clinicId,
        customerName,
        customerEmail,
        athleteFirstName,
        stripeSessionId: session.id,
        paymentMethod: 'CARD',
        status: 'CONFIRMED',
      },
    });
  }

  try {
    const when = formatPt(clinic.dateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
    const location = clinic.location || process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
    const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';
    const athleteLabel = athleteFirstNames.join(', ');
    const totalPaidCents = clinic.priceCents * athleteFirstNames.length;

    await resend.emails.send({
      from: `Spirit Athletics <${SENDER}>`,
      to: [customerEmail],
      subject: `Clinic Registration Confirmed & Paid: ${clinic.title}`,
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
&bull; Please arrive 5-10 minutes early<br>
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

  let order = await prisma.shopOrder.findFirst({ where: { stripePaymentId: sessionId } });
  if (!order) order = await prisma.shopOrder.findFirst({ where: { stripePaymentId: paymentIntent.id } });

  if (order && order.status !== 'REFUNDED') {
    await prisma.shopOrder.update({ where: { id: order.id }, data: { status: 'REFUNDED' } });
  }
}

export const dynamic = 'force-dynamic';
