'use client';

import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Field, Input, MoneyInput } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/components/ui/cn';
import type { TierFormValue } from './types';

const CODE_LABEL: Record<TierFormValue['tierCode'], string> = {
  STANDARD: 'Standard',
  SENIOR_CHILD: 'Senior / Child',
  VIP: 'VIP',
};

const ACCENT: Record<TierFormValue['tierCode'], string> = {
  STANDARD: 'bg-spirit',
  SENIOR_CHILD: 'bg-emerald-500',
  VIP: 'bg-amber-400',
};

export function TierEditor({
  tier,
  errors,
  onChange,
}: {
  tier: TierFormValue;
  errors?: Partial<Record<'name' | 'earlyBirdPriceCents' | 'capacity', string>>;
  onChange: (patch: Partial<TierFormValue>) => void;
}) {
  const pct = tier.capacity ? Math.min(100, Math.round((tier.sold / tier.capacity) * 100)) : 0;

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={cn('h-8 w-1.5 rounded-full', ACCENT[tier.tierCode])} aria-hidden />
          <div>
            <div className="flex items-center gap-1.5 font-semibold tracking-tight text-slate-900">
              {tier.tierCode === 'VIP' ? <Crown className="size-4 text-amber-500" aria-hidden /> : null}
              {tier.name || CODE_LABEL[tier.tierCode]}
            </div>
            <div className="text-xs tabular-nums text-slate-500">
              {CODE_LABEL[tier.tierCode]} · {tier.sold} sold{tier.capacity != null ? ` of ${tier.capacity}` : ''}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tier.showOnline ? (
            <Badge tone="green" dot>
              Online
            </Badge>
          ) : (
            <Badge>Hidden online</Badge>
          )}
          {tier.showOnline && tier.earlyBirdEnabled ? <Badge tone="blue">Early Bird</Badge> : null}
        </div>
      </div>

      {tier.capacity != null ? (
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-spirit transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      ) : null}

      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <Field label="Name" error={errors?.name}>
          {(id) => <Input id={id} value={tier.name} onChange={(e) => onChange({ name: e.target.value })} invalid={!!errors?.name} />}
        </Field>
        <Field label="Description">
          {(id) => <Input id={id} value={tier.description} onChange={(e) => onChange({ description: e.target.value })} />}
        </Field>
        <Field label="Early Bird price" error={errors?.earlyBirdPriceCents}>
          {(id) => (
            <MoneyInput
              id={id}
              cents={tier.earlyBirdPriceCents}
              onCentsChange={(c) => onChange({ earlyBirdPriceCents: c })}
            />
          )}
        </Field>
        <Field label="Door price">
          {(id) => <MoneyInput id={id} cents={tier.doorPriceCents} onCentsChange={(c) => onChange({ doorPriceCents: c })} />}
        </Field>
        <Field label="Capacity" hint="Leave blank for unlimited." error={errors?.capacity}>
          {(id) => (
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              min={tier.sold}
              placeholder="Unlimited"
              value={tier.capacity ?? ''}
              invalid={!!errors?.capacity}
              onChange={(e) =>
                onChange({ capacity: e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
            />
          )}
        </Field>
        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 sm:col-span-2">
          <Switch
            checked={tier.showOnline}
            onChange={(v) => onChange({ showOnline: v })}
            label="Show online"
            description="List this tier on the ticket page. Turn off to sell it in person only."
          />
          <Switch
            checked={tier.earlyBirdEnabled}
            onChange={(v) => onChange({ earlyBirdEnabled: v })}
            label="Early Bird online"
            description="Sell at the Early Bird price during the Early Bird window. Off means door price only."
          />
        </div>
      </div>
    </div>
  );
}
