# Spirit Spectacular: final test plan

## Part 1: already verified automatically (Thu, Nov 5)

74 checks against the local server with Stripe **test** keys and the TEST event only. All passing.

| Area | Checks | What was proven |
|---|---|---|
| Sales windows and pricing | 31 | Every window and edge (11:59 PM Early Bird cutoff, 4:00 PM close). Door-only launch tells buyers "on sale Sun 8 AM" and shows door prices. Hidden and sold-out tiers can't sell. Schedule rules reject bad dates, including Fall 2026's current Nov 4 start. QR tokens are unique and can't be confused with group codes. |
| Checkout API | 13 | Prices come from the server: a tampered $0.01 price was still charged the real price. The $3 fee is added once per order. Bad quantities, tiers, emails, names and JSON are rejected. Checkout is refused when sales aren't open. |
| Fulfillment (Stripe webhook) | 8 | A paid order creates tickets, an access token and inventory counts. Stripe retrying the same event never double-issues. Forged or unsigned webhooks are rejected. The success page sends the buyer to their tickets, or waits while the webhook arrives. The ticket page shows the group QR plus one QR per ticket. Made-up links return 404. |
| Sold-out race | 2 | Two buyers paying for the last VIP seat at the same moment: exactly one order. The other is refunded in Stripe and sees the "couldn't complete your order" page. No overselling. |
| Refunds | 3 | A Stripe `charge.refunded` marks the order refunded and voids its tickets. The ticket page then shows "refunded" with no QR codes. |
| Email | 7 | Resend accepts the ticket email (inline QR, calendar file, `tickets@` sender) and the sold-out refund notice. The QR is embedded the Gmail-safe way. Dates are in Pacific time. |
| Access control | 10 | Attendance, check-in, CSV export and all admin APIs refuse signed-out requests. Admin and staff pages redirect to login before any data is sent. |

**Fixed during testing:** the attendance CSV export allowed spreadsheet formula injection (a buyer named `=HYPERLINK(...)` would have run as a formula in Excel or Sheets). Names starting with `=`, `+`, `-` or `@` are now forced to plain text, and the file opens accented names (José, Zoë) correctly in Excel.

Test data from these runs lived on the TEST event in production (orders named "E2E Tester…", "Race…", "Refund Test…"). It was wiped on Nov 6 along with the TEST event. Future testing runs on staging only.

---

## Part 2: needs you (a real phone, your login, or Stripe's checkout page)

### Setup (on staging)
Run everything on **staging.spiritathletics.net**. No tunnel and no `stripe listen` needed. See [staging-setup.md](staging-setup.md).
1. Run `npm run staging:reset` for a fresh on-sale event. It prints the buy, attendance and scanner links.
2. Sign in on your phone with your staging admin login.
3. Pay with test cards only. Stripe's checkout page shows **Test mode / Sandbox**.

### A. Buyer on a phone (highest priority: most buyers)
Do this on **iPhone Safari** and, if you can, an **Android** phone.
- [ ] `/showcase` loads. The blue "Get tickets" bar is visible right away, hides when another ticket button is on screen, and never covers the footer.
- [ ] Ticket page: +/− buttons are easy to hit. Tapping the name or email field does **not** zoom the page. The bottom bar hides once you reach the order summary.
- [ ] Pay with `4242 4242 4242 4242`. You land on your tickets within a few seconds.
- [ ] Tickets page: tapping reveals a code, tapping again hides it, and opening one closes the others.
- [ ] Load the tickets page, then turn on **airplane mode**: the codes still open. The email's group QR is also viewable offline.
- [ ] Email in the **Gmail app** and **Apple Mail**: the QR shows, "View individual tickets" opens the page, and the calendar invite adds correctly.

### B. Payment edge cases (Stripe test cards, any future expiry, any CVC)
- [ ] Declined `4000 0000 0000 0002`: Stripe shows the error and you can retry. No email, no order.
- [ ] 3-D Secure `4000 0025 0000 3155`: complete the challenge. Tickets are issued.
- [ ] Insufficient funds `4000 0000 0000 9995`: error, no order.
- [ ] Press back on the Stripe page: the "Checkout canceled" page appears and "Back to tickets" works.
- [ ] Pay, then close the tab before the success page loads: the email still arrives (tickets don't depend on the redirect).

### C. At the door (staff phone, signed in)
- [ ] Scan one individual ticket: green, **1 wristband**.
- [ ] Scan the group QR from the email: green, **N wristbands**, plus "N more already checked in" if some were scanned first.
- [ ] Scan the same code again: yellow **Already checked in**, with no second wristband. Move it out of view for a second first. A code held steady in front of the camera is ignored, so it can't re-trigger by accident.
- [ ] Tap **Scan another** and hold up a different ticket: it reads almost instantly, with no wait.
- [ ] Refund an order from the Stripe **test** dashboard (Payments → the payment → Refund). Within a few seconds its ticket page says "refunded", and scanning it shows red **Ticket void**. This also proves Stripe's real refund delivery to staging.
- [ ] Create a second event in staging admin (the New event defaults are fine), open **its** scanner, and scan a Staging Showcase ticket: red **Wrong event**.
- [ ] Scan any non-ticket QR (a website QR, for example): red **Not a ticket**.
- [ ] Two phones scan the same group QR at the same moment: one green, one yellow.
- [ ] Airplane mode on the scanner phone: you get the "No connection" popup, and the same code works once you're back online.
- [ ] Flashlight button (Android), screen stays awake, no scrolling or zooming, X returns to Attendance.
- [ ] Attendance: search by name, check someone in manually. A second device shows the new count within about 15 seconds.
- [ ] Export CSV opens cleanly in Excel or Google Sheets, and totals match the Stripe test dashboard.

### D. Admin and sales windows (desktop is fine)
- [ ] Edit the staging event and try an invalid change (doors after start): saving is blocked with a clear message.
- [ ] Date picker, status dropdown and Early Bird switches all work. "Discard" restores the original values. Leaving with unsaved changes asks before going.
- [ ] Each sales window, using `npm run staging:reset <window>`, then reload the ticket page:
  - `door`: door prices.
  - `gap`: "Door pricing opens online…", nothing buyable.
  - `upcoming`: "On sale …".
  - `closed`: "Online sales have closed".
  - `door-only`: the Fall 2026 setup; tells buyers online tickets open at 8 AM on show day.

The real Fall 2026 fix (start → **Nov 8, 1:00 PM**, plus the tier toggles) is a launch step, not a staging test: see checklist section 1.

### E. Before deploy
Finish Part 3 below, then continue with [showcase-launch-checklist.md](showcase-launch-checklist.md), sections 4–6: production config, cleanup, deploy, and day-of.

---

## Part 3: release regression (everything else going live)

Production is on `d613d9e`. Pushing `main` also releases the site redesign and the rebuilt forms, so test anywhere money changes hands or a record gets created. Run these on **staging** with a real phone where possible. They create test records on staging only; nothing here touches production.

**Short on time?** Do A1, A2, A3, B and F first.

### A. Booking popups (rebuilt; highest priority)
- [ ] **A1. Private lesson, card:**
  - Use Quick Book on `/book/privates`, then press Continue to payment and pay with `4242 4242 4242 4242`.
  - The success page and confirmation email arrive.
  - The booking shows in Dashboard → Bookings and on the front desk board.
- [ ] **A2. Private lesson, cash:** choose "Pay at the gym" → Book lesson. You land on the cash success page; Stripe never opens.
- [ ] **A3. Cancel link:** use the link in A1's email. The booking cancels, the card payment is refunded in the Stripe test dashboard, and the time slot reopens.
- [ ] **A4. Booking approval:** turn it on in Dashboard → Preferences, then book a private lesson. It waits as a request until you approve it. Turn it back off afterwards.
- [ ] **A5. Class with 2 athletes:**
  - Create a class in Dashboard → Classes; this also tests the class editor.
  - Book it for 2 athletes: the total doubles. Add and remove an athlete and confirm the total updates.
- [ ] **A5b. Multi-coach class:**
  - With only you as coach, the Spots stepper stops at 10.
  - Add a second coach: Spots now goes up to 20. At 17 spots, the "more than 8 athletes per coach" warning appears but you can still save.
  - Save. The added coach gets a "You're coaching…" email. Saving again without changing coaches sends no second email.
  - Edit, set spots to 14, then remove the second coach. A red rule message appears and Save is disabled.
  - Sign in as the second coach. The class shows a Co-coach badge with no edit or delete buttons. A booking shows in their Bookings list and booking email.
  - On /book/classes, the card and the booking dialog list both coaches.
- [ ] **A6. Clinic with 2 spots:**
  - Create the clinic in Dashboard → Clinics.
  - Register 2 athletes: "Add another athlete" disappears at the limit.
  - The names appear on the public registrant list, and the clinic then shows Sold out.
- [ ] **A6b. Simultaneous bookings can't overbook:**
  - Make a class session with 2 spots left. Run `npx tsx scripts/test-overbooking.ts class <occurrenceId> <serviceId> 5`. Exactly 2 should book and 3 should be rejected.
  - Repeat for a clinic: `npx tsx scripts/test-overbooking.ts clinic <clinicId> 5`.
  - Cancel the "Race Test" bookings in the dashboard afterwards.
- [ ] **A6c. Card payment for a class that filled during checkout gets refunded:**
  - Make a class with 1 spot left. In tab 1, start a card booking and stop on the Stripe page.
  - In tab 2, take the last spot with cash.
  - Finish paying in tab 1 (test card 4242…). No booking is created. Stripe shows the payment refunded, and the customer gets a "This class filled up" email.
  - Repeat with a clinic.
- [ ] **A7. Bad input:** submit with empty fields and with a mistyped email. Each field shows its own message, and nothing is sent.

### B. Waiver (on a phone)
- [ ] Sign with your finger, then use "Sign for another athlete" for a sibling. The parent details stay filled in.
- [ ] Both waivers appear in Dashboard → Waivers with the signature, and the search finds them.
- [ ] Press Submit with something missing: "Still needed: …" lists exactly what's missing.

### C. Shop (no live campaign, so staging only)
- [ ] Create a campaign and a product in shop admin (tests both editors).
- [ ] Add to cart, then open checkout: the cart items are listed, and the preorder box is required.
- [ ] Pay with a test card. The order shows in shop admin → Orders.
- [ ] End the campaign: `/shop` shows "No pop-up currently open".

### D. Staff accounts
- [ ] A wrong password shows the new message, and the right one opens the dashboard.
- [ ] Add a coach (the default password note shows), then press Send reset. The reset email arrives, the reset page works, and you can log in as them.
- [ ] Deactivate that coach: their login is blocked, and they disappear from private lesson booking.
- [ ] Add an availability rule: it shows in Quick Book. Reserve a slot: it disappears from the public times.

### E. Every page on a phone (the redesign touched them all)
- [ ] **Menu, header and footer:** the menu opens and closes, every link works, and the Book button works.
- [ ] **Homepage:**
  - The show card's countdown ticks and "Get tickets" works.
  - Dismiss the banner and reload: it stays dismissed.
- [ ] **Calendar:** opens in List view on a phone, the Month toggle works, and "Open in Google Calendar" works.
- [ ] **Contact:**
  - Tapping the phone number dials.
  - The email topics open your mail app with the subject filled in.
  - Directions open Maps.
- [ ] **Forms:** the waiver link works, the program information PDF downloads, and "Request from the front desk" opens an email.
- [ ] **Other pages:**
  - Parent Portal opens iClassPro.
  - Tryouts says "2026–27 tryouts are complete".
  - Programs and each level page load.
- [ ] **Devices:** at least one iPhone (Safari) and one Android (Chrome), plus one phone in dark mode.

### F. Right after the production deploy (live site)
- [ ] `/showcase/fall-2026/tickets` shows the prices and the reduced fee you set. VIP shows Sold out, and there's no Early Bird.
- [ ] Then run the 5-minute live check in [showcase-launch-checklist.md](showcase-launch-checklist.md) section 4, step 5.
