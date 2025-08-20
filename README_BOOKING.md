# Spirit Athletics Booking Setup

## Env

Create `.env.local`:

```
DATABASE_URL=postgres://... # Vercel Postgres
RESEND_API_KEY=...
NEXTAUTH_SECRET=... # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

APP_TZ=America/Los_Angeles
ORG_ADDRESS="Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345"
SENDER_EMAIL="booking@spiritathletics.net"
```

## Prisma

```
npm run prisma:generate
npm run prisma:migrate -- --name init_booking
npm run db:seed
```

## Develop

```
npm run dev
```

- Public portal: `/book`
- Cancellation: `/cancel?token=...`
- API: `/api/book/class`, `/api/book/private`, `/api/availability/slots`

## Notes
- Pricing is enforced in code for privates (30=$40, 45=$50, 60 solo=$60, 60 semi-private=$35/athlete).
- Times stored as UTC; display as PT.
- Emails/templates and coach dashboard to be added next. 