import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Email
  RESEND_API_KEY: z.string().startsWith('re_'),
  SENDER_EMAIL: z.string().email(),
  
  // Stripe (for pop-up shop)
  STRIPE_SECRET_KEY: z.string().optional(), // Should start with sk_test_ or sk_live_
  STRIPE_WEBHOOK_SECRET: z.string().optional(), // Should start with whsec_ (when you set up webhooks)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(), // Should start with pk_test_ or pk_live_
  SHOP_SUPPORT_EMAIL: z.string().email().optional(),
  SHOP_BASE_URL: z.string().url().optional(),
  
  // Organization
  ORG_ADDRESS: z.string().min(10),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

// Validate environment variables at module load time in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}
