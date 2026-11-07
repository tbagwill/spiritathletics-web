'use client';

import { forwardRef, useEffect, useId, useState } from 'react';
import { cn } from './cn';

// 16px on phones: iOS Safari zooms the page when focusing any input smaller than that.
export const controlStyles =
  'block w-full rounded-xl bg-white px-3.5 text-base text-slate-900 ring-1 ring-inset ring-slate-300 sm:text-[15px] ' +
  'placeholder:text-slate-400 transition-shadow duration-150 ' +
  'hover:ring-slate-400 focus:outline-none focus:ring-2 focus:ring-spirit-500 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

type FieldProps = {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  /** Fields are required by default; mark the exceptions instead of starring everything. */
  optional?: boolean;
  className?: string;
  children: (id: string) => React.ReactNode;
};

/** Label + control + hint/error, with the id wired up for accessibility. */
export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium text-slate-800">
        {label}
        {optional ? <span className="text-xs font-normal text-slate-400">Optional</span> : null}
      </label>
      {children(id)}
      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/** Form-level message shown above the submit button. */
export function FormAlert({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'info' | 'success' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ring-inset',
        tone === 'error' && 'bg-red-50 text-red-800 ring-red-200',
        tone === 'info' && 'bg-slate-50 text-slate-700 ring-slate-200',
        tone === 'success' && 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      )}
    >
      {children}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, icon, invalid, ...rest },
  ref,
) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400 [&>svg]:size-4">
          {icon}
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(controlStyles, 'h-11', icon ? 'pl-10' : null, invalid && 'ring-red-400 focus:ring-red-500', className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </div>
  );
});

/** Password input with a show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon'>>(function PasswordInput(
  { className, invalid, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn(controlStyles, 'h-11 pr-16', invalid && 'ring-red-400 focus:ring-red-500', className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-1.5 my-auto h-8 rounded-lg px-2.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(controlStyles, 'py-2.5 leading-relaxed', className)} {...rest} />;
  },
);

type MoneyInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  cents: number;
  onCentsChange: (cents: number) => void;
};

const formatCents = (cents: number) => (cents / 100).toFixed(2);

/** Dollar input that stores integer cents; keeps the typed text until blur so the caret doesn't jump. */
export function MoneyInput({ cents, onCentsChange, className, ...rest }: MoneyInputProps) {
  const [text, setText] = useState(() => formatCents(cents));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatCents(cents));
  }, [cents, focused]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-500">$</span>
      <input
        type="text"
        inputMode="decimal"
        className={cn(controlStyles, 'h-11 pl-7 tabular-nums', className)}
        value={text}
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d.]/g, '');
          setText(next);
          const n = parseFloat(next);
          onCentsChange(Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0);
        }}
        onBlur={() => {
          setFocused(false);
          setText(formatCents(cents));
        }}
        {...rest}
      />
    </div>
  );
}
