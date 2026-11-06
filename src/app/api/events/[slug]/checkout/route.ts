import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { stripe, getStripeConfig } from '@/lib/stripe';
import { priceCentsForTier, remainingForTier, salesAreOpen, currentSalesWindow } from '@/lib/ticketing';

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        tierId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(10),
  email: z.string().email(),
  customerName: z.string().min(2).max(120),
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!stripe) {
    return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 });
  }

  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const { items, email, customerName } = parsed.data;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { tiers: true },
  });
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

  const now = new Date();
  if (!salesAreOpen(event, now)) {
    return NextResponse.json(
      { error: 'Online sales are not currently open for this event.', window: currentSalesWindow(event, now) },
      { status: 409 },
    );
  }

  // Build server-authoritative line items. Client-supplied prices are ignored.
  const tiersById = new Map(event.tiers.map((t) => [t.id, t]));
  const lineItems: {
    price_data: {
      currency: 'usd';
      product_data: { name: string; description?: string };
      unit_amount: number;
    };
    quantity: number;
  }[] = [];
  const metaItems: { tierId: string; quantity: number; unitPrice: number }[] = [];

  let subtotalCents = 0;
  for (const item of items) {
    const tier = tiersById.get(item.tierId);
    if (!tier) {
      return NextResponse.json({ error: `Unknown tier: ${item.tierId}` }, { status: 400 });
    }
    const price = priceCentsForTier(event, tier, now);
    if (!price) {
      return NextResponse.json(
        { error: `"${tier.name}" is not available for purchase right now.` },
        { status: 409 },
      );
    }
    const remaining = remainingForTier(tier);
    if (remaining != null && item.quantity > remaining) {
      return NextResponse.json(
        { error: `Only ${remaining} "${tier.name}" ticket(s) remaining.` },
        { status: 409 },
      );
    }

    subtotalCents += price.priceCents * item.quantity;
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${event.title} — ${tier.name}`,
          description:
            price.window === 'EARLY_BIRD' ? 'Early Bird ticket' : 'Door ticket',
        },
        unit_amount: price.priceCents,
      },
      quantity: item.quantity,
    });
    metaItems.push({ tierId: tier.id, quantity: item.quantity, unitPrice: price.priceCents });
  }

  // Add the convenience fee as its own line item so Stripe shows it clearly.
  const feeCents = event.convenienceFeeCents;
  if (feeCents > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Online convenience fee',
          description: 'Covers payment processing for online ticket sales.',
        },
        unit_amount: feeCents,
      },
      quantity: 1,
    });
  }

  const { baseUrl } = getStripeConfig();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      success_url: `${baseUrl}/showcase/${event.slug}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/showcase/${event.slug}/tickets/cancel`,
      metadata: {
        bookingType: 'TICKET_ORDER',
        eventId: event.id,
        eventSlug: event.slug,
        customerName,
        subtotalCents: String(subtotalCents),
        feeCents: String(feeCents),
        // Keep this tight — Stripe metadata is limited.
        items: JSON.stringify(metaItems),
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Ticket checkout session failed:', err);
    return NextResponse.json({ error: 'Failed to start checkout.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
