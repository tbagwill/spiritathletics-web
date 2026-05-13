import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, getStripeConfig, isStripeConfigured } from '@/lib/stripe';
import { CARD_FEE_CENTS } from '@/lib/pricing';
import { z } from 'zod';
import { rateLimitHit } from '@/lib/rateLimit';

const BodySchema = z.object({
  classOccurrenceId: z.string().cuid(),
  serviceId: z.string().cuid(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(255).toLowerCase(),
  athleteNames: z.array(z.string().min(1).max(100).trim()).min(1).max(10),
  notes: z.string().max(1000).optional(),
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
  const { classOccurrenceId, serviceId, customerName, customerEmail, athleteNames, notes } = parse.data;
  const numAthletes = athleteNames.length;

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const key = `class-checkout:${ip}:${customerEmail}`;
  if (!rateLimitHit(key, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests, please try again shortly.' }, { status: 429 });
  }

  try {
    const occ = await prisma.classOccurrence.findUnique({
      where: { id: classOccurrenceId },
      include: {
        classTemplate: {
          include: {
            service: { include: { coach: { include: { user: true } } } },
          },
        },
        bookings: { where: { status: 'CONFIRMED' }, select: { id: true } },
      },
    });

    if (!occ || occ.status !== 'SCHEDULED') {
      return NextResponse.json({ ok: false, error: 'Class is not available' }, { status: 400 });
    }
    const spotsLeft = occ.capacity - occ.bookings.length;
    if (numAthletes > spotsLeft) {
      return NextResponse.json({ ok: false, error: `Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining` }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ ok: false, error: 'Service not found' }, { status: 400 });
    }

    const { baseUrl } = getStripeConfig();
    const coachName = occ.classTemplate.service.coach?.user?.name ?? 'Coach';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.title,
              description: `Class with ${coachName} — ${new Date(occ.startDateTimeUTC).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
            },
            unit_amount: service.basePriceCents,
          },
          quantity: numAthletes,
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
      cancel_url: `${baseUrl}/book/classes`,
      metadata: {
        bookingType: 'CLASS',
        classOccurrenceId,
        serviceId,
        customerName,
        customerEmail,
        athleteNames: JSON.stringify(athleteNames),
        numAthletes: String(numAthletes),
        notes: notes || '',
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    console.error('Class checkout error:', e);
    return NextResponse.json({ ok: false, error: e.message ?? 'Failed to create checkout session' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
