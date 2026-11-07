'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/components/ui/cn';

type Mode = 'MONTH' | 'AGENDA';

/**
 * Google Calendar embed. Phones get the agenda list (a month grid is unreadable at 375px);
 * wider screens get the month grid. Either can be switched with the toggle.
 */
export function CalendarEmbed({ calendarIds, timeZone }: { calendarIds: string[]; timeZone: string }) {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    setMode(window.matchMedia('(min-width: 768px)').matches ? 'MONTH' : 'AGENDA');
  }, []);

  const base = new URLSearchParams();
  for (const id of calendarIds) base.append('src', id);
  base.set('ctz', timeZone);
  const fullUrl = `https://calendar.google.com/calendar/embed?${base.toString()}`;

  const embed = new URLSearchParams(base);
  embed.set('mode', mode ?? 'MONTH');
  embed.set('showTitle', '0');
  embed.set('showPrint', '0');
  embed.set('showTabs', '0');
  embed.set('showCalendars', '0');
  embed.set('showTz', '0');
  embed.set('wkst', '1');
  embed.set('bgcolor', '#ffffff');

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft-lg ring-1 ring-slate-200/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div role="group" aria-label="Calendar view" className="inline-flex rounded-full bg-slate-100 p-1">
          {(
            [
              { key: 'MONTH', label: 'Month', icon: LayoutGrid },
              { key: 'AGENDA', label: 'List', icon: List },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors',
                mode === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-spirit hover:bg-spirit-50"
        >
          Open in Google Calendar
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
      {mode ? (
        <iframe
          key={mode}
          src={`https://calendar.google.com/calendar/embed?${embed.toString()}`}
          title="Spirit Athletics calendar"
          className="block h-[620px] w-full border-0 sm:h-[760px]"
        />
      ) : (
        <div className="skeleton h-[620px] sm:h-[760px]" aria-label="Loading calendar" />
      )}
    </div>
  );
}
