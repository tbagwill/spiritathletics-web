# Spirit Spectacular: pre-deploy checklist

Work top to bottom. Section 1 must be done **before** the deploy in section 4.

## 1. Fix the real event in production (before deploying)
On Nov 6, Claude wiped production's ticketing tables (a backup was taken first) and rebuilt Fall 2026 fresh. Production now holds only Fall 2026, with 0 orders, 0 tickets and nothing sold.
- [x] **Start time → Sun, Nov 8, 1:00 PM PT.** (Was saved as Nov 4.)
- [x] **Standard: Early Bird off.** Early Bird is not used for this event.
- [x] **Tiers, prices and fee set (Nov 6).** Online ticket prices were raised, the per-order convenience fee was reduced, and VIP shows Sold out.
- [x] Title, venue, address, doors (12:30 PM) and end time double-checked.

To change anything later before deploy, use the admin of your **local** site: run `npm run dev`, then go to `localhost:3000/admin/events` → Fall 2026. Your local site reads the production database.

## 2. Code fixes (before deploy)
- [x] Door-only state: when no online tier has Early Bird on, the ticket page should say "Online tickets go on sale Sun at 8:00 AM" instead of showing Early Bird messaging with nothing buyable. *(Built with the UI refresh.)*
- [x] Admin validation: doors open ≤ start < end, so a start-date slip can't be saved again. *(Built with the UI refresh. Saving Fall 2026 is blocked until its start date is fixed.)*
- [x] Commit a checkpoint of the ticketing work.

## 3. Final test run (on staging)
Full plan and results: [showcase-test-plan.md](showcase-test-plan.md). 74 automated checks passed on Nov 5. The manual tests run on staging.spiritathletics.net.
- [ ] Happy path again on the redesigned pages: buy → ticket page → email → scan single → scan group → re-scan.
- [ ] Declined card `4000 0000 0000 0002`: clear error, no order created.
- [x] VIP sold out mid-checkout: with 1 seat left, open two checkouts, pay both. The second gets the "sold out, refunded" page and email, and a refund in Stripe. *(Automated: two simultaneous payments, one order, other refunded.)*
- [ ] Refund from the Stripe dashboard: tickets on that order show as void and scanning them is rejected. *(Voiding verified automatically; the scan rejection still needs a phone.)*
- [ ] Early Bird → Door switch: move the test event's Early Bird end into the past and confirm door prices apply.
- [ ] Sales closed: move sales close into the past and confirm the page says closed and checkout is refused.
- [ ] Attendance board numbers and CSV export match Stripe totals.
- [ ] Ticket email looks right in Apple Mail (iPhone) as well as Gmail.
- [ ] **Release regression:** bookings (card, cash, cancel), waiver, shop, staff accounts, and every page on a phone. Steps are in [showcase-test-plan.md](showcase-test-plan.md) Part 3. If you're short on time, do A1–A3, B and F.

## 4. Go live (in this order, Friday or Saturday)
Already verified on Nov 6:
- [x] **Database is ready.** Both ticketing migrations are applied to production, so the deploy needs no database step.
- [x] **Live Stripe webhook.** It points at `https://www.spiritathletics.net/api/stripe/webhook` and receives `checkout.session.completed` and `charge.refunded`. It uses `www`, so the bare domain's redirect doesn't block Stripe.
- [x] `.env.local` is back on localhost, and the tunnel is retired.

Then:
1. [x] **Section 1 is done:** Fall 2026 starts **Sun, Nov 8, 1:00 PM**, no online tier has Early Bird on, and tiers and fee are final.
2. [x] **Production ticketing tables are fresh.** The TEST event, its 6 test orders, 17 tickets and the failed-fulfillment log row were deleted on Nov 6. Fall 2026 is the only event.
3. [x] **Deploy exactly what you tested:** `git log -1 --oneline origin/staging` and `git log -1 --oneline` should show the same commit.
4. [x] **Deploy:** `git push origin main`. Vercel builds production in about 2 minutes. *(Deployed `95c5a54` on Nov 6 at 11:54 PM PT.)*
5. [ ] **Live check (5 minutes):** *(Claude checked the first three items on Nov 6: no staging banner or noindex, the production database, Standard $27, Senior / Child $22, VIP $47 Sold out, $2 fee, no Early Bird. The scanner redirects to sign-in, and the webhook answers. Still yours: the staff-phone scanner, plus `/api/debug/stripe-config` signed in as admin, which should say live, live, true.)*
   - The homepage banner says "Spirit Spectacular Fall 2026 · Sun, Nov 8", and the hero shows the show card with a countdown. There's **no** yellow staging banner.
   - `/showcase` shows Nov 8 and "On sale Sun, Nov 8 at 8:00 AM".
   - `/showcase/fall-2026/tickets` says online tickets go on sale Sunday, shows your prices and the reduced fee, and VIP shows Sold out. Nothing is buyable yet, which is expected.
   - On a staff phone, sign in, then open `/dashboard/events/fall-2026/scan`. The camera starts.
6. **If anything looks wrong:** Vercel → **Deployments** → the previous production deployment → **Instant Rollback**. Rolling back is safe because the database changes only added new tables, which the old code ignores.

## 5. Sunday 8:00 AM: first live purchase
- [ ] When online sales open, buy **one** Standard ticket with your own card ($29 with the fee). Check the email, the ticket page, and a scan at the door. Then refund it in Stripe (live) and confirm its ticket page says refunded. Stripe keeps its processing fee on refunds (about $1).
- [ ] Stripe → Webhooks → the live endpoint shows `200` deliveries.

**Gotchas:**
- **Never set `NEXT_PUBLIC_APP_ENV` on production.** It adds the staging banner and switches off live payments.
- **Your local site still reads the production database** until it's switched to staging. Do that right after go-live; Claude can.
- **Staging logins don't exist on production.** Staff sign in with their real accounts.
- **Neon may pause idle databases.** If production's compute scales to zero, the first request after a quiet stretch takes a few extra seconds. If your Neon plan allows it, turn off auto-suspend for Sunday.

## 6. Day of the show (Sun, Nov 8)
- [ ] Every scanning staff member has a COACH or ADMIN login and has opened the scanner on their own phone once.
- [ ] Scanner bookmarked or added to the home screen on each phone.
- [ ] Fallback when a code won't scan: Attendance → search by name or email → check in.
- [ ] Phones charged, plus a hotspot plan if venue wifi drops.
- [ ] Decide how onsite cash/card door sales are counted. They don't go through this system.
- [ ] Online sales close automatically at 4:00 PM.

## 7. After the show (security cleanup, not urgent)
- [ ] **Vercel variable scopes.** Every production secret is set to "All Environments", so any feature-branch preview gets the live database and live Stripe key (behind Vercel's login). Edit each secret row (`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET_KEY`, `NEXTAUTH_SECRET`, `CRON_SECRET`, `RECAPTCHA_SECRET_KEY`) to **Production only**. Then add general Preview values that point at the staging database and test keys, so every preview is safe by default.
- [ ] **"Needs Attention" badges in Vercel.** Hover or click one to see Vercel's reason (usually a secret not marked Sensitive) and follow its fix.
- [ ] **Unused variables.** Remove `TEST_STRIPE_SECRET_KEY`, `NEXT_PUBLIC_TEST_STRIPE_PUBLISHABLE_KEY`, `NEXTAUTH_TEST_URL`, `NEXTAUTH_PROD_URL` and `BASE_TEST_URL`. The code doesn't read any of them.
- [ ] **Front desk password.** Change the `frontdesk@` admin password that's hard-coded in `prisma/seed.ts`, then remove it from the file.
