'use client';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Unit label shown next to the value, e.g. "athletes". */
  unit?: string;
};

export default function Stepper({ value, onChange, min = 0, max = 100, step = 1, unit }: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const dec = () => onChange(clamp(value - step));
  const inc = () => onChange(clamp(value + step));
  const atMin = value <= min;
  const atMax = value >= max;

  const btn =
    'flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 ring-1 ring-inset ring-slate-200 transition-all hover:bg-white hover:text-blue-600 hover:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:ring-slate-200';

  return (
    <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-inset ring-slate-200">
      <button type="button" onClick={dec} disabled={atMin} aria-label="Decrease" className={btn}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <div className="min-w-[5.5rem] text-center">
        <span className="text-xl font-bold text-slate-900">{value}</span>
        {unit && <span className="ml-1.5 text-sm font-medium text-slate-500">{unit}</span>}
      </div>
      <button type="button" onClick={inc} disabled={atMax} aria-label="Increase" className={btn}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
