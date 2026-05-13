import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, getStripeConfig, isStripeConfigured } from '@/lib/stripe';
import { computePrivatePrice, CARD_FEE_CENTS } from '@/lib/pricing';
import { z } from 'zod';
import { rateLimitHit } from '@/lib/rateLimit';

const SelectionSchema = z.union([
  z.object({ kind: z.literal('SOLO'), duration: z.literal(30) }),
  z.object({ kind: z.literal('SOLO'), duration: z.literal(45) }),
  z.object({ kind: z.literal('SOLO'), duration: z.literal(60) }),
  z.object({ kind: z.literal('SEMI_PRIVATE'), duration: z.literal(60) }),
]);

const BodySchema = z.object({
  coachId: z.string().cuid(),
  serviceId: z.string().cuid(),
  startDateTimeUTC: z.string(),
  endDateTimeUTC: z.string(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(255).toLowerCase(),
  athleteName: z.string().min(1).max(100).trim(),
  selection: SelectionSchema,
});

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ ok: false, error: 'Payment processing not configured' }, { status: 503 });
  }

  const json = await req.json();
  const parse = BodySchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', issues: parse.error.format() }, { status: 400 });
  }
  const { coachId, serviceId, startDateTimeUTC, endDateTimeUTC, customerName, customerEmail, athleteName, selection } = parse.data;

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const key = `private-checkout:${ip}:${customerEmail}`;
  if (!rateLimitHit(key, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests, please try again shortly.' }, { status: 429 });
  }

  try {
    const startUTC = new Date(startDateTimeUTC);
    const endUTC = new Date(endDateTimeUTC);

    // Check for scheduling conflicts
    const overlapCount = await prisma.booking.count({
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

    if (overlapCount > 0) {
      return NextResponse.json({ ok: false, error: 'Time slot no longer available' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { coach: { include: { user: true } } },
    });
    if (!service || service.type !== 'PRIVATE' || service.coachId !== coachId) {
      return NextResponse.json({ ok: false, error: 'Service not found' }, { status: 400 });
    }

    const pricing = computePrivatePrice(selection as any);
    const coachName = service.coach?.user?.name ?? 'Coach';

    const kindLabel = selection.kind === 'SEMI_PRIVATE'
      ? 'Semi-Private Lesson (2 athletes)'
      : `Solo Lesson (${selection.duration} min)`;

    const { baseUrl } = getStripeConfig();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Private Lesson — ${kindLabel}`,
              description: `With ${coachName} on ${startUTC.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
            },
            unit_amount: pricing.priceCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Card Processing Fee',
            },
            unit_amount: CARD_FEE_CENTS,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/privates`,
      metadata: {
        bookingType: 'PRIVATE',
        coachId,
        serviceId,
        startDateTimeUTC,
        endDateTimeUTC,
        customerName,
        customerEmail,
        athleteName,
        selectionKind: selection.kind,
        selectionDuration: String(selection.duration),
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    console.error('Private checkout error:', e);
    return NextResponse.json({ ok: false, error: e.message ?? 'Failed to create checkout session' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
