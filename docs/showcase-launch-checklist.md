# Spirit Spectacular: pre-deploy checklist

Work top to bottom. Sections 1–3 happen before the final test run; 4–6 are deploy and day-of.

## 1. Fix the real event (`/admin/events` → Fall 2026)
- [ ] **Start time → Sun, Nov 8, 1:00 PM PT.** It is currently saved as Nov 4, which would print the wrong date in every ticket email and calendar invite.
- [ ] **Standard: turn Early Bird off.** It is on, so Standard would sell online at $20 from Fri 8 AM to Sat 11:59 PM.
- [ ] **Senior/Child: decide on "show online".** It is hidden right now.
- [ ] **VIP:** to show a SOLD OUT badge, turn "show online" on and set capacity to 0. Leave it hidden if you'd rather not list it.
- [ ] Double-check title, venue, address, doors (12:30 PM), end time, and the $3 fee.

## 2. Code fixes (before deploy)
- [x] Door-only state: when no online tier has Early Bird on, the ticket page should say "Online tickets go on sale Sun at 8:00 AM" instead of showing Early Bird messaging with nothing buyable. *(Built with the UI refresh.)*
- [x] Admin validation: doors open ≤ start < end, so a start-date slip can't be saved again. *(Built with the UI refresh. Saving Fall 2026 is blocked until its start date is fixed.)*
- [ ] Commit a checkpoint of the ticketing work.

## 3. Final test run (sandbox keys, tunnel running)
Full plan and results: [showcase-test-plan.md](showcase-test-plan.md). 74 automated checks passed on Nov 5.
- [ ] Happy path again on the redesigned pages: buy → ticket page → email → scan single → scan group → re-scan.
- [ ] Declined card `4000 0000 0000 0002`: clear error, no order created.
- [x] VIP sold out mid-checkout: with 1 seat left, open two checkouts, pay both. The second gets the "sold out, refunded" page and email, and a refund in Stripe. *(Automated: two simultaneous payments, one order, other refunded.)*
- [ ] Refund from the Stripe dashboard: tickets on that order show as void and scanning them is rejected. *(Voiding verified automatically; the scan rejection still needs a phone.)*
- [ ] Early Bird → Door switch: move the test event's Early Bird end into the past and confirm door prices apply.
- [ ] Sales closed: move sales close into the past and confirm the page says closed and checkout is refused.
- [ ] Attendance board numbers and CSV export match Stripe totals.
- [ ] Ticket email looks right in Apple Mail (iPhone) as well as Gmail.

## 4. Production config
- [ ] Live Stripe webhook endpoint receives `checkout.session.completed` **and** `charge.refunded`. Refund voiding depends on the second one.
- [ ] Vercel env: `BASE_PROD_URL` and `NEXTAUTH_URL` are the live `https://` site. Optional: `TICKETS_SENDER_EMAIL`, `TICKETS_REPLY_TO` (code defaults are already correct).
- [ ] No database migration needed at deploy: both ticketing migrations are already applied to the shared database.

## 5. Cleanup, then deploy
- [ ] Delete the TEST event and its orders. Same database as production: while it exists, the homepage banner and `/showcase` will feature it.
- [ ] `.env.local`: set `NEXT_PUBLIC_SITE_URL` and `BASE_PROD_URL` back to `http://localhost:3000`. Close the cloudflared tunnel.
- [ ] Deploy.
- [ ] Live smoke test: homepage banner and `/showcase` show Fall 2026, the ticket page loads fast on cellular, and the scanner opens on a staff phone.
- [ ] Optional: buy one real ticket with your own card, scan it, then refund it from Stripe and confirm it voids.

## 6. Day of the show (Sun, Nov 8)
- [ ] Every scanning staff member has a COACH or ADMIN login and has opened the scanner on their own phone once.
- [ ] Scanner bookmarked or added to the home screen on each phone.
- [ ] Fallback when a code won't scan: Attendance → search by name or email → check in.
- [ ] Phones charged, plus a hotspot plan if venue wifi drops.
- [ ] Decide how onsite cash/card door sales are counted. They don't go through this system.
- [ ] Online sales close automatically at 4:00 PM.
