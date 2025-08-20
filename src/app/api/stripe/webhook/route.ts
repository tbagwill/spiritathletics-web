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
    console.log('🎯 Webhook received');
    
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
      console.error('Available env vars:', {
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET_KEY: !!process.env.STRIPE_WEBHOOK_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV
      });
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
          console.log('🔍 Processing event type:', event.type);
          switch (event.type) {
            case 'checkout.session.completed':
              console.log('✅ Processing checkout.session.completed event');
              try {
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                console.log('✅ checkout.session.completed processed successfully');
              } catch (error) {
                console.error('❌ Error processing checkout.session.completed:', error);
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
    console.log('🔍 Processing checkout session:', session.id);
    console.log('🔍 Session metadata:', session.metadata);
    console.log('🔍 Customer email:', session.customer_email || session.customer_details?.email);

    if (!session.metadata?.campaignId || !session.metadata?.cartItems) {
      console.error('❌ Missing required metadata:', {
        campaignId: !!session.metadata?.campaignId,
        cartItems: !!session.metadata?.cartItems,
        allMetadata: session.metadata
      });
      throw new Error('Missing required metadata in checkout session');
    }

    // Check if order already exists to prevent duplicates
    const existingOrder = await prisma.shopOrder.findFirst({
      where: { stripePaymentId: session.id }
    });

    if (existingOrder) {
      console.log('⚠️ Order already exists for session:', session.id);
      return; // Order already exists
    }

    console.log('✅ No existing order found, proceeding with creation');

    const campaignId = session.metadata.campaignId;
    
    // Load campaign data first 
    const campaign = await prisma.shopCampaign.findUnique({
      where: { id: campaignId },
      include: { products: { include: { sizes: true } } }
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    let cartItems;
    try {
      const rawCartItems = JSON.parse(session.metadata.cartItems);
      console.log('🔍 Raw cart items:', rawCartItems);
      
      // Check if this is the compressed format (has 'p', 's', 'q' properties)
      if (rawCartItems.length > 0 && rawCartItems[0].p) {
        console.log('🔧 Using compressed format - reconstructing IDs');
        // Handle compressed format - reconstruct full IDs
        cartItems = rawCartItems.map((item: any) => {
          console.log('🔍 Processing compressed item:', item);
          // Find product by matching the last 8 characters
          const product = campaign.products.find(p => p.id.endsWith(item.p));
          if (!product) {
            console.error(`❌ Product not found for suffix ${item.p}`);
            console.error('Available products:', campaign.products.map(p => ({ id: p.id, name: p.name })));
            throw new Error(`Product not found for suffix ${item.p}`);
          }
          
          // Find size by matching the last 8 characters
          const size = product.sizes.find(s => s.id.endsWith(item.s));
          if (!size) {
            console.error(`❌ Size not found for suffix ${item.s}`);
            console.error('Available sizes for product:', product.sizes.map(s => ({ id: s.id, label: s.label })));
            throw new Error(`Size not found for suffix ${item.s}`);
          }
          
          const reconstructedItem = {
            productId: product.id,
            sizeId: size.id,
            quantity: item.q,
            unitPrice: item.u,
            lineTotal: item.t,
          };
          console.log('✅ Reconstructed item:', reconstructedItem);
          return reconstructedItem;
        });
      } else {
        console.log('🔧 Using legacy format');
        // Legacy format with full property names
        cartItems = rawCartItems;
      }
      console.log('✅ Final cart items:', cartItems);
    } catch (error) {
      console.error('❌ Error parsing cart items:', error);
      throw new Error('Invalid cart items in session metadata');
    }
    
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      throw new Error('No customer email found in session');
    }

    // Calculate totals from session line items
    const subtotalCents = session.amount_subtotal || 0;
    const totalCents = session.amount_total || 0;

    // Create the order
    console.log('🚀 Creating order with data:', {
      campaignId,
      email: customerEmail,
      customerName: session.customer_details?.name || null,
      subtotalCents,
      totalCents,
      stripePaymentId: session.id,
      status: 'PAID',
      lineItemsCount: cartItems.length
    });

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

    console.log('✅ Order created successfully:', order.id);

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

export const dynamic = 'force-dynamic';
