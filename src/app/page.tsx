import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  GraduationCap,
  MapPin,
  ShoppingBag,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  Zap,
} from 'lucide-react';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { buttonStyles } from '@/components/ui/Button';
import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';
import { Countdown } from '@/app/showcase/_components/Countdown';
import { SalesStatePill } from '@/app/showcase/_components/SalesStatePill';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { prisma } from '@/lib/prisma';
import { PROGRAMS } from '@/lib/programs';
import { ACHIEVEMENT_STATS, SITE } from '@/lib/site';
import { displayPriceCents, onlineSalesState, remainingForTier, salesAreOpen } from '@/lib/ticketing';
import { formatPt } from '@/lib/time';

export const dynamic = 'force-dynamic';

async function getActiveTicketedEvent() {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: { status: 'ACTIVE', salesCloseAtUTC: { gt: now } },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { startDateTimeUTC: 'asc' },
    take: 3,
  });
  const event = events.find((e) => salesAreOpen(e, now)) ?? events[0] ?? null;
  if (!event) return null;

  const state = onlineSalesState(event, event.tiers, now);
  const prices = event.tiers
    .filter((t) => t.showOnline)
    .filter((t) => {
      const left = remainingForTier(t);
      return left == null || left > 0;
    })
    .map((t) => displayPriceCents(t, state).cents);
  return {
    event,
    state,
    fromCents: prices.length ? Math.min(...prices) : null,
    onSale: state.kind === 'EARLY_BIRD' || state.kind === 'DOOR',
  };
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

const WHY = [
  {
    icon: Zap,
    title: 'Programs for all levels',
    body: 'From non-competitive beginners to Elite All-Star teams, we have a program for every athlete to grow and excel.',
  },
  {
    icon: Users,
    title: 'Experienced staff',
    body: 'Our dedicated coaches bring years of experience and passion to every practice and competition.',
  },
  {
    icon: UserRound,
    title: 'Parent Portal',
    body: 'Access schedules, payments, and important updates through our convenient iClassPro parent portal.',
  },
];

const FAMILY_LINKS = [
  { href: '/book', icon: CalendarPlus, title: 'Book online', body: 'Classes, private lessons and clinics.' },
  { href: '/calendar', icon: CalendarDays, title: 'Calendar', body: 'Upcoming events and important dates.' },
  { href: SITE.portalHref, icon: UserRound, title: 'Parent Portal', body: 'Schedules, payments and account updates.', external: true },
  { href: '/shop', icon: ShoppingBag, title: 'Shop', body: 'Spirit Athletics gear and pop-up shops.' },
];

export default async function Home() {
  const featured = await getActiveTicketedEvent();

  return (
    <div className="bg-canvas font-sans text-slate-900">
      {featured ? (
        <AnnouncementBanner
          id={`tickets-${featured.event.slug}`}
          icon={<Ticket />}
          message={`${featured.event.title} · ${formatPt(featured.event.startDateTimeUTC, 'EEE, MMM d')}`}
          linkHref={`/showcase/${featured.event.slug}/tickets`}
          linkLabel="Get tickets"
        />
      ) : null}

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <HeroBackdrop />
        <Image
          src="/images/SpiritAthletics_Logo_Header_Full  Render.JPG"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-25 mix-blend-luminosity [mask-image:linear-gradient(to_bottom,black_40%,transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-24 pt-12 sm:px-6 sm:pb-32 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 ring-1 ring-inset ring-white/15 motion-safe:animate-rise">
              <Sparkles className="size-3.5" aria-hidden />
              Hesperia, CA · Since {SITE.founded}
            </p>
            <h1
              className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl motion-safe:animate-rise"
              style={{ animationDelay: '60ms' }}
            >
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-white via-[#c9cdff] to-[#7c88ff] bg-clip-text text-transparent">
                Spirit Athletics
              </span>
            </h1>
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 motion-safe:animate-rise"
              style={{ animationDelay: '120ms' }}
            >
              Competitive cheerleading programs for athletes of all levels, from non-competitive to Elite All-Star
              teams.
            </p>
            <div
              className="mt-8 flex flex-col gap-3 sm:flex-row motion-safe:animate-rise"
              style={{ animationDelay: '180ms' }}
            >
              <Link href="/programs" className={buttonStyles({ variant: 'white', size: 'lg' })}>
                Explore programs
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/book" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
                Book a class
              </Link>
            </div>
          </div>

          <div className="motion-safe:animate-rise" style={{ animationDelay: '240ms' }}>
            {featured ? <FeaturedShowCard featured={featured} /> : <ProgramLadderCard />}
          </div>
        </div>
      </section>

      {/* Results */}
      <section aria-label="Results" className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:-mt-16 sm:px-6">
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {ACHIEVEMENT_STATS.map((s) => (
            <div key={s.label} className="rounded-3xl bg-white p-5 shadow-soft-lg ring-1 ring-slate-200/70 sm:p-6">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <div className="text-3xl font-semibold tabular-nums tracking-tight text-spirit sm:text-4xl">{s.value}</div>
                <div className="mt-1 text-sm text-slate-600">{s.label}</div>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Programs"
            title="A path for every athlete."
            lead="From first-time cheerleaders to elite competitors, each program builds on the last."
          />
          <Link
            href="/programs"
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-full px-3 text-sm font-semibold text-spirit hover:bg-spirit-50 sm:self-auto"
          >
            Compare programs
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <Link key={p.slug} href={`/programs/${p.slug}`} className={cardClass(true, 'group flex flex-col p-5 sm:p-6')}>
              <div className="flex items-center justify-between">
                <IconTile
                  icon={p.icon}
                  className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Level {p.level}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{p.shortName}</h3>
              <p className="text-sm font-medium text-spirit">{p.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.summary}</p>
              <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                <span className="text-slate-500">
                  {p.ages} · {p.schedule}
                </span>
                <ArrowRight
                  className="size-4 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-spirit"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Spirit */}
      <section className="bg-spirit-deep relative isolate overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-[#4169E1] opacity-40 blur-[110px]" />
          <div className="bg-dot-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_60%)]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeader
            onDark
            eyebrow="Why Spirit Athletics"
            title="A gym that grows with your athlete."
            lead="We’ve built a reputation for developing not just skilled athletes, but confident, disciplined young people."
          />
          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
            {WHY.map(({ icon, title, body }) => (
              <div key={title} className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
                <IconTile icon={icon} />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
          <Link
            href="/about"
            className={buttonStyles({ variant: 'glass', className: 'mt-8 sm:mt-10' })}
          >
            Our story
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Families */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeader eyebrow="For families" title="Everything you need, in one place." />
        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {FAMILY_LINKS.map(({ href, icon, title, body, external }) => {
            const inner = (
              <>
                <IconTile icon={icon} size="sm" tone="ink" />
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1 font-semibold tracking-tight">
                    {title}
                    {external ? <ArrowUpRight className="size-3.5 text-slate-400" aria-hidden /> : null}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-600">{body}</p>
                </div>
              </>
            );
            const className = cardClass(true, 'flex items-start gap-4 p-5');
            return external ? (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
              </a>
            ) : (
              <Link key={title} href={href} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      <CtaPanel
        title="Ready to join our team?"
        body="Discover the perfect program for your athlete and become part of the Spirit Athletics family."
      >
        <Link href="/programs" className={buttonStyles({ variant: 'white', size: 'lg' })}>
          Explore programs
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/contact" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          Schedule a visit
        </Link>
      </CtaPanel>
    </div>
  );
}

function FeaturedShowCard({ featured }: { featured: NonNullable<Awaited<ReturnType<typeof getActiveTicketedEvent>>> }) {
  const { event, state, fromCents, onSale } = featured;
  return (
    <div className="rounded-[28px] bg-white/[0.06] p-6 shadow-2xl ring-1 ring-inset ring-white/15 backdrop-blur-xl sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Next show</div>
          <div className="mt-1 text-xl font-semibold tracking-tight">{event.title}</div>
          <div className="mt-0.5 text-sm text-white/60">
            {formatPt(event.startDateTimeUTC, "EEE, MMM d 'at' h:mm a 'PT'")}
          </div>
          {event.venue ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-white/60">
              <MapPin className="size-3.5" aria-hidden />
              {event.venue}
            </div>
          ) : null}
        </div>
        <Ticket className="size-6 shrink-0 text-white/40" aria-hidden />
      </div>
      <div className="mt-6">
        <Countdown target={event.startDateTimeUTC.toISOString()} />
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
      <div className="mt-6 grid gap-2">
        <Link
          href={`/showcase/${event.slug}/tickets`}
          className={buttonStyles({ variant: 'white', size: 'lg', className: 'w-full' })}
        >
          {onSale ? 'Get tickets' : 'View tickets'}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link
          href="/showcase"
          className="inline-flex min-h-10 items-center justify-center rounded-full text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          About the show
        </Link>
      </div>
    </div>
  );
}

function ProgramLadderCard() {
  return (
    <div className="rounded-[28px] bg-white/[0.06] p-3 shadow-2xl ring-1 ring-inset ring-white/15 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
        <GraduationCap className="size-4" aria-hidden />
        Find your level
      </div>
      <ul className="grid gap-1">
        {PROGRAMS.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/programs/${p.slug}`}
              className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-white/10"
            >
              <IconTile icon={p.icon} size="sm" tone="glass" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{p.shortName}</span>
                <span className="block text-sm text-white/55">
                  {p.ages} · {p.schedule}
                </span>
              </span>
              <ArrowRight className="size-4 text-white/35 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
