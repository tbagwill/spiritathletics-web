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

Test data from these runs lives on the TEST event (orders named "E2E Tester…", "Race…", "Refund Test…") and is removed when the TEST event is deleted.

---

## Part 2: needs you (a real phone, your login, or Stripe's checkout page)

### Setup
`stripe listen` and the Cloudflare tunnel were both closed when I ran the tests. Restart both:
1. `stripe listen --forward-to localhost:3000/api/stripe/webhook --all-snapshot`
2. `cloudflared tunnel --url http://localhost:3000`, then paste the new address so `.env.local` can be updated.
3. `npm run dev`, then sign in on your phone through the tunnel address.

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
- [ ] Scan the same code again: yellow **Already checked in**, with no second wristband.
- [ ] Scan a refunded ticket (the "Refund Test" order on the TEST event): red **Ticket void**.
- [ ] Open the **Fall 2026** scanner and scan a TEST-event ticket: red **Wrong event**.
- [ ] Scan any non-ticket QR (a website QR, for example): red **Not a ticket**.
- [ ] Two phones scan the same group QR at the same moment: one green, one yellow.
- [ ] Airplane mode on the scanner phone: you get the "No connection" popup, and the same code works once you're back online.
- [ ] Flashlight button (Android), screen stays awake, no scrolling or zooming, X returns to Attendance.
- [ ] Attendance: search by name, check someone in manually. A second device shows the new count within about 15 seconds.
- [ ] Export CSV opens cleanly in Excel or Google Sheets, and totals match Stripe for the TEST event.

### D. Admin (desktop is fine)
- [ ] Open Fall 2026. The warning and timeline flag the Nov 4 start. Fix it to **Nov 8, 1:00 PM**, then save.
- [ ] Try an invalid change (doors after start): saving is blocked with a clear message.
- [ ] Date picker, status dropdown and Early Bird switches all work. "Discard" restores the original values. Leaving with unsaved changes asks before going.
- [ ] On the TEST event, move Early Bird's end into the past: the ticket page switches to door prices. Move sales close into the past: the page says closed and checkout is refused.

### E. Before deploy
Continue with [showcase-launch-checklist.md](showcase-launch-checklist.md), sections 4–6: production config, cleanup, deploy, and day-of.
