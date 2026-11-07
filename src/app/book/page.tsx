import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  Lock,
  Mail,
  MailCheck,
  Phone,
  RotateCcw,
  Star,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { Badge } from '@/components/ui/Badge';
import { buttonStyles } from '@/components/ui/Button';
import { SITE, mailto } from '@/lib/site';

export const metadata = {
  title: 'Book online · Spirit Athletics',
  description: 'Book group classes, private lessons and clinics at Spirit Athletics with secure online payment.',
};

const OPTIONS: {
  href: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  cta: string;
  features: string[];
  badge?: string;
}[] = [
  {
    href: '/book/classes',
    icon: Users,
    tag: 'Group sessions',
    title: 'Classes',
    description: 'Reserve a spot in our scheduled group classes. Browse upcoming sessions, see open spots, and pay securely online.',
    cta: 'Browse classes',
    features: ['Upcoming schedule', 'Instant confirmation', 'Secure payment'],
  },
  {
    href: '/book/privates',
    icon: UserRound,
    tag: '1-on-1 training',
    title: 'Private lessons',
    description: 'Book a dedicated one-on-one or semi-private session with one of our coaches at a time that works for you.',
    cta: 'Book a private',
    features: ['Solo or semi-private', 'Choose your time', '30, 45, or 60 min'],
  },
  {
    href: '/book/classes#clinics',
    icon: Star,
    tag: 'Special events',
    title: 'Clinics',
    description: 'Join our featured clinics and special training events. Spots are limited, so register early to secure your place.',
    cta: 'View clinics',
    features: ['Featured events', 'Limited spots', 'Public registrant list'],
    badge: 'New',
  },
];

const TRUST: { icon: LucideIcon; label: string }[] = [
  { icon: Lock, label: 'Secure Stripe payments' },
  { icon: MailCheck, label: 'Instant email confirmation' },
  { icon: CalendarCheck, label: 'Calendar invite included' },
  { icon: RotateCcw, label: 'Cancel up to 4 hrs before' },
];

const STEPS = [
  { title: 'Choose', body: 'Pick a class, clinic, or private lesson time.' },
  { title: 'Add details', body: 'Tell us who’s coming and how to reach you.' },
  { title: 'Pay securely', body: 'Checkout is handled by Stripe.' },
  { title: 'You’re booked', body: 'Confirmation and a calendar invite arrive by email.' },
];

export default function BookPage() {
  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Online booking"
        title="Book with"
        accent="Spirit Athletics"
        lead="Choose your session type below. Every booking is confirmed instantly with secure online payment."
        bottomSpace
      >
        <ul className="flex flex-wrap gap-2">
          {TRUST.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[13px] text-white/85 ring-1 ring-inset ring-white/10 sm:text-sm"
            >
              <Icon className="size-4 text-white/60" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* Options */}
      <section aria-label="Booking options" className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {OPTIONS.map((o) => (
            <Link key={o.title} href={o.href} className={cardClass(true, 'group flex flex-col p-6 shadow-soft-lg sm:p-7')}>
              <div className="flex items-start justify-between gap-3">
                <IconTile
                  icon={o.icon}
                  size="lg"
                  className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                />
                {o.badge ? <Badge tone="blue">{o.badge}</Badge> : null}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{o.tag}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{o.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{o.description}</p>
              <ul className="mb-6 mt-4 grid gap-1.5">
                {o.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <CircleCheck className="size-4 shrink-0 text-spirit" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <span className={buttonStyles({ className: 'mt-auto w-full' })}>
                {o.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader eyebrow="How it works" title="Booked in four steps." />
        <ol className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className={cardClass(false, 'p-5 sm:p-6')}>
              <span className="flex size-9 items-center justify-center rounded-full bg-spirit-50 text-sm font-semibold tabular-nums text-spirit">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <CtaPanel
        title="Questions about booking?"
        body="Our team is happy to help you find the right session for your athlete."
      >
        <a href={mailto('Booking question')} className={buttonStyles({ variant: 'white', size: 'lg' })}>
          <Mail className="size-4" aria-hidden />
          Email us
        </a>
        <a href={SITE.phoneHref} className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          <Phone className="size-4" aria-hidden />
          {SITE.phoneDisplay}
        </a>
      </CtaPanel>
    </div>
  );
}
