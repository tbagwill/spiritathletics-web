import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured, validateStripeKeys } from '@/lib/stripe';

export async function GET() {
  try {
    // Check if environment variables are present
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const envCheck = {
      STRIPE_SECRET_KEY: secretKey ? '✅ Present' : '❌ Missing',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publishableKey ? '✅ Present' : '❌ Missing',
      STRIPE_WEBHOOK_SECRET: webhookSecret ? '✅ Present' : '❌ Missing (optional for now)',
    };

    // Validate key formats
    const keyValidation = validateStripeKeys();

    // Test Stripe connection if keys are configured
    let stripeTest = null;
    if (isStripeConfigured() && stripe) {
      try {
        // Try to list payment methods (minimal API call)
        const paymentMethods = await stripe.paymentMethods.list({
          limit: 1
        });
        stripeTest = {
          status: '✅ Connection successful',
          apiVersion: '2024-06-20',
          accountInfo: 'Connected successfully'
        };
      } catch (error: any) {
        stripeTest = {
          status: '❌ Connection failed',
          error: error.message,
          code: error.code
        };
      }
    } else {
      stripeTest = {
        status: '⚠️ Stripe not configured',
        message: 'Missing required environment variables'
      };
    }

    return NextResponse.json({
      environment: envCheck,
      keyValidation,
      stripeConnection: stripeTest,
      summary: {
        configured: isStripeConfigured(),
        keysValid: keyValidation.isValid,
        connectionWorking: stripeTest?.status?.includes('✅') || false
      }
    });

  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json(
      { error: 'Failed to test Stripe connection', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
