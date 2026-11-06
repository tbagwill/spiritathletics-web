import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
// Staging must never charge real cards; a live key there is treated as "not configured".
const liveKeyOnStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging' && !!secretKey?.startsWith('sk_live_');
if (liveKeyOnStaging) console.error('Refusing to use a live Stripe key on staging. Set sk_test_ keys for the staging branch.');

export const stripe =
  secretKey && !liveKeyOnStaging
    ? new Stripe(secretKey, {
        apiVersion: '2025-07-30.basil',
      })
    : null;

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  return !!(secretKey && publishableKey);
}

// Helper to validate Stripe key formats
export function validateStripeKeys(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (secretKey && !secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    errors.push('STRIPE_SECRET_KEY should start with sk_test_ or sk_live_');
  }
  
  if (publishableKey && !publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with pk_test_ or pk_live_');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper to get Stripe configuration
export function getStripeConfig() {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not properly configured. Please check your environment variables.');
  }
  
  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_KEY,
    supportEmail: process.env.SHOP_SUPPORT_EMAIL,
    baseUrl: process.env.BASE_PROD_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://spiritathletics.net',
  };
}
