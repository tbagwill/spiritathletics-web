import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, getStripeConfig, isStripeConfigured } from '@/lib/stripe';
import { z } from 'zod';
import { rateLimitHit } from '@/lib/rateLimit';
import { formatPt } from '@/lib/time';

const BodySchema = z.object({
  clinicId: z.string().cuid(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(255).toLowerCase(),
  athleteFirstName: z.string().min(1).max(100).trim(),
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
  const { clinicId, customerName, customerEmail, athleteFirstName } = parse.data;

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const key = `clinic-checkout:${ip}:${customerEmail}`;
  if (!rateLimitHit(key, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests, please try again shortly.' }, { status: 429 });
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        registrations: { where: { status: 'CONFIRMED' }, select: { id: true } },
      },
    });

    if (!clinic || !clinic.isActive) {
      return NextResponse.json({ ok: false, error: 'Clinic not found or no longer active' }, { status: 400 });
    }
    if (clinic.dateTimeUTC < new Date()) {
      return NextResponse.json({ ok: false, error: 'This clinic has already passed' }, { status: 400 });
    }
    if (clinic.registrations.length >= clinic.capacity) {
      return NextResponse.json({ ok: false, error: 'This clinic is full' }, { status: 400 });
    }

    const when = formatPt(clinic.dateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
    const { baseUrl } = getStripeConfig();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: clinic.title,
              description: `Clinic on ${when}${clinic.location ? ` at ${clinic.location}` : ''}`,
            },
            unit_amount: clinic.priceCents,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}&type=clinic`,
      cancel_url: `${baseUrl}/book/classes`,
      metadata: {
        bookingType: 'CLINIC',
        clinicId,
        customerName,
        customerEmail,
        athleteFirstName,
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    console.error('Clinic checkout error:', e);
    return NextResponse.json({ ok: false, error: e.message ?? 'Failed to create checkout session' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
