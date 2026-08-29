import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/adminAuth';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;

    return NextResponse.json({
      stripeConfigured: {
        hasSecretKey: !!secretKey,
        secretKeyType: secretKey ? (secretKey.startsWith('sk_live_') ? 'live' : secretKey.startsWith('sk_test_') ? 'test' : 'invalid') : 'missing',
        hasPublishableKey: !!publishableKey,
        publishableKeyType: publishableKey ? (publishableKey.startsWith('pk_live_') ? 'live' : publishableKey.startsWith('pk_test_') ? 'test' : 'invalid') : 'missing',
        hasWebhookSecret: !!webhookSecret,
        webhookSecretValid: webhookSecret ? webhookSecret.startsWith('whsec_') : false,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to check config' }, { status: 500 });
  }
}
