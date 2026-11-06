'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { TierCard } from './TierCard';
import { OrderSummary, type SummaryLine } from './OrderSummary';

export type TierView = {
  id: string;
  tierCode: string;
  name: string;
  description: string | null;
  priceCents: number;
  earlyBird: boolean;
  remaining: number | null;
  soldOut: boolean;
  buyable: boolean;
};

type Props = {
  slug: string;
  tiers: TierView[];
  feeCents: number;
  note: string | null;
};

const FORM_ID = 'ticket-form';
const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function StepHeading({ step, title, aside }: { step: number; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900">
        <span className="bg-spirit-gradient shadow-spirit flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white">
          {step}
        </span>
        {title}
      </h2>
      {aside}
    </div>
  );
}

export default function TicketPurchaseForm({ slug, tiers, feeCents, note }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The phone checkout bar only shows until the summary (which has its own button) scrolls into view.
  const summaryRef = useRef<HTMLDivElement>(null);
  const [summaryAhead, setSummaryAhead] = useState(true);

  useEffect(() => {
    const check = () => {
      const el = summaryRef.current;
      if (el) setSummaryAhead(el.getBoundingClientRect().top > window.innerHeight);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  const { lines, ticketCount, subtotalCents } = useMemo(() => {
    const lines: SummaryLine[] = [];
    let ticketCount = 0;
    let subtotalCents = 0;
    for (const t of tiers) {
      const q = quantities[t.id] || 0;
      if (q === 0) continue;
      lines.push({ id: t.id, name: t.name, quantity: q, totalCents: q * t.priceCents });
      ticketCount += q;
      subtotalCents += q * t.priceCents;
    }
    return { lines, ticketCount, subtotalCents };
  }, [quantities, tiers]);

  const totalCents = ticketCount > 0 ? subtotalCents + feeCents : 0;
  const nameError = touched && name.trim().length < 2 ? 'Enter the name for this order.' : null;
  const emailError = touched && !/.+@.+\..+/.test(email) ? 'Enter a valid email so we can send your tickets.' : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (ticketCount === 0) return setError('Add at least one ticket.');
    if (name.trim().length < 2 || !/.+@.+\..+/.test(email)) {
      return setError('Add your name and email so we can send your tickets.');
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({ tierId: l.id, quantity: l.quantity })),
          email: email.trim(),
          customerName: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Checkout failed.');
      if (!data.url) throw new Error('No checkout URL returned.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="space-y-10 motion-safe:animate-rise">
        <section className="rounded-[28px] bg-canvas p-1">
          <div className="rounded-[24px] p-4 sm:p-5">
            <StepHeading
              step={1}
              title="Choose tickets"
              aside={note ? <span className="text-xs text-slate-500">{note}</span> : null}
            />
            <div className="space-y-3">
              {tiers.map((t, i) => (
                <div key={t.id} className="motion-safe:animate-rise" style={{ animationDelay: `${80 + i * 60}ms` }}>
                  <TierCard
                    tier={t}
                    quantity={quantities[t.id] || 0}
                    onQuantityChange={(next) => setQuantities((prev) => ({ ...prev, [t.id]: next }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-1 sm:px-5">
          <StepHeading step={2} title="Your details" />
          <div className="grid gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/80 sm:grid-cols-2">
            <Field label="Full name" error={nameError}>
              {(id) => (
                <Input
                  id={id}
                  icon={<User />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Jordan Smith"
                  invalid={!!nameError}
                />
              )}
            </Field>
            <Field label="Email" hint="Your tickets and QR codes are sent here." error={emailError}>
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  icon={<Mail />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  invalid={!!emailError}
                />
              )}
            </Field>
          </div>
        </section>
      </form>

      <div ref={summaryRef} className="lg:sticky lg:top-28">
        <OrderSummary
          formId={FORM_ID}
          lines={lines}
          ticketCount={ticketCount}
          subtotalCents={subtotalCents}
          feeCents={feeCents}
          totalCents={totalCents}
          submitting={submitting}
          error={error}
        />
      </div>

      {ticketCount > 0 && summaryAhead ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur-xl motion-safe:animate-sheet lg:hidden">
          {error ? <p className="mb-2 text-xs font-medium text-red-600">{error}</p> : null}
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">
                {ticketCount} ticket{ticketCount === 1 ? '' : 's'} · incl. fee
              </div>
              <div className="text-xl font-semibold tabular-nums tracking-tight text-slate-900">{dollars(totalCents)}</div>
            </div>
            <Button type="submit" form={FORM_ID} loading={submitting}>
              {submitting ? 'Opening…' : 'Checkout'}
              {!submitting ? <ArrowRight className="size-4" aria-hidden /> : null}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
