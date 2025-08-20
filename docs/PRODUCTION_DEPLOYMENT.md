# Production Deployment Checklist - Spirit Athletics Shop

This checklist ensures a smooth transition from development to production for the pop-up shop system.

## Pre-Deployment Checklist

### 1. Environment Configuration ✅
- [ ] Copy `env.example` to production environment
- [ ] Update all environment variables with production values
- [ ] Switch Stripe keys to live mode (`sk_live_`, `pk_live_`)
- [ ] Configure production database URL
- [ ] Set up production email domain in Resend
- [ ] Configure production NextAuth URL

### 2. Stripe Configuration ✅
- [ ] Create production webhook endpoint in Stripe Dashboard
- [ ] Update webhook URL to production domain
- [ ] Copy production webhook secret to environment variables
- [ ] Test webhook connectivity (use Stripe CLI if needed)
- [ ] Verify payment methods are enabled for your region

### 3. Database Setup ✅
- [ ] Run production database migrations
- [ ] Seed production database with initial admin users
- [ ] Verify database backup strategy is in place
- [ ] Test database connectivity from production environment

### 4. Email Configuration ✅
- [ ] Verify sender email domain in Resend
- [ ] Test email sending in production environment
- [ ] Configure SPF/DKIM records for email domain
- [ ] Test email delivery to various providers (Gmail, Outlook, etc.)

### 5. Security Configuration ✅
- [ ] Generate strong, unique NEXTAUTH_SECRET for production
- [ ] Verify all sensitive environment variables are properly secured
- [ ] Configure proper CORS settings if needed
- [ ] Review API rate limiting configuration
- [ ] Ensure webhook signature verification is working

---

## Deployment Process

### Step 1: Build Verification
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No critical TypeScript errors
- [ ] All pages generate successfully

### Step 2: Production Environment Setup

**Vercel Deployment (Recommended):**
1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy from main branch
4. Verify deployment success

**Alternative Deployment (Docker/VPS):**
1. Build production image
2. Configure environment variables
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificate
5. Start application

### Step 3: Database Migration
```bash
# If using Prisma
npx prisma migrate deploy
npx prisma db seed  # If you have seed data
```

### Step 4: Stripe Webhook Configuration
1. Go to Stripe Dashboard → Webhooks
2. Create new endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `charge.refunded`
4. Copy signing secret to production environment
5. Test webhook with a small transaction

---

## Post-Deployment Verification

### Immediate Tests (within 30 minutes)
- [ ] Homepage loads correctly
- [ ] Shop page displays products
- [ ] Admin dashboard accessible by authorized users
- [ ] Test small Stripe transaction ($1)
- [ ] Verify webhook receives test payment
- [ ] Check order appears in admin dashboard
- [ ] Confirm email confirmation is sent

### Critical Path Tests
- [ ] Customer can browse products
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Order confirmation email delivered
- [ ] Admin can view and manage orders
- [ ] Campaign management works
- [ ] Product management works

### Performance Checks
- [ ] Page load times under 3 seconds
- [ ] Images load properly
- [ ] Mobile experience is smooth
- [ ] Error pages display correctly

---

## Monitoring Setup (Recommended)

### Error Monitoring
Consider adding these services:
- **Sentry**: For error tracking and performance monitoring
- **LogRocket**: For user session recording and debugging
- **Vercel Analytics**: For performance insights (if using Vercel)

### Email Monitoring
- Monitor email delivery rates in Resend dashboard
- Set up alerts for failed email deliveries
- Monitor bounce and spam rates

### Payment Monitoring
- Set up Stripe Dashboard notifications for failed payments
- Monitor webhook delivery success rates
- Set up alerts for unusual payment patterns

---

## Go-Live Communication Plan

### Internal Team
- [ ] Notify all coaches about new shop system
- [ ] Provide training on admin dashboard
- [ ] Share testing procedures for ongoing campaigns
- [ ] Document support processes

### Customer Communication
- [ ] Announce shop availability on social media
- [ ] Send email to customer list (if applicable)
- [ ] Update website navigation to include shop link
- [ ] Prepare FAQ for common questions

---

## Rollback Plan

If critical issues arise:

### Immediate Steps
1. Disable new user registrations if needed
2. Put up maintenance page
3. Revert to previous deployment
4. Notify customers via email/social media

### Database Rollback
1. Stop application
2. Restore database from backup
3. Run any necessary migration rollbacks
4. Restart application

### Communication
- Prepare template messages for various scenarios
- Designate point person for customer communication
- Have support email ready for customer inquiries

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor email delivery
- [ ] Review Stripe dashboard for issues

### Weekly
- [ ] Review system performance
- [ ] Check database performance
- [ ] Backup verification
- [ ] Security updates if available

### Before Each Campaign
- [ ] Test complete purchase flow
- [ ] Verify email templates
- [ ] Check payment processing
- [ ] Test admin functions

---

## Support Information

### Emergency Contacts
- **Tyler (Primary Admin)**: [Contact Info]
- **Patti (Head Coach)**: [Contact Info]
- **Technical Support**: [Contact Info]

### Service Dashboards
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Resend Dashboard**: https://resend.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard (if using Vercel)
- **Database Provider**: [Your database dashboard URL]

### Documentation Links
- [Stripe Setup Guide](./STRIPE_SETUP.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Environment Variables Template](../env.example)

---

## Common Issues & Solutions

### Issue: Webhook Not Receiving Events
**Solution:**
1. Check webhook URL is accessible publicly
2. Verify webhook secret matches environment variable
3. Check Stripe Dashboard webhook logs
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Issue: Emails Not Sending
**Solution:**
1. Verify Resend API key is correct
2. Check sender email is verified in Resend
3. Review email logs in Resend dashboard
4. Test with a simple API call to Resend

### Issue: Database Connection Errors
**Solution:**
1. Verify DATABASE_URL format
2. Check database server status
3. Verify network connectivity
4. Check connection limits

### Issue: Build Failures
**Solution:**
1. Check for TypeScript errors: `npm run build`
2. Verify all dependencies are installed
3. Check for environment variable issues
4. Review Next.js build logs

---

## Success Metrics

Track these metrics post-deployment:

### Technical Metrics
- Uptime percentage (target: 99.9%)
- Average page load time (target: <3 seconds)
- Error rate (target: <1%)
- Successful payment rate (target: >99%)

### Business Metrics
- Conversion rate (visitors to purchasers)
- Average order value
- Cart abandonment rate
- Email open/click rates

---

## Final Launch Confirmation

**Before announcing publicly:**
- [ ] All tests passed
- [ ] Monitoring is active
- [ ] Support processes are in place
- [ ] Team is trained and ready
- [ ] Rollback plan is confirmed
- [ ] Communication templates are ready

**Launch Authorization:**
- [ ] Tyler approval: ___________
- [ ] Patti approval: ___________
- [ ] Technical sign-off: ___________

**Launch Date:** ___________
**Launch Time:** ___________

---

🎉 **Congratulations on a successful deployment!** 🎉

Remember: Monitor closely for the first 24 hours and be ready to provide support to early users.
