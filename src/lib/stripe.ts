import Stripe from 'stripe';

// Only initialize Stripe if the secret key is configured
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
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
    baseUrl: process.env.SHOP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  };
}
