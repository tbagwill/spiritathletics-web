import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CircleDollarSign,
  Clock,
  Route,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { NEXT_SEASON_NOTE, PROGRAMS, PROGRAM_PRICING_NOTE, getProgram, type ProgramSlug } from '@/lib/programs';

const chipClass =
  'inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[13px] text-white/85 ring-1 ring-inset ring-white/10 sm:px-3.5 sm:py-2 sm:text-sm';

const EXTRA_ICONS: Record<string, LucideIcon> = { 'Session length': Clock, 'Class size': Users };

/** Shared layout for /programs/[slug]. Extra sections (curriculum, benefits) go in `children`. */
export function ProgramDetail({ slug, children }: { slug: ProgramSlug; children?: React.ReactNode }) {
  const p = getProgram(slug);
  const details: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Users, label: 'Ages', value: p.ages.replace('Ages ', '') },
    { icon: CalendarDays, label: 'Practice', value: p.schedule },
    { icon: Route, label: 'Travel', value: p.travel },
    { icon: Trophy, label: 'Competition', value: p.competition },
    ...(p.extraDetails ?? []).map((d) => ({ icon: EXTRA_ICONS[d.label] ?? Clock, ...d })),
  ];

  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        crumbs={[
          { href: '/programs', label: 'Programs' },
          { href: `/programs/${p.slug}`, label: p.shortName },
        ]}
        title={p.name}
        lead={p.intro}
      >
        <ul className="flex flex-wrap gap-2">
          <li className={chipClass}>
            <p.icon className="size-4 text-white/60" aria-hidden />
            Level {p.level} of {PROGRAMS.length}
          </li>
          <li className={chipClass}>
            <Users className="size-4 text-white/60" aria-hidden />
            {p.ages}
          </li>
          <li className={chipClass}>
            <CalendarDays className="size-4 text-white/60" aria-hidden />
            {p.schedule}
          </li>
        </ul>
      </PageHero>

      {/* Overview + details */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div>
          <SectionHeader eyebrow="Overview" title={`${p.tagline.charAt(0).toUpperCase()}${p.tagline.slice(1)}.`} />
          <div className="mt-6 space-y-5 leading-relaxed text-slate-700">
            {p.overview.map((para, i) => (
              <p key={i} className={i === 0 ? 'text-lg text-slate-800' : undefined}>
                {para}
              </p>
            ))}
          </div>

          <h3 className="mt-10 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Program highlights</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-soft ring-1 ring-slate-200/70">
                <CircleCheck className="size-5 shrink-0 text-spirit" aria-hidden />
                <span className="font-medium">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className={cardClass(false, 'p-6')}>
            <h2 className="text-lg font-semibold tracking-tight">Program details</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-spirit-50 text-spirit">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <dt className="text-sm text-slate-500">{label}</dt>
                  <dd className="ml-auto text-right text-sm font-semibold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CircleDollarSign className="size-4 text-spirit" aria-hidden />
                Pricing coming soon
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{PROGRAM_PRICING_NOTE}</p>
            </div>
            <div className="mt-5 grid gap-2">
              <Link href="/tryouts" className={buttonStyles({ className: 'w-full' })}>
                Tryout information
              </Link>
              <Link href="/contact" className={buttonStyles({ variant: 'outline', className: 'w-full' })}>
                Contact us
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {children}

      {/* Other levels */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <SectionHeader eyebrow="All programs" title="Explore every level." />
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((o) => {
            const current = o.slug === p.slug;
            return (
              <li key={o.slug}>
                <Link
                  href={`/programs/${o.slug}`}
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'group flex h-full items-center gap-3 rounded-3xl p-4 ring-1 transition-all duration-300',
                    current
                      ? 'bg-ink text-white ring-ink'
                      : 'bg-white shadow-soft ring-slate-200/70 hover:-translate-y-0.5 hover:ring-spirit/40',
                  )}
                >
                  <IconTile icon={o.icon} size="sm" tone={current ? 'glass' : 'blue'} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-xs font-medium', current ? 'text-white/55' : 'text-slate-400')}>
                      Level {o.level}
                      {current ? ' · You’re here' : ''}
                    </span>
                    <span className="block font-semibold">{o.shortName}</span>
                  </span>
                  {current ? null : (
                    <ArrowRight
                      className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-spirit"
                      aria-hidden
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <CtaPanel title={p.ctaTitle} body={NEXT_SEASON_NOTE}>
        <Link href="/tryouts" className={buttonStyles({ variant: 'white', size: 'lg' })}>
          Tryout information
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/book/classes" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          Tumbling classes
        </Link>
      </CtaPanel>
    </div>
  );
}
