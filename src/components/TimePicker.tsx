'use client';

import { useEffect, useRef, useState } from 'react';

type Accent = 'blue' | 'amber';

type Props = {
  /** Minutes from midnight (0–1440). */
  value: number;
  onChange: (minutes: number) => void;
  /** Increment between options, in minutes. Defaults to 30. */
  step?: number;
  /** Earliest selectable minute (inclusive). Defaults to 0. */
  minMinutes?: number;
  /** Latest selectable minute (inclusive). Defaults to 1440. */
  maxMinutes?: number;
  accent?: Accent;
  ariaLabel?: string;
};

function formatMinutes(m: number) {
  const h = Math.floor(m / 60);
  const mm = (m % 60).toString().padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mm} ${suffix}`;
}

const ACCENTS: Record<Accent, { ringFocus: string; activeBg: string; activeText: string; iconText: string }> = {
  blue: {
    ringFocus: 'focus:border-blue-500 focus:ring-blue-500/30',
    activeBg: 'bg-blue-600',
    activeText: 'text-blue-700',
    iconText: 'text-blue-500',
  },
  amber: {
    ringFocus: 'focus:border-amber-500 focus:ring-amber-500/30',
    activeBg: 'bg-amber-500',
    activeText: 'text-amber-700',
    iconText: 'text-amber-500',
  },
};

export default function TimePicker({
  value,
  onChange,
  step = 30,
  minMinutes = 0,
  maxMinutes = 1440,
  accent = 'blue',
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<HTMLButtonElement | null>(null);
  const a = ACCENTS[accent];

  const options: number[] = [];
  for (let m = minMinutes; m <= maxMinutes; m += step) options.push(m);

  // Scroll the selected option into view when the menu opens.
  useEffect(() => {
    if (open && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center' });
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none transition-all focus:ring-2 ${a.ringFocus}`}
      >
        <span className="flex items-center gap-2.5">
          <svg className={`h-5 w-5 ${a.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-base font-semibold text-slate-900">{formatMinutes(value)}</span>
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div
            ref={listRef}
            role="listbox"
            className="absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-soft-lg"
          >
            {options.map((m) => {
              const isSelected = m === value;
              return (
                <button
                  key={m}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(m);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? `${a.activeBg} text-white`
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {formatMinutes(m)}
                  {isSelected && (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
