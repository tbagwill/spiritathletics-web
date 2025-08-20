# Stripe Setup Guide - Spirit Athletics Pop-Up Shop

This guide will walk you through setting up Stripe for the Spirit Athletics pop-up shop system.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Access to your Stripe Dashboard
- Your production domain ready

## Step 1: Get Your Stripe API Keys

### 1.1 Login to Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Sign in to your account

### 1.2 Get Test Keys (for development)
1. In the left sidebar, click **"Developers"**
2. Click **"API keys"**
3. Make sure you're in **"Test mode"** (toggle at top)
4. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 1.3 Get Live Keys (for production)
1. Toggle to **"Live mode"** 
2. Copy these keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

## Step 2: Configure Environment Variables

Copy `env.example` to `.env.local` and fill in your Stripe keys:

```bash
# For development (test mode)
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# For production (live mode)
STRIPE_SECRET_KEY="sk_live_your_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key_here"
```

## Step 3: Set Up Webhooks

Webhooks allow Stripe to notify your app when payments are completed.

### 3.1 Create Webhook Endpoint
1. In Stripe Dashboard, go to **"Developers" → "Webhooks"**
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   - **Development:** `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
   - **Production:** `https://yourdomain.com/api/stripe/webhook`

### 3.2 Select Events
Select these events to listen for:
- `checkout.session.completed`
- `charge.refunded` (optional, for refund handling)

### 3.3 Get Webhook Secret
1. Click on your newly created webhook
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_`)
4. Add to your environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
   ```

## Step 4: Configure Shop Settings

Add these additional environment variables:

```bash
# Shop configuration
SHOP_SUPPORT_EMAIL="support@yourdomain.com"
SHOP_BASE_URL="https://yourdomain.com"
```

## Step 5: Test the Integration

### 5.1 Test Payment Flow
1. Create a test campaign in the admin dashboard
2. Add a test product
3. Go to the shop and add items to cart
4. Proceed to checkout

### 5.2 Use Stripe Test Cards
For testing, use these test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### 5.3 Verify Webhook
1. Complete a test purchase
2. Check your Stripe Dashboard → "Events" 
3. You should see `checkout.session.completed` events
4. Check your admin dashboard → Orders to see the order was created

## Step 6: Go Live

### 6.1 Switch to Live Mode
1. Update your environment variables to use live keys (`sk_live_`, `pk_live_`)
2. Update webhook endpoint to your production domain
3. Get the new webhook secret for the live webhook

### 6.2 Production Checklist
- [ ] Live Stripe keys configured
- [ ] Production webhook endpoint created
- [ ] Webhook secret updated
- [ ] Test a small transaction
- [ ] Verify order confirmation emails work
- [ ] Check admin dashboard shows orders correctly

## Troubleshooting

### Common Issues

**Webhook signature verification failed:**
- Make sure `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint
- Ensure webhook URL is accessible from the internet

**Payments not creating orders:**
- Check webhook events in Stripe Dashboard
- Check application logs for webhook errors
- Verify database connection

**Checkout redirects to 404:**
- Ensure success/cancel URLs are correct
- Check that pages exist at `/shop/success` and `/shop/cancel`

### Testing Webhooks Locally

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Use the webhook secret from the CLI output
```

## Support

If you need help:
1. Check the Stripe Dashboard for error details
2. Review application logs
3. Test with Stripe's test mode first
4. Contact support if issues persist

## Security Notes

- Never commit real Stripe keys to version control
- Use test keys during development
- Keep webhook secrets secure
- Monitor webhook endpoint for unusual activity
- Set up proper error monitoring for production
