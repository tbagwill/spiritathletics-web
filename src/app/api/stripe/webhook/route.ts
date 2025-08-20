import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, getStripeConfig } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { generateOrderConfirmationEmail } from '@/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      console.error('Stripe not configured');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const { webhookSecret } = getStripeConfig();
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        try {
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        } catch (error) {
          console.error('Error processing checkout.session.completed:', error);
          throw error; // Re-throw to trigger webhook retry
        }
        break;
      case 'charge.succeeded':
        // Order already created by checkout.session.completed
        break;
      case 'charge.updated':
        // Normal Stripe event - no action needed
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
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {

    if (!session.metadata?.campaignId || !session.metadata?.cartItems) {
      throw new Error('Missing required metadata in checkout session');
    }

    // Check if order already exists to prevent duplicates
    const existingOrder = await prisma.shopOrder.findFirst({
      where: { stripePaymentId: session.id }
    });

    if (existingOrder) {
      return; // Order already exists
    }

    const campaignId = session.metadata.campaignId;
    
    let cartItems;
    try {
      cartItems = JSON.parse(session.metadata.cartItems);
    } catch (error) {
      throw new Error('Invalid cart items in session metadata');
    }
    
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      throw new Error('No customer email found in session');
    }

    // Verify the campaign still exists and is active
    const campaign = await prisma.shopCampaign.findUnique({
      where: { id: campaignId },
      include: { products: { include: { sizes: true } } }
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Calculate totals from session line items
    const subtotalCents = session.amount_subtotal || 0;
    const totalCents = session.amount_total || 0;

    // Create the order
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
          }))
        }
      },
      include: {
        lineItems: {
          include: {
            product: true,
            size: true,
          }
        },
        campaign: true,
      }
    });

    // Send confirmation email
    await sendOrderConfirmationEmail(order);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    
    // Don't throw - we want to return 200 to Stripe to prevent retries
    // unless it's a critical error that should be retried
    if (error instanceof Error && error.message.includes('Missing required metadata')) {
      throw error; // This should be retried
    }
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    // Find the order by Stripe payment ID
    const order = await prisma.shopOrder.findFirst({
      where: { stripePaymentId: charge.payment_intent as string },
    });

    if (order) {
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: { status: 'REFUNDED' },
      });

      console.log(`Order ${order.id} marked as refunded`);
    }
  } catch (error) {
    console.error('Error handling charge refund:', error);
    throw error;
  }
}

async function sendOrderConfirmationEmail(order: any) {
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
      }))
    };

    const emailHtml = generateOrderConfirmationEmail(emailData);

    await resend.emails.send({
      from: process.env.SHOP_SUPPORT_EMAIL || process.env.SENDER_EMAIL!,
      to: order.email,
      subject: `Order Confirmed - Spirit Athletics ${order.campaign.title}`,
      html: emailHtml,
    });

    console.log(`Order confirmation email sent to ${order.email}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw here - order creation should still succeed even if email fails
  }
}
