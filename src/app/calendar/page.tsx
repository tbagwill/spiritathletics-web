import Link from 'next/link';
import { ArrowRight, CalendarDays, Dumbbell, Flag, Trophy, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { CalendarEmbed } from './CalendarEmbed';

export const metadata = {
  title: 'Calendar · Spirit Athletics',
  description: 'Practices, competitions, special events and important dates for every Spirit Athletics program.',
};

const CALENDAR_IDS = [
  '12e16a482f7905033cfc8863c82d9629c0a3de8dd98f782f7ab17b0bfc3ea21e@group.calendar.google.com',
  '4ee448b4a97db488525abe69399f46f74f7109e698765640b3bf62519d73d531@group.calendar.google.com',
  'd08f7bd81e0ced240a45d09e6cc9fc1eabd790b6973ba2a6d9a265ef1430a8f3@group.calendar.google.com',
  '685b6a5e78d6ec7d294e441ef00b6357dd7f08b4642e4375ae2386435bf41582@group.calendar.google.com',
];

const LEGEND = [
  { label: 'Practices', dot: 'bg-spirit-400' },
  { label: 'Competitions', dot: 'bg-red-400' },
  { label: 'Special events', dot: 'bg-emerald-400' },
  { label: 'Important dates', dot: 'bg-violet-400' },
];

const KEY_DATES: { icon: LucideIcon; title: string; when: string; body: string }[] = [
  {
    icon: Flag,
    title: 'Annual tryouts',
    when: 'First week of June',
    body: 'Tryouts for all competitive programs. Registration typically opens in May.',
  },
  {
    icon: CalendarDays,
    title: 'Season start',
    when: 'Late August',
    body: 'Regular season practices begin. New athletes are rarely accepted after this point.',
  },
  {
    icon: Trophy,
    title: 'Competition season',
    when: 'October – March',
    body: 'Peak competition season with local, regional, and national events.',
  },
  {
    icon: Dumbbell,
    title: 'Tumbling classes',
    when: 'Year-round',
    body: 'Ongoing tumbling classes help athletes prepare for tryouts.',
  },
];

export default function CalendarPage() {
  const fullCalendarUrl = `https://calendar.google.com/calendar/embed?${[
    ...CALENDAR_IDS.map((id) => `src=${encodeURIComponent(id)}`),
    'ctz=America%2FLos_Angeles',
  ].join('&')}`;

  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Calendar"
        title="Calendar &"
        accent="events"
        lead="Stay up to date with practices, competitions, and special events for every Spirit Athletics program."
        bottomSpace
      >
        <ul className="flex flex-wrap gap-2" aria-label="Event types">
          {LEGEND.map((l) => (
            <li
              key={l.label}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[13px] text-white/85 ring-1 ring-inset ring-white/10 sm:text-sm"
            >
              <span className={`size-2 rounded-full ${l.dot}`} aria-hidden />
              {l.label}
            </li>
          ))}
        </ul>
      </PageHero>

      <section aria-label="Calendar" className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <CalendarEmbed calendarIds={CALENDAR_IDS} timeZone="America/Los_Angeles" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader eyebrow="Plan ahead" title="Important dates every season." />
        <ol className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {KEY_DATES.map(({ icon, title, when, body }) => (
            <li key={title} className={cardClass(false, 'p-5 sm:p-6')}>
              <IconTile icon={icon} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-spirit">{when}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <CtaPanel
        title="Never miss an important date."
        body="Open the calendar in Google Calendar to add it to your own, or contact us with any questions."
      >
        <a
          href={fullCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: 'white', size: 'lg' })}
        >
          Add to my calendar
          <ArrowRight className="size-4" aria-hidden />
        </a>
        <Link href="/contact" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          Contact us
        </Link>
      </CtaPanel>
    </div>
  );
}
