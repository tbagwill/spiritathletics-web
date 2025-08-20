import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, getStripeConfig } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const CheckoutSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string(),
    sizeId: z.string(),
    quantity: z.number().min(1).max(50)
  })).min(1),
  customerEmail: z.string().email(),
  customerName: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Shop is not available - payment processing not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const validatedData = CheckoutSchema.parse(body);
    const { cartItems, customerEmail, customerName } = validatedData;



    // Find campaign by getting the first product
    const firstProduct = await prisma.shopProduct.findUnique({
      where: { id: cartItems[0].productId },
      include: { campaign: true }
    });

    if (!firstProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get full campaign with products and sizes
    const campaign = await prisma.shopCampaign.findUnique({
      where: { id: firstProduct.campaign.id },
      include: {
        products: {
          include: { sizes: true }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if campaign is active
    const now = new Date();
    if (campaign.status !== 'ACTIVE' || now < campaign.startsAt || now > campaign.endsAt) {
      return NextResponse.json(
        { error: 'This campaign is no longer active' },
        { status: 409 }
      );
    }

    // Build line items for Stripe
    const lineItems = [];
    const processedCartItems = [];

    for (const item of cartItems) {
      const product = campaign.products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found in current campaign` },
          { status: 400 }
        );
      }

      const size = product.sizes.find(s => s.id === item.sizeId);
      if (!size) {
        return NextResponse.json(
          { error: `Size not available for ${product.name}` },
          { status: 400 }
        );
      }

      const unitPrice = product.basePrice + size.priceDelta;
      const lineTotal = unitPrice * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name} - ${size.label}`,
            description: product.description || undefined,
            images: product.imageUrl ? [product.imageUrl] : undefined,
          },
          unit_amount: unitPrice,
        },
        quantity: item.quantity,
      });

      processedCartItems.push({
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }



    // Create Stripe Checkout Session
    const { baseUrl } = getStripeConfig();
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${baseUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`,
      metadata: {
        campaignId: campaign.id,
        cartItems: JSON.stringify(processedCartItems),
        customerName: customerName || '',
      },
    });



    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
