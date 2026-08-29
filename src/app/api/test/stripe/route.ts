import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/adminAuth';
import { stripe, isStripeConfigured, validateStripeKeys } from '@/lib/stripe';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;

    const envCheck = {
      STRIPE_SECRET_KEY: secretKey ? 'present' : 'missing',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publishableKey ? 'present' : 'missing',
      STRIPE_WEBHOOK_SECRET_KEY: webhookSecret ? 'present' : 'missing',
    };

    const keyValidation = validateStripeKeys();

    let stripeTest: { status: string; error?: string; code?: string; message?: string } | null = null;
    if (isStripeConfigured() && stripe) {
      try {
        await stripe.paymentMethods.list({ limit: 1 });
        stripeTest = { status: 'Connection successful' };
      } catch (error: unknown) {
        const err = error as { message?: string; code?: string };
        stripeTest = {
          status: 'Connection failed',
          error: err.message,
          code: err.code,
        };
      }
    } else {
      stripeTest = {
        status: 'Stripe not configured',
        message: 'Missing required environment variables',
      };
    }

    return NextResponse.json({
      environment: envCheck,
      keyValidation,
      stripeConnection: stripeTest,
      summary: {
        configured: isStripeConfigured(),
        keysValid: keyValidation.isValid,
        connectionWorking: stripeTest?.status === 'Connection successful',
      },
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json(
      { error: 'Failed to test Stripe connection' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
