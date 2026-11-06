'use client';

import { Crown, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/components/ui/cn';
import type { TierView } from './TicketPurchaseForm';

export const MAX_PER_TIER = 20;
const LOW_STOCK = 10;

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function QuantityStepper({
  name,
  value,
  max,
  onChange,
}: {
  name: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        aria-label={`Remove one ${name} ticket`}
        className="flex size-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-all hover:text-slate-900 active:scale-90 disabled:opacity-40 disabled:shadow-none sm:size-9"
      >
        <Minus className="size-4" />
      </button>
      <span
        key={value}
        aria-live="polite"
        className="w-8 text-center text-base font-semibold tabular-nums text-slate-900 motion-safe:animate-pop"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Add one ${name} ticket`}
        className="flex size-11 items-center justify-center rounded-full bg-spirit text-white shadow-sm transition-all hover:bg-spirit-500 active:scale-90 disabled:opacity-40 sm:size-9"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function TierCard({
  tier,
  quantity,
  onQuantityChange,
}: {
  tier: TierView;
  quantity: number;
  onQuantityChange: (next: number) => void;
}) {
  const max = Math.min(MAX_PER_TIER, tier.remaining ?? MAX_PER_TIER);
  const selected = quantity > 0;
  const lowStock = tier.remaining != null && tier.remaining > 0 && tier.remaining <= LOW_STOCK;

  return (
    <div
      className={cn(
        'rounded-3xl p-5 transition-all duration-200',
        selected
          ? 'bg-[#f6f7ff] shadow-[0_16px_40px_-20px_rgba(0,0,254,0.55)] ring-2 ring-spirit'
          : 'bg-white shadow-soft ring-1 ring-slate-200/80 hover:ring-spirit/40',
        !tier.buyable && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {tier.tierCode === 'VIP' ? <Crown className="size-4 text-amber-500" aria-hidden /> : null}
            <h3 className="text-base font-semibold tracking-tight text-slate-900">{tier.name}</h3>
            {tier.soldOut ? (
              <Badge tone="red">Sold out</Badge>
            ) : lowStock ? (
              <Badge tone="amber">Only {tier.remaining} left</Badge>
            ) : null}
            {tier.earlyBird && tier.buyable ? <Badge tone="green">Early Bird</Badge> : null}
          </div>
          {tier.description ? <p className="mt-1 text-sm leading-relaxed text-slate-600">{tier.description}</p> : null}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-semibold tabular-nums tracking-tight text-spirit">{dollars(tier.priceCents)}</div>
          <div className="text-xs text-slate-500">per ticket</div>
        </div>
      </div>

      {tier.buyable ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500 tabular-nums">
            {selected ? (
              <>
                <span className="sm:hidden">{dollars(quantity * tier.priceCents)} total</span>
                <span className="hidden sm:inline">
                  {quantity} × {dollars(tier.priceCents)} = {dollars(quantity * tier.priceCents)}
                </span>
              </>
            ) : (
              'How many?'
            )}
          </span>
          <QuantityStepper
            name={tier.name}
            value={quantity}
            max={max}
            onChange={(next) => onQuantityChange(Math.max(0, Math.min(max, next)))}
          />
        </div>
      ) : !tier.soldOut ? (
        <p className="mt-3 text-sm text-slate-500">Not available online right now.</p>
      ) : null}
    </div>
  );
}
