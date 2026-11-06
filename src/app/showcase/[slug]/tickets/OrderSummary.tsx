'use client';

import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';

export type SummaryLine = { id: string; name: string; quantity: number; totalCents: number };

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

type Props = {
  formId: string;
  lines: SummaryLine[];
  ticketCount: number;
  subtotalCents: number;
  feeCents: number;
  totalCents: number;
  submitting: boolean;
  error: string | null;
  className?: string;
};

export function OrderSummary({
  formId,
  lines,
  ticketCount,
  subtotalCents,
  feeCents,
  totalCents,
  submitting,
  error,
  className,
}: Props) {
  return (
    <aside
      className={cn(
        'bg-spirit-deep shadow-spirit relative isolate overflow-hidden rounded-[28px] p-6 text-white ring-1 ring-inset ring-white/15 sm:p-7',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 -z-10 size-64 rounded-full bg-[#4169E1] opacity-50 blur-3xl" />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
          {ticketCount} ticket{ticketCount === 1 ? '' : 's'}
        </span>
      </div>

      {lines.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-white/30 px-4 py-6 text-center text-sm text-white/70">
          Add tickets to see your total.
        </p>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {lines.map((l) => (
            <li key={l.id} className="flex items-baseline justify-between gap-3 text-sm motion-safe:animate-rise">
              <span className="text-white/90">
                <span className="tabular-nums">{l.quantity}</span> × {l.name}
              </span>
              <span className="tabular-nums">{dollars(l.totalCents)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-2 border-t border-white/20 pt-5 text-sm">
        <div className="flex justify-between text-white/70">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{dollars(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between text-white/70">
          <dt>Online convenience fee</dt>
          <dd className="tabular-nums">{ticketCount > 0 ? dollars(feeCents) : dollars(0)}</dd>
        </div>
        <div className="flex items-end justify-between pt-2">
          <dt className="font-semibold">Total</dt>
          <dd key={totalCents} className="text-3xl font-semibold tabular-nums tracking-tight motion-safe:animate-pop">
            {dollars(totalCents)}
          </dd>
        </div>
      </dl>

      {error ? (
        <div role="alert" className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        form={formId}
        size="lg"
        variant="white"
        loading={submitting}
        disabled={ticketCount === 0}
        className="mt-6 w-full"
      >
        {submitting ? 'Opening secure checkout…' : 'Continue to payment'}
        {!submitting ? <ArrowRight className="size-4" aria-hidden /> : null}
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/65">
        <Lock className="size-3.5" aria-hidden />
        Secure checkout with Stripe
      </p>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-white/45">All sales final · No refunds or transfers</p>
    </aside>
  );
}
