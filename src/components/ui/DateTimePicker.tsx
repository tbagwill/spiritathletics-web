'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from './cn';
import { controlStyles } from './Field';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Parses a wall-clock `yyyy-MM-ddTHH:mm` value. The Date is only used for calendar math, never as an instant. */
function parseValue(v: string): { date: Date; time: string } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
  if (!m) return null;
  return { date: new Date(+m[1], +m[2] - 1, +m[3]), time: `${m[4]}:${m[5]}` };
}

const toValue = (date: Date, time: string) => `${format(date, 'yyyy-MM-dd')}T${time}`;

function timeLabel(t: string) {
  const [h, m] = t.split(':').map(Number);
  return format(new Date(2000, 0, 1, h, m), 'h:mm a');
}

function buildTimeSlots(current?: string) {
  const slots = new Set<string>();
  for (let h = 0; h < 24; h++) for (const m of [0, 15, 30, 45]) slots.add(`${pad(h)}:${pad(m)}`);
  slots.add('23:59');
  if (current) slots.add(current);
  return [...slots].sort();
}

export function formatDateTimeValue(value: string): string | null {
  const parsed = parseValue(value);
  return parsed ? `${format(parsed.date, 'EEE, MMM d, yyyy')} · ${timeLabel(parsed.time)}` : null;
}

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  invalid?: boolean;
  defaultTime?: string;
};

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = 'Pick a date and time',
  clearable,
  invalid,
  defaultTime = '12:00',
}: Props) {
  const parsed = parseValue(value);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(parsed?.date ?? new Date()));
  const timeListRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(month), end: endOfWeek(endOfMonth(month)) }),
    [month],
  );
  const slots = useMemo(() => buildTimeSlots(parsed?.time), [parsed?.time]);
  const time = parsed?.time ?? defaultTime;

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const list = timeListRef.current;
      const selected = list?.querySelector<HTMLElement>('[data-selected="true"]');
      if (list && selected) list.scrollTop = selected.offsetTop - list.clientHeight / 2 + selected.clientHeight / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (next) setMonth(startOfMonth(parsed?.date ?? new Date()));
    setOpen(next);
  }

  const today = new Date();

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        <Popover.Trigger asChild>
          <button
            id={id}
            type="button"
            className={cn(
              controlStyles,
              'flex h-11 items-center gap-2.5 text-left data-[state=open]:ring-2 data-[state=open]:ring-spirit-500',
              clearable && parsed && 'pr-10',
              invalid && 'ring-red-400',
            )}
          >
            <CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden />
            <span className={cn('truncate', parsed ? 'text-slate-900' : 'text-slate-400')}>
              {formatDateTimeValue(value) ?? placeholder}
            </span>
          </button>
        </Popover.Trigger>
        {clearable && parsed ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-2 my-auto flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-[100] rounded-2xl bg-white p-3 shadow-soft-lg ring-1 ring-slate-200 motion-safe:animate-pop"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-[266px]">
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  className="flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div className="text-sm font-semibold text-slate-900">{format(month, 'MMMM yyyy')}</div>
                <button
                  type="button"
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  className="flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {days.map((day) => {
                  const selected = parsed ? isSameDay(day, parsed.date) : false;
                  const inMonth = isSameMonth(day, month);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => onChange(toValue(day, time))}
                      aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                      aria-pressed={selected}
                      className={cn(
                        'mx-auto flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors',
                        selected
                          ? 'bg-spirit font-semibold text-white'
                          : inMonth
                          ? 'text-slate-800 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-50',
                        !selected && isSameDay(day, today) && 'ring-1 ring-inset ring-spirit-400 font-semibold',
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:w-[124px] sm:border-l sm:border-slate-100 sm:pl-3">
              <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Time · PT</div>
              <div ref={timeListRef} className="no-scrollbar relative h-40 overflow-y-auto sm:h-[262px]">
                {slots.map((slot) => {
                  const selected = parsed?.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      data-selected={selected}
                      onClick={() => onChange(toValue(parsed?.date ?? today, slot))}
                      className={cn(
                        'block w-full rounded-lg px-2.5 py-1.5 text-left text-sm tabular-nums transition-colors',
                        selected ? 'bg-spirit font-semibold text-white' : 'text-slate-700 hover:bg-slate-100',
                      )}
                    >
                      {timeLabel(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">All times Pacific</span>
            <Popover.Close className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white hover:bg-ink-700">
              Done
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
