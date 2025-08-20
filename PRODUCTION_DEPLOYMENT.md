# 🚀 Spirit Athletics Production Deployment Guide

## 📋 **PRE-DEPLOYMENT CHECKLIST**

✅ **Code Cleanup Complete**
- All debug logging removed
- Production build successful
- No blocking errors or warnings

✅ **Ready for Production Deployment**

---

## 🔧 **ENVIRONMENT VARIABLES CONFIGURATION**

### **🔄 STEP 1: Update Environment Variables for Production**

You'll need to update these key variables for production:

#### **📍 PRODUCTION ENVIRONMENT VARIABLES:**

```bash
# ⚠️ CRITICAL: UPDATE THESE FOR PRODUCTION ⚠️

# STRIPE LIVE KEYS (MUST BE LIVE, NOT TEST)
STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_SECRET_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_PRODUCTION_WEBHOOK_SECRET_HERE"

# PRODUCTION DOMAIN (UPDATE TO YOUR ACTUAL DOMAIN)
NEXTAUTH_URL="https://your-production-domain.com"
BASE_URL="https://your-production-domain.com"

# DATABASE (YOUR PRODUCTION DATABASE)
DATABASE_URL="your_production_database_connection_string"

# AUTH SECRET (GENERATE A NEW ONE FOR PRODUCTION)
NEXTAUTH_SECRET="your_production_nextauth_secret_32_chars_long"

# EMAIL CONFIGURATION (SAME AS DEVELOPMENT)
RESEND_API_KEY="re_your_resend_api_key"
SENDER_EMAIL="bookings@spiritathletics.net"
SHOP_SUPPORT_EMAIL="shop@spiritathletics.net"

# COACH CREDENTIALS (SAME AS DEVELOPMENT)
TYLER_EMAIL="tyler.bagwill@gmail.com"
PATTI_EMAIL="patti@spiritathletics.net"

# PRODUCTION ENVIRONMENT
NODE_ENV="production"
```

**🔑 IMPORTANT NOTES:**
- All Stripe keys MUST be LIVE keys (not test keys)
- Generate a new NEXTAUTH_SECRET for production security
- Update BASE_URL and NEXTAUTH_URL to your actual domain
- Keep email settings and coach credentials the same

---

## 🌐 **DEPLOYMENT PLATFORMS**

### **Option 1: Vercel (Recommended)**

1. **Connect GitHub Repository**:
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Production ready - cleaned debugging"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Configure Stripe Webhook**:
   - Your production URL will be: `https://your-app.vercel.app`
   - Update Stripe webhook URL: `https://your-app.vercel.app/api/stripe/webhook`

### **Option 2: Netlify**

1. **Build Settings**:
   ```bash
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**:
   - Add all environment variables in Netlify dashboard
   - Update webhook URL: `https://your-app.netlify.app/api/stripe/webhook`

### **Option 3: Railway/Render**

Similar process - connect repo, set environment variables, deploy.

---

## 🔗 **STRIPE PRODUCTION SETUP**

### **🎯 CRITICAL STEPS:**

1. **Switch to Live Mode**:
   - Go to Stripe Dashboard
   - Toggle from "Test mode" to "Live mode"
   - Get your LIVE API keys

2. **Create Production Webhook**:
   ```bash
   Endpoint URL: https://YOUR-PRODUCTION-DOMAIN.com/api/stripe/webhook
   Events to select:
   - checkout.session.completed
   - charge.succeeded  
   - charge.refunded
   ```

3. **Copy Webhook Secret**:
   - Copy the webhook signing secret
   - Add to `STRIPE_WEBHOOK_SECRET` environment variable

---

## 🗄️ **DATABASE PREPARATION**

### **🧹 STEP 1: Clean Test Data**

**IMPORTANT: Backup first!**

```sql
-- Remove test orders
DELETE FROM "ShopOrderItem" WHERE "orderId" IN (
  SELECT id FROM "ShopOrder" WHERE email = 'tyler.bagwill@gmail.com'
);
DELETE FROM "ShopOrder" WHERE email = 'tyler.bagwill@gmail.com';

-- Remove test bookings (optional)
DELETE FROM "Booking" WHERE email = 'tyler.bagwill@gmail.com';

-- Keep campaigns and products for production use
-- Keep coach data and settings
```

### **🔄 STEP 2: Verify Production Data**

```sql
-- Check campaigns are ready
SELECT * FROM "ShopCampaign" WHERE status = 'ACTIVE';

-- Check products are configured
SELECT * FROM "ShopProduct" WHERE "campaignId" IN (
  SELECT id FROM "ShopCampaign" WHERE status = 'ACTIVE'
);

-- Verify coach accounts
SELECT * FROM "Coach" WHERE email IN ('tyler.bagwill@gmail.com', 'patti@spiritathletics.net');
```

---

## 🚀 **DEPLOYMENT PROCESS**

### **📝 STEP-BY-STEP:**

1. **Finalize Code**:
   ```bash
   git add .
   git commit -m "Production deployment ready"
   git push origin main
   ```

2. **Deploy to Platform**:
   - Choose your platform (Vercel recommended)
   - Connect repository
   - Set environment variables
   - Deploy

3. **Configure Stripe**:
   - Switch to Live mode
   - Update webhook URL
   - Update environment variables with live keys

4. **Test Production**:
   - Visit your live site
   - Test a small order with a real card
   - Verify emails are sent
   - Check order appears in database

5. **Go Live**:
   - Announce your shop is live!
   - Monitor for any issues
   - Watch orders come in! 🎉

---

## 📊 **POST-DEPLOYMENT MONITORING**

### **🔍 Check These After Going Live:**

- ✅ Shop loads correctly
- ✅ Products display properly  
- ✅ Cart functionality works
- ✅ Checkout processes successfully
- ✅ Webhooks create orders in database
- ✅ Confirmation emails are sent
- ✅ Success page shows order details
- ✅ Admin dashboard shows orders

### **🚨 Emergency Contacts:**

If something breaks:
1. Check Vercel/platform logs
2. Check Stripe webhook logs
3. Check database for missing orders
4. Verify environment variables are correct

---

## 🎯 **FINAL VERIFICATION CHECKLIST**

Before announcing the shop:

- [ ] Live Stripe keys configured
- [ ] Webhook URL updated in Stripe
- [ ] Test purchase completed successfully  
- [ ] Order confirmation email received
- [ ] Order appears in admin dashboard
- [ ] Success page displays correctly
- [ ] All environment variables set correctly
- [ ] Campaign dates are correct for launch

**You're ready to launch! 🚀**
