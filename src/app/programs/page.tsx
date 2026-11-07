import Link from 'next/link';
import { ArrowRight, CalendarDays, CircleCheck, Clock, Dumbbell } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { NEXT_SEASON_NOTE, PROGRAMS } from '@/lib/programs';

export const metadata = {
  title: 'Programs · Spirit Athletics',
  description:
    'Non-Competitive, Novice, Prep and Elite All-Star cheerleading programs for athletes ages 4–18 in Hesperia, CA.',
};

const GETTING_STARTED = [
  {
    icon: CalendarDays,
    title: 'Annual tryouts',
    body: 'Tryouts are held the first week of June each year for the upcoming season.',
  },
  {
    icon: Dumbbell,
    title: 'Tumbling classes',
    body: 'Year-round tumbling classes are available to help prepare for the next season.',
  },
  {
    icon: Clock,
    title: 'Season information',
    body: 'New athletes are rarely accepted after August. Plan ahead for the best opportunities.',
  },
];

export default function ProgramsPage() {
  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Programs"
        title="Our"
        accent="programs"
        lead="From first-time cheerleaders to elite competitors, we have a program designed to help every athlete reach their full potential."
      />

      {/* Program cards */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader
          eyebrow="Find the right fit"
          title="Four levels, one path."
          lead="Each program provides age-appropriate training, skill development, and competitive opportunities that match your athlete’s goals and experience."
        />
        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2">
          {PROGRAMS.map((p) => (
            <Link
              key={p.slug}
              href={`/programs/${p.slug}`}
              className={cardClass(true, 'group flex flex-col p-6 sm:p-7')}
            >
              <div className="flex items-start justify-between gap-4">
                <IconTile
                  icon={p.icon}
                  size="lg"
                  className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                />
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  Level {p.level} of {PROGRAMS.length}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">{p.name}</h3>
              <p className="text-sm font-medium text-spirit">{p.tagline}</p>
              <p className="mt-3 leading-relaxed text-slate-600">{p.summary}</p>
              <ul className="mb-6 mt-5 grid gap-2 sm:grid-cols-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-slate-700">
                    <CircleCheck className="size-4 shrink-0 text-spirit" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{p.ages}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{p.schedule}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-spirit">
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-spirit-deep relative isolate overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-[#4169E1] opacity-40 blur-[110px]" />
          <div className="bg-dot-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_60%)]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeader
            onDark
            eyebrow="Compare"
            title="Programs side by side."
            lead="Compare our programs to find the right fit for your athlete’s skill level and goals."
          />

          {/* Phones: one card per program */}
          <div className="mt-8 grid gap-3 md:hidden">
            {PROGRAMS.map((p) => (
              <Link key={p.slug} href={`/programs/${p.slug}`} className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{p.shortName}</div>
                    <div className="text-sm text-slate-500">{p.tagline}</div>
                  </div>
                  <ArrowRight className="size-4 text-slate-300" aria-hidden />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Spec label="Ages" value={p.ages.replace('Ages ', '')} />
                  <Spec label="Practice" value={p.schedule} />
                  <Spec label="Travel" value={p.travel} />
                  <Spec label="Focus" value={p.focus} />
                </dl>
              </Link>
            ))}
          </div>

          {/* Tablets and up: table */}
          <div className="mt-10 hidden overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th scope="col" className="px-6 py-4">Program</th>
                  <th scope="col" className="px-6 py-4">Ages</th>
                  <th scope="col" className="px-6 py-4">Practice</th>
                  <th scope="col" className="px-6 py-4">Travel</th>
                  <th scope="col" className="px-6 py-4">Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PROGRAMS.map((p) => (
                  <tr key={p.slug} className="transition-colors hover:bg-spirit-50/50">
                    <th scope="row" className="px-6 py-4 font-normal">
                      <Link href={`/programs/${p.slug}`} className="group inline-flex items-center gap-3">
                        <IconTile icon={p.icon} size="sm" />
                        <span>
                          <span className="block font-semibold text-slate-900 group-hover:text-spirit">{p.shortName}</span>
                          <span className="block text-slate-500">{p.tagline}</span>
                        </span>
                      </Link>
                    </th>
                    <td className="px-6 py-4 text-slate-700">{p.ages.replace('Ages ', '')}</td>
                    <td className="px-6 py-4 text-slate-700">{p.schedule}</td>
                    <td className="px-6 py-4 text-slate-700">{p.travel}</td>
                    <td className="px-6 py-4 text-slate-700">{p.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Getting started */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader eyebrow="Getting started" title="Plan ahead for next season." />
        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {GETTING_STARTED.map(({ icon, title, body }) => (
            <div key={title} className={cardClass(false, 'flex gap-4 p-5 md:block md:p-6')}>
              <IconTile icon={icon} />
              <div>
                <h3 className="text-lg font-semibold tracking-tight md:mt-5">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 md:mt-1.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaPanel title="Ready to get started?" body={NEXT_SEASON_NOTE}>
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

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
