import Link from 'next/link';
import {
  ArrowRight,
  Ban,
  CalendarDays,
  Clock,
  Crown,
  Mail,
  MapPin,
  Sparkles,
  Star,
  Ticket,
  Users,
  Wifi,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPt, ptDateString, ptMidnightUtc } from '@/lib/time';
import { displayPriceCents, onlineSalesState, remainingForTier } from '@/lib/ticketing';
import { buttonStyles } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HeroBackdrop } from './_components/HeroBackdrop';
import { EventMetaChips } from './_components/EventMetaChips';
import { SalesStatePill, salesStateDetail, salesStateLabel } from './_components/SalesStatePill';
import { Countdown } from './_components/Countdown';
import { MobileTicketBar } from './_components/MobileTicketBar';

export const metadata = {
  title: 'Spirit Spectacular · Spirit Athletics',
  description:
    'Our bi-annual showcase. Watch every team Spirit Athletics has to offer perform live, meet vendors, and cheer on your athletes.',
};

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

const EXPECT = [
  {
    icon: Users,
    title: 'Every team, one day',
    body: 'From non-competitive to Elite All-Star, every program hits the floor.',
  },
  {
    icon: Star,
    title: 'Our fall show',
    body: 'The fall showcase brings the entire spring floor out for an even bigger experience.',
  },
  {
    icon: Crown,
    title: 'Vendors & VIP',
    body: 'Limited VIP passes grant early access to vendors and front-row seating.',
  },
];

export default async function ShowcasePage() {
  const now = new Date();

  // Next upcoming public (non-draft) event.
  const upcoming = await prisma.event.findFirst({
    where: {
      status: { in: ['ACTIVE', 'CLOSED'] },
      startDateTimeUTC: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { startDateTimeUTC: 'asc' },
  });

  const state = upcoming ? onlineSalesState(upcoming, upcoming.tiers, now) : null;
  const onSale = state?.kind === 'EARLY_BIRD' || state?.kind === 'DOOR';
  const tiers = (upcoming?.tiers ?? [])
    .filter((t) => t.showOnline)
    .map((t) => {
      const remaining = remainingForTier(t);
      return { tier: t, ...displayPriceCents(t, state!), soldOut: remaining != null && remaining <= 0 };
    });
  const available = tiers.filter((t) => !t.soldOut);
  const fromCents = available.length ? Math.min(...available.map((t) => t.cents)) : null;
  const ticketsHref = upcoming ? `/showcase/${upcoming.slug}/tickets` : '#';
  const mapsHref = upcoming?.venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [upcoming.venue, upcoming.venueAddress].filter(Boolean).join(', '),
      )}`
    : null;
  const daysAway = upcoming
    ? Math.round(
        (ptMidnightUtc(ptDateString(upcoming.startDateTimeUTC)).getTime() - ptMidnightUtc(ptDateString(now)).getTime()) /
          86_400_000,
      )
    : 0;
  const whenLabel =
    daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : daysAway > 1 ? `In ${daysAway} days` : 'This past show';

  return (
    <div className="bg-canvas font-sans text-slate-900">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <HeroBackdrop imageUrl={upcoming?.heroImageUrl} />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-20 pt-10 sm:gap-12 sm:px-6 sm:pb-24 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_400px] lg:pb-32">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 ring-1 ring-inset ring-white/15 motion-safe:animate-rise">
              <Sparkles className="size-3.5" aria-hidden />
              Spirit Athletics presents
            </p>
            <h1
              className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl motion-safe:animate-rise"
              style={{ animationDelay: '60ms' }}
            >
              Spirit
              <br />
              <span className="bg-gradient-to-r from-white via-[#c9cdff] to-[#7c88ff] bg-clip-text text-transparent">
                Spectacular
              </span>
            </h1>
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 motion-safe:animate-rise"
              style={{ animationDelay: '120ms' }}
            >
              Our bi-annual showcase. Every team Spirit Athletics has to offer, live on the competition floor.
            </p>
            {upcoming ? (
              <div className="mt-8 motion-safe:animate-rise" style={{ animationDelay: '180ms' }}>
                <EventMetaChips
                  startDateTimeUTC={upcoming.startDateTimeUTC}
                  doorsOpenUTC={upcoming.doorsOpenUTC}
                  venue={upcoming.venue}
                />
              </div>
            ) : (
              <p className="mt-8 text-white/60">The next show date will be announced soon.</p>
            )}
          </div>

          {upcoming && state ? (
            <div
              className="rounded-[28px] bg-white/[0.06] p-6 shadow-2xl ring-1 ring-inset ring-white/15 backdrop-blur-xl motion-safe:animate-rise sm:p-7"
              style={{ animationDelay: '240ms' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Next show</div>
                  <div className="mt-1 text-xl font-semibold tracking-tight">{upcoming.title}</div>
                  <div className="mt-0.5 text-sm text-white/60">
                    {formatPt(upcoming.startDateTimeUTC, "EEE, MMM d 'at' h:mm a 'PT'")}
                  </div>
                </div>
                <Ticket className="size-6 shrink-0 text-white/40" aria-hidden />
              </div>
              <div className="mt-6">
                <Countdown target={upcoming.startDateTimeUTC.toISOString()} />
              </div>
              <div className="my-6 border-t border-dashed border-white/15" />
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs text-white/50">{fromCents != null ? 'Tickets from' : 'Tickets'}</div>
                  <div className="text-3xl font-semibold tabular-nums tracking-tight">
                    {fromCents != null ? dollars(fromCents) : 'Sold out'}
                  </div>
                </div>
                <SalesStatePill state={state} />
              </div>
              <Link
                data-cta
                href={ticketsHref}
                className={buttonStyles({ variant: 'white', size: 'lg', className: 'mt-6 w-full' })}
              >
                {onSale ? 'Get tickets' : 'View tickets'}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Key details */}
      {upcoming ? (
        <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <DetailCard
              icon={CalendarDays}
              label="Date"
              title={formatPt(upcoming.startDateTimeUTC, 'EEEE, MMMM d')}
              body={whenLabel}
            />
            <DetailCard
              icon={Clock}
              label="Time"
              title={`Show at ${formatPt(upcoming.startDateTimeUTC, 'h:mm a')}`}
              body={upcoming.doorsOpenUTC ? `Doors open ${formatPt(upcoming.doorsOpenUTC, "h:mm a 'PT'")}` : 'Pacific Time'}
            />
            <DetailCard
              icon={MapPin}
              label="Location"
              title={upcoming.venue || 'To be announced'}
              body={upcoming.venueAddress || ''}
              href={mapsHref}
              hrefLabel="Get directions"
            />
          </div>
        </section>
      ) : null}

      {/* What to expect */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-spirit">What to expect</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">A full day of every team we have.</h2>
        </div>
        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {EXPECT.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group flex gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg hover:ring-spirit/40 md:block md:p-6"
            >
              <div className="bg-spirit-gradient shadow-spirit flex size-11 shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight md:mt-5">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 md:mt-1.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tickets */}
      {upcoming && state && tiers.length > 0 ? (
        <section id="tickets" className="bg-spirit-deep relative isolate overflow-hidden text-white">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-[#4169E1] opacity-40 blur-[110px]" />
            <div className="bg-dot-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_60%)]" />
          </div>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-white/70">Tickets</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Grab your wristband.</h2>
                <p className="mt-3 text-white/70">Every ticket becomes a wristband, which is also your re-entry pass.</p>
              </div>
              <SalesStatePill state={state} />
            </div>
            <div
              className={
                tiers.length === 1
                  ? 'mt-8 grid max-w-md gap-3 sm:mt-10 sm:gap-4'
                  : tiers.length === 2
                  ? 'mt-8 grid max-w-3xl gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2'
                  : 'mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3'
              }
            >
              {tiers.map(({ tier, cents, earlyBird, soldOut }) => (
                <div
                  key={tier.id}
                  className={
                    tier.tierCode === 'VIP'
                      ? 'relative overflow-hidden rounded-3xl bg-ink p-5 text-white shadow-2xl ring-1 ring-inset ring-white/10 sm:p-6'
                      : 'relative rounded-3xl bg-white p-5 text-slate-900 shadow-2xl transition-transform duration-300 hover:-translate-y-1 sm:p-6'
                  }
                >
                  {tier.tierCode === 'VIP' ? (
                    <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-spirit/50 blur-3xl" />
                  ) : null}
                  <div className="relative">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        {tier.tierCode === 'VIP' ? <Crown className="size-4 text-amber-300" aria-hidden /> : null}
                        {tier.name}
                      </h3>
                      {soldOut ? (
                        <Badge tone="red">Sold out</Badge>
                      ) : earlyBird ? (
                        <Badge tone="green">Early Bird</Badge>
                      ) : null}
                    </div>
                    <div
                      className={
                        tier.tierCode === 'VIP'
                          ? 'mt-3 text-4xl font-semibold tabular-nums tracking-tight sm:mt-4'
                          : 'mt-3 text-4xl font-semibold tabular-nums tracking-tight text-spirit sm:mt-4'
                      }
                    >
                      {dollars(cents)}
                    </div>
                    {tier.description ? (
                      <p className={tier.tierCode === 'VIP' ? 'mt-3 text-sm text-white/65' : 'mt-3 text-sm text-slate-600'}>
                        {tier.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Link data-cta href={ticketsHref} className={buttonStyles({ variant: 'white', size: 'lg' })}>
                {onSale ? 'Buy tickets' : 'View tickets'}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <p className="text-sm text-white/65">
                {salesStateDetail(state) ?? 'Online sales for this show have closed.'}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Good to know */}
      {upcoming ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
          <h2 className="text-2xl font-semibold tracking-tight">Good to know</h2>
          <dl className="mt-6 grid gap-x-10 gap-y-6 sm:mt-8 sm:grid-cols-2 sm:gap-y-8">
            <Fact icon={Mail} title="Tickets arrive by email">
              Each order comes with a QR code that checks in your whole group, plus a code for every ticket.
            </Fact>
            <Fact icon={Wifi} title="Open your tickets before you arrive">
              Cell service at the venue can be spotty. Load your ticket page or email ahead of time.
            </Fact>
            <Fact icon={Ticket} title="Wristbands are your re-entry pass">
              Each ticket is exchanged for a wristband at the door. Lost wristbands can&apos;t be replaced.
            </Fact>
            <Fact icon={Ban} title="All sales are final">
              No refunds or transfers. A {dollars(upcoming.convenienceFeeCents)} online convenience fee applies per order.
            </Fact>
          </dl>
        </section>
      ) : null}

      {/* Closing CTA */}
      {upcoming ? (
        <section className="px-4 pb-14 sm:px-6 sm:pb-20">
          <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-center text-white sm:px-12 sm:py-14">
            <HeroBackdrop compact />
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">See you on the floor.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/65">
              {formatPt(upcoming.startDateTimeUTC, "EEEE, MMMM d 'at' h:mm a")}
              {upcoming.venue ? ` · ${upcoming.venue}` : ''}
            </p>
            <Link
              data-cta
              href={ticketsHref}
              className={buttonStyles({ variant: 'white', size: 'lg', className: 'mt-8 w-full sm:w-auto' })}
            >
              {onSale ? 'Get tickets' : 'View tickets'}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      ) : null}

      {upcoming && state ? (
        <MobileTicketBar
          href={ticketsHref}
          label={onSale ? 'Get tickets' : 'View'}
          title={fromCents != null ? `Tickets from ${dollars(fromCents)}` : upcoming.title}
          subtitle={salesStateLabel(state)}
        />
      ) : null}
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  title,
  body,
  href,
  hrefLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  body: string;
  href?: string | null;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-3xl bg-white p-4 shadow-soft-lg ring-1 ring-slate-200/70 sm:block sm:p-5">
      <span className="bg-spirit-gradient flex size-10 shrink-0 items-center justify-center rounded-xl text-white sm:hidden">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-spirit sm:text-xs">
          <span className="bg-spirit-gradient hidden size-8 items-center justify-center rounded-xl text-white sm:flex">
            <Icon className="size-4" />
          </span>
          {label}
        </div>
        <div className="mt-0.5 font-semibold tracking-tight text-slate-900 sm:mt-3">{title}</div>
        {body ? <div className="mt-0.5 text-sm text-slate-600">{body}</div> : null}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="-mx-2.5 mt-1 inline-flex min-h-10 items-center gap-1 rounded-full px-2.5 text-sm font-semibold text-spirit hover:bg-spirit-50 sm:mt-2"
          >
            {hrefLabel}
            <ArrowRight className="size-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="bg-spirit-gradient shadow-spirit flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
        <Icon className="size-5" />
      </div>
      <div>
        <dt className="font-semibold text-slate-900">{title}</dt>
        <dd className="mt-1 text-sm leading-relaxed text-slate-600">{children}</dd>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
