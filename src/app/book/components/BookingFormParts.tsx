'use client';

import { Banknote, CreditCard, Lock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { cn } from '@/components/ui/cn';

export type PaymentMethod = 'CARD' | 'CASH';

export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Pay online vs. pay cash, each showing its own total so nobody has to do the math. */
export function PaymentChoice({
  value,
  onChange,
  cardTotalCents,
  cashTotalCents,
  feeCents,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  cardTotalCents: number;
  cashTotalCents: number;
  feeCents: number;
}) {
  const options = [
    { value: 'CARD' as const, icon: CreditCard, label: 'Pay online', total: cardTotalCents, detail: `Includes ${money(feeCents)} card fee` },
    { value: 'CASH' as const, icon: Banknote, label: 'Pay at the gym', total: cashTotalCents, detail: 'Cash, no fee' },
  ];
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-800">Payment</legend>
      <div className="mt-1.5 grid grid-cols-2 gap-2.5">
        {options.map(({ value: v, icon: Icon, label, total, detail }) => {
          const selected = value === v;
          return (
            <label
              key={v}
              className={cn(
                'relative flex cursor-pointer flex-col rounded-2xl p-3.5 ring-1 ring-inset transition-all',
                selected ? 'bg-spirit-50/60 ring-2 ring-spirit' : 'bg-white ring-slate-200 hover:ring-slate-300',
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={v}
                checked={selected}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <span className="flex items-center justify-between">
                <Icon className={cn('size-5', selected ? 'text-spirit' : 'text-slate-400')} aria-hidden />
                <span
                  aria-hidden
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full ring-1 ring-inset',
                    selected ? 'bg-spirit ring-spirit' : 'ring-slate-300',
                  )}
                >
                  {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
                </span>
              </span>
              <span className="mt-3 text-sm font-semibold text-slate-900">{label}</span>
              <span className="text-lg font-semibold tabular-nums tracking-tight text-slate-900">{money(total)}</span>
              <span className="text-xs text-slate-500">{detail}</span>
            </label>
          );
        })}
      </div>
      {value === 'CASH' ? (
        <p className="mt-2.5 text-xs leading-relaxed text-amber-700">
          Bring {money(cashTotalCents)} in cash. Without cash, the online price of {money(cardTotalCents)} applies.
        </p>
      ) : null}
    </fieldset>
  );
}

/** One first-name input per athlete, with add/remove. */
export function AthleteNames({
  names,
  onChange,
  max,
  error,
}: {
  names: string[];
  onChange: (names: string[]) => void;
  max?: number;
  error?: string | null;
}) {
  const canAdd = max == null || names.length < max;
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-800">
        {names.length > 1 ? 'Athletes’ first names' : 'Athlete’s first name'}
      </legend>
      <div className="mt-1.5 grid gap-2">
        {names.map((name, i) => (
          <div key={i} className="relative">
            <Input
              aria-label={`Athlete ${i + 1} first name`}
              value={name}
              onChange={(e) => onChange(names.map((n, idx) => (idx === i ? e.target.value : n)))}
              placeholder={names.length > 1 ? `Athlete ${i + 1}` : 'First name'}
              autoComplete="off"
              invalid={!!error && !name.trim()}
              className={names.length > 1 ? 'pr-11' : undefined}
            />
            {names.length > 1 ? (
              <button
                type="button"
                onClick={() => onChange(names.filter((_, idx) => idx !== i))}
                className="absolute inset-y-0 right-1 my-auto flex size-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" aria-hidden />
                <span className="sr-only">Remove athlete {i + 1}</span>
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
      {canAdd ? (
        <button
          type="button"
          onClick={() => onChange([...names, ''])}
          className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-spirit transition-colors hover:bg-spirit-50"
        >
          <Plus className="size-4" aria-hidden />
          Add another athlete
        </button>
      ) : null}
    </fieldset>
  );
}

/** Sticky footer: total on the left, the one primary action on the right, reassurance underneath. */
export function BookingFooter({
  formId,
  totalCents,
  paymentMethod,
  submitting,
  cashLabel,
  note,
}: {
  formId: string;
  totalCents: number;
  paymentMethod: PaymentMethod;
  submitting: boolean;
  /** Button label when paying cash, e.g. "Reserve spot". */
  cashLabel: string;
  /** Replaces the default cancellation line. */
  note?: string;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{paymentMethod === 'CASH' ? 'Due at the gym' : 'Total'}</div>
          <div className="text-2xl font-semibold tabular-nums tracking-tight">{money(totalCents)}</div>
        </div>
        <Button type="submit" form={formId} size="lg" loading={submitting} className="px-6">
          {submitting ? 'One moment…' : paymentMethod === 'CASH' ? cashLabel : 'Continue to payment'}
        </Button>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <Lock className="size-3.5 shrink-0" aria-hidden />
        {paymentMethod === 'CASH' ? 'You’re booked right away.' : 'Secure checkout with Stripe.'}{' '}
        {note ?? 'Cancel up to 4 hours before using the link in your email.'}
      </p>
    </>
  );
}
