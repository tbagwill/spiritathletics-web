'use client';

import { formatDateTimeValue } from '@/components/ui/DateTimePicker';
import { cn } from '@/components/ui/cn';
import type { ScheduleField } from '@/lib/eventSchedule';
import type { EventFormValues } from './types';

type Point = { field: ScheduleField; label: string; kind: 'sales' | 'show' };

function hoursBetween(a: string, b: string) {
  const toDate = (v: string) => {
    const [d, t] = v.split('T');
    const [y, m, day] = d.split('-').map(Number);
    const [h, min] = t.split(':').map(Number);
    return new Date(y, m - 1, day, h, min).getTime();
  };
  return (toDate(b) - toDate(a)) / 36e5;
}

function duration(hours: number) {
  if (hours <= 0) return '—';
  const d = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  return [d ? `${d}d` : null, h ? `${h}h` : null].filter(Boolean).join(' ') || '<1h';
}

/** Chronological view of every schedule point, so a mistyped date shows up out of order. */
export function ScheduleTimeline({
  values,
  errors,
  earlyBirdOnline,
}: {
  values: EventFormValues;
  errors: Partial<Record<ScheduleField, string>>;
  earlyBirdOnline: boolean;
}) {
  const points: Point[] = [
    { field: 'salesOpenAt', label: earlyBirdOnline ? 'Early Bird goes on sale' : 'Sales window opens', kind: 'sales' },
    { field: 'earlyBirdEndsAt', label: 'Early Bird ends', kind: 'sales' },
    { field: 'doorSalesOpenAt', label: 'Door pricing starts online', kind: 'sales' },
    { field: 'doorsOpen', label: 'Doors open', kind: 'show' },
    { field: 'startDateTime', label: 'Show starts', kind: 'show' },
    { field: 'salesCloseAt', label: 'Online sales close', kind: 'sales' },
    { field: 'endDateTime', label: 'Show ends', kind: 'show' },
  ];
  const dated = points
    .map((p) => ({ ...p, value: values[p.field] as string }))
    .filter((p) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(p.value))
    .sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));

  const ebHours =
    values.salesOpenAt && values.earlyBirdEndsAt ? hoursBetween(values.salesOpenAt, values.earlyBirdEndsAt) : 0;
  const doorHours =
    values.doorSalesOpenAt && values.salesCloseAt ? hoursBetween(values.doorSalesOpenAt, values.salesCloseAt) : 0;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
      <p className="mt-0.5 text-xs text-slate-500">Sorted by time. Anything out of place is flagged.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className={cn('rounded-xl px-3 py-2', earlyBirdOnline ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500')}>
          <div className="font-semibold">Early Bird online</div>
          <div className="tabular-nums">{earlyBirdOnline ? duration(ebHours) : 'Off'}</div>
        </div>
        <div className="rounded-xl bg-spirit-50 px-3 py-2 text-spirit">
          <div className="font-semibold">Door pricing online</div>
          <div className="tabular-nums">{duration(doorHours)}</div>
        </div>
      </div>
      <ol className="relative mt-5 space-y-4">
        <span aria-hidden className="absolute bottom-2 left-[6px] top-2 w-px bg-slate-200" />
        {dated.map((p) => {
          const error = errors[p.field];
          return (
            <li key={p.field} className="relative flex gap-3 motion-safe:animate-fade">
              <span
                className={cn(
                  'relative mt-1 size-[13px] shrink-0 rounded-full ring-4 ring-white',
                  error ? 'bg-red-500' : p.kind === 'show' ? 'bg-amber-400' : 'bg-spirit',
                )}
              />
              <div className="min-w-0">
                <div className={cn('text-sm font-medium', error ? 'text-red-700' : 'text-slate-800')}>{p.label}</div>
                <div className="text-xs tabular-nums text-slate-500">{formatDateTimeValue(p.value)}</div>
                {error ? <div className="mt-0.5 text-xs text-red-600">{error}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
