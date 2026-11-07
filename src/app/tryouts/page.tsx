import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CircleCheck,
  ClipboardList,
  Info,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { PROGRAMS } from '@/lib/programs';
import { SITE, mailto } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tryouts · Spirit Athletics',
  description: 'Tryout clinics, tryout day, placement fees and what to expect for Spirit Athletics competitive teams.',
};

// ── Update these each season. Once RESULTS_END passes, the page switches to "complete". ──
const SEASON = '2026–27';
const RESULTS_END = new Date('2026-06-08T07:00:00Z'); // end of Sun, June 7 (Pacific)
const DATES_LINE = 'Clinics June 1–3 · Tryouts June 6 · Results June 7';

const KEY_DATES: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: BookOpen, label: 'Clinics', value: 'June 1 – 3' },
  { icon: Star, label: 'Tryouts', value: 'Saturday, June 6' },
  { icon: ClipboardList, label: 'Results & parent meetings', value: 'Sunday, June 7' },
];

const CLINICS = [
  {
    date: 'June 1',
    label: 'Level 1',
    sessions: [
      { group: 'Ages 6–9', time: '4:30 – 6:30 PM' },
      { group: 'Ages 10–18', time: '6:30 – 8:30 PM' },
    ],
  },
  {
    date: 'June 2',
    label: 'Levels 2 / 3',
    sessions: [
      { group: 'Ages 6–9', time: '4:30 – 6:30 PM' },
      { group: 'Ages 10–18', time: '6:30 – 8:30 PM' },
    ],
  },
  {
    date: 'June 3',
    label: 'Levels 4 / 5 / 6',
    sessions: [{ group: 'All ages', time: '6:00 – 8:30 PM' }],
  },
];

const TRYOUT_SESSIONS = [
  { group: 'Ages 4–6', time: '1:00 – 2:00 PM', note: 'Tiny division' },
  { group: 'Ages 6–9', time: '2:00 – 4:00 PM' },
  { group: 'Ages 10–18', time: '4:00 – 6:00 PM' },
];

const PARENT_MEETINGS = [
  { group: 'Returning families', time: '5:30 – 6:30 PM' },
  { group: 'New families', time: '6:45 – 8:00 PM' },
];

const STEPS = [
  {
    title: 'Skills assessment',
    body: 'Evaluation of tumbling, stunting, jumping, and dance abilities appropriate for your age and experience.',
  },
  {
    title: 'Learn a routine',
    body: 'Coaches teach a short routine showcasing your ability to learn choreography and perform with confidence.',
  },
  {
    title: 'Team placement',
    body: 'Based on skills and goals, our coaches recommend the best program level for your success and growth.',
  },
];

const BRING = [
  'Athletic clothing you can move freely in',
  'Clean athletic shoes (cheer shoes preferred)',
  'Hair pulled back in a high ponytail or bun',
  'Water bottle and a positive attitude',
  'Completed forms and Parent Portal registration',
];

export default function TryoutsPage() {
  const complete = Date.now() > RESULTS_END.getTime();

  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow={complete ? `${SEASON} tryouts are complete` : `${SEASON} season placements`}
        title="Join the"
        accent="Spirit family"
        lead={
          complete
            ? 'Thank you to every athlete who tried out. Tryouts are held the first week of June each year; next season’s dates and registration will be posted here.'
            : DATES_LINE
        }
        bottomSpace
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          {complete ? (
            <>
              <Link href="/book/classes" className={buttonStyles({ variant: 'white', size: 'lg' })}>
                Prepare with tumbling classes
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/programs" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
                Explore programs
              </Link>
            </>
          ) : (
            <>
              <a
                href={SITE.portalHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: 'white', size: 'lg' })}
              >
                Register now
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
              <a href={mailto('Tryout question')} className={buttonStyles({ variant: 'glass', size: 'lg' })}>
                Questions? Email us
              </a>
            </>
          )}
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-white/60">
          <MapPin className="size-4" aria-hidden />
          {SITE.name} · {SITE.addressLine1}, {SITE.addressLine2}
        </p>
      </PageHero>

      {/* Key dates */}
      <section aria-label="Key dates" className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {KEY_DATES.map(({ icon, label, value }) => (
            <div key={label} className={cardClass(false, 'flex items-center gap-4 p-5 shadow-soft-lg sm:block sm:p-6')}>
              <IconTile icon={icon} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 sm:mt-4">{label}</p>
                <p className={cn('text-lg font-semibold tracking-tight', complete ? 'text-slate-500' : 'text-slate-900')}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
        {complete ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200/70">
            <Info className="mt-0.5 size-4 shrink-0 text-spirit" aria-hidden />
            The dates, fees and schedule on this page are from the {SEASON} season and are shown for reference.
          </p>
        ) : null}
      </section>

      {/* Fees */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader eyebrow="Placement fees" title={`${SEASON} placement fees.`} />
        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft-lg ring-2 ring-spirit/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Clinic + tryout</h3>
              <span className="rounded-full bg-spirit-50 px-2.5 py-1 text-xs font-semibold text-spirit">Best value</span>
            </div>
            <div className="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-spirit">$65</div>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-slate-600">Clinic fee</dt>
                <dd className="font-semibold">$35</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-600">Tryout fee</dt>
                <dd className="font-semibold">$30</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">Recommended for all athletes. Clinics prepare you for tryouts.</p>
          </div>
          <div className={cardClass(false, 'p-6')}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Tryout only</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">No clinic</span>
            </div>
            <div className="mt-3 text-4xl font-semibold tabular-nums tracking-tight">$60</div>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-slate-600">Tryout fee</dt>
                <dd className="font-semibold">$60</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs font-medium text-amber-700">Excludes the Tiny division (ages 4 and 5).</p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-spirit-deep relative isolate overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-[#4169E1] opacity-40 blur-[110px]" />
          <div className="bg-dot-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_60%)]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeader onDark eyebrow="Full schedule" title="Clinics, tryouts and results." />

          <ScheduleGroup
            title="Tryout clinics"
            when="June 1 – 3"
            note="Prep sessions to get ready for tryout day. Strongly recommended."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {CLINICS.map((day) => (
                <div key={day.date} className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{day.date}</p>
                    <span className="rounded-full bg-spirit-50 px-2.5 py-1 text-xs font-semibold text-spirit">{day.label}</span>
                  </div>
                  <ul className="mt-3 grid gap-2">
                    {day.sessions.map((s) => (
                      <li key={s.group} className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200/70">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{s.group}</p>
                        <p className="text-sm font-semibold">{s.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScheduleGroup>

          <ScheduleGroup title="Tryout day" when="Saturday, June 6" note="Team placement evaluations by our coaching staff.">
            <div className="grid gap-3 sm:grid-cols-3">
              {TRYOUT_SESSIONS.map((s) => (
                <SessionCard key={s.group} group={s.group} time={s.time} note={s.note} />
              ))}
            </div>
          </ScheduleGroup>

          <ScheduleGroup
            title="Results & parent meetings"
            when="Sunday, June 7"
            note="Team results announced. Mandatory for all families."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {PARENT_MEETINGS.map((m) => (
                <SessionCard key={m.group} group={m.group} time={m.time} />
              ))}
            </div>
          </ScheduleGroup>
        </div>
      </section>

      {/* What to expect */}
      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeader eyebrow="What to expect" title="How tryouts work." />
          <ol className="mt-8 grid gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="bg-spirit-gradient flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className={cardClass(false, 'p-6 sm:p-7 lg:mt-14')}>
          <h3 className="text-lg font-semibold tracking-tight">What to bring</h3>
          <ul className="mt-4 grid gap-3">
            {BRING.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-spirit" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Program levels */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <SectionHeader eyebrow="Program levels" title="Where athletes are placed." />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <Link key={p.slug} href={`/programs/${p.slug}`} className={cardClass(true, 'group flex flex-col p-5')}>
              <IconTile icon={p.icon} size="sm" />
              <h3 className="mt-4 font-semibold tracking-tight">{p.shortName}</h3>
              <p className="text-xs font-semibold text-spirit">
                {p.ages} · {p.schedule}
              </p>
              <p className="mt-2 text-sm leading-snug text-slate-600">{p.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {complete ? (
        <CtaPanel
          title="Get ready for next season."
          body="Tumbling classes run year-round, and our staff can help you find the right program before tryouts."
        >
          <Link href="/book/classes" className={buttonStyles({ variant: 'white', size: 'lg' })}>
            Book a tumbling class
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <a href={mailto('Tryout question')} className={buttonStyles({ variant: 'glass', size: 'lg' })}>
            <Mail className="size-4" aria-hidden />
            Email us
          </a>
        </CtaPanel>
      ) : (
        <CtaPanel title="Ready to join our championship team?" body={`${DATES_LINE}. Don’t miss your spot!`}>
          <a
            href={SITE.portalHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: 'white', size: 'lg' })}
          >
            Register on Parent Portal
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <a href={SITE.phoneHref} className={buttonStyles({ variant: 'glass', size: 'lg' })}>
            <Phone className="size-4" aria-hidden />
            {SITE.phoneDisplay}
          </a>
        </CtaPanel>
      )}
    </div>
  );
}

function ScheduleGroup({
  title,
  when,
  note,
  children,
}: {
  title: string;
  when: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <span className="text-sm font-semibold text-white/70">{when}</span>
      </div>
      <p className="-mt-2 mb-4 text-sm text-white/65">{note}</p>
      {children}
    </div>
  );
}

function SessionCard({ group, time, note }: { group: string; time: string; note?: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center gap-2">
        <Users className="size-4 text-spirit" aria-hidden />
        <p className="font-semibold">{group}</p>
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-spirit">{time}</p>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}
