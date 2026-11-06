'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash, TriangleExclamationPoint } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Field, Input, MoneyInput, Textarea } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { toPtDateTimeLocal } from '@/lib/time';
import { FormSection, Panel } from './FormSection';
import { ScheduleTimeline } from './ScheduleTimeline';
import { STATUS_META } from './StatusBadge';
import { TierEditor } from './TierEditor';
import { toApiPayload, type EventFormValues, type EventStatusValue } from './types';
import { validateEventForm } from './validate';

type Props =
  | { mode: 'create'; initial: EventFormValues; eventId?: undefined; orderCount?: undefined }
  | { mode: 'edit'; initial: EventFormValues; eventId: string; orderCount: number };

type DateKey = 'startDateTime' | 'doorsOpen' | 'endDateTime' | 'salesOpenAt' | 'earlyBirdEndsAt' | 'doorSalesOpenAt' | 'salesCloseAt';

const STATUS_OPTIONS = (Object.keys(STATUS_META) as EventStatusValue[]).map((value) => ({
  value,
  label: STATUS_META[value].label,
  description: STATUS_META[value].description,
  dotClassName: STATUS_META[value].dot,
}));

export default function EventForm({ mode, initial, eventId, orderCount }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [nowLocal] = useState(() => toPtDateTimeLocal(new Date()));
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = JSON.stringify(values) !== baseline;
  const errors = useMemo(() => validateEventForm(values, nowLocal), [values, nowLocal]);
  const earlyBirdOnline = values.tiers.some((t) => t.showOnline && t.earlyBirdEnabled);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function set<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setJustSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  }

  function dateField(key: DateKey, label: string, opts: { clearable?: boolean; defaultTime?: string } = {}) {
    const error = errors.fields[key];
    return (
      <Field label={label} error={error}>
        {(id) => (
          <DateTimePicker
            id={id}
            value={values[key]}
            onChange={(v) => set(key, v)}
            invalid={!!error}
            clearable={opts.clearable}
            defaultTime={opts.defaultTime}
            placeholder={opts.clearable ? 'Not set' : undefined}
          />
        )}
      </Field>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (errors.count > 0) {
      setServerError(`Fix ${errors.count} highlighted issue${errors.count === 1 ? '' : 's'} first.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(mode === 'create' ? '/api/admin/events' : `/api/admin/events/${eventId}`, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toApiPayload(values)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Save failed.');
      if (mode === 'create') {
        setBaseline(JSON.stringify(values));
        router.push(`/admin/events/${data.id}`);
        return;
      }
      setBaseline(JSON.stringify(values));
      setJustSaved(true);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Delete failed.');
      setBaseline(JSON.stringify(values));
      router.push('/admin/events');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Delete failed.');
      setConfirmDelete(false);
      setDeleting(false);
    }
  }

  const statusLine = serverError ? (
    <span className="text-red-300">{serverError}</span>
  ) : errors.count > 0 ? (
    <span className="text-amber-300">
      {errors.count} issue{errors.count === 1 ? '' : 's'} to fix
    </span>
  ) : dirty ? (
    'Unsaved changes'
  ) : justSaved ? (
    <span className="text-emerald-300">All changes saved</span>
  ) : mode === 'create' ? (
    'Ready to create'
  ) : (
    <span className="text-white/60">No changes</span>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.warnings.length ? (
        <div className="mb-8 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-inset ring-amber-200 motion-safe:animate-rise">
          <TriangleExclamationPoint className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <ul className="space-y-1">
            {errors.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <FormSection title="Basics" description="What buyers see on the showcase and ticket pages.">
        <Panel>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" error={errors.fields.title} className="sm:col-span-2">
              {(id) => (
                <Input id={id} value={values.title} onChange={(e) => set('title', e.target.value)} invalid={!!errors.fields.title} />
              )}
            </Field>
            <Field
              label="URL slug"
              error={errors.fields.slug}
              hint={
                <>
                  spiritathletics.net/showcase/<span className="font-medium text-slate-700">{values.slug || '…'}</span>/tickets
                  {mode === 'edit' ? ' · Changing this breaks links already shared.' : ''}
                </>
              }
              className="sm:col-span-2"
            >
              {(id) => (
                <Input
                  id={id}
                  value={values.slug}
                  onChange={(e) => set('slug', e.target.value.trim().toLowerCase())}
                  invalid={!!errors.fields.slug}
                />
              )}
            </Field>
            <Field label="Description" className="sm:col-span-2">
              {(id) => (
                <Textarea id={id} rows={3} value={values.description} onChange={(e) => set('description', e.target.value)} />
              )}
            </Field>
            <Field label="Venue">
              {(id) => <Input id={id} value={values.venue} onChange={(e) => set('venue', e.target.value)} />}
            </Field>
            <Field label="Venue address">
              {(id) => <Input id={id} value={values.venueAddress} onChange={(e) => set('venueAddress', e.target.value)} />}
            </Field>
            <Field
              label="Hero image (optional)"
              hint="An https:// image link, shown faintly behind the page header."
              error={errors.fields.heroImageUrl}
              className="sm:col-span-2"
            >
              {(id) => (
                <Input
                  id={id}
                  value={values.heroImageUrl}
                  onChange={(e) => set('heroImageUrl', e.target.value)}
                  placeholder="https://…"
                  invalid={!!errors.fields.heroImageUrl}
                />
              )}
            </Field>
          </div>
        </Panel>
      </FormSection>

      <FormSection
        title="Schedule"
        description="All times are Pacific. Online pricing switches from Early Bird to door prices on its own."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <Panel>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Show day</h3>
              <div className="grid gap-5 md:grid-cols-2">
                {dateField('startDateTime', 'Show starts', { defaultTime: '13:00' })}
                {dateField('doorsOpen', 'Doors open', { clearable: true, defaultTime: '12:30' })}
                {dateField('endDateTime', 'Show ends', { clearable: true, defaultTime: '17:00' })}
              </div>
            </Panel>
            <Panel>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Online sales</h3>
              <div className="grid gap-5 md:grid-cols-2">
                {dateField('salesOpenAt', 'Sales open')}
                {dateField('earlyBirdEndsAt', 'Early Bird ends', { defaultTime: '23:59' })}
                {dateField('doorSalesOpenAt', 'Door pricing starts', { defaultTime: '08:00' })}
                {dateField('salesCloseAt', 'Sales close', { defaultTime: '16:00' })}
                <Field label="Convenience fee" hint="Charged once per online order.">
                  {(id) => (
                    <MoneyInput
                      id={id}
                      cents={values.convenienceFeeCents}
                      onCentsChange={(c) => set('convenienceFeeCents', c)}
                    />
                  )}
                </Field>
              </div>
            </Panel>
          </div>
          <Panel className="h-fit xl:sticky xl:top-6">
            <ScheduleTimeline values={values} errors={errors.fields} earlyBirdOnline={earlyBirdOnline} />
          </Panel>
        </div>
      </FormSection>

      <FormSection
        title="Ticket tiers"
        description="Hide a tier to sell it in person only, or turn off Early Bird to sell it online at the door price."
      >
        <div className="space-y-4">
          {values.tiers.map((tier, i) => (
            <TierEditor
              key={tier.id || tier.tierCode}
              tier={tier}
              errors={errors.tiers[i]}
              onChange={(patch) => {
                setJustSaved(false);
                setValues((v) => ({ ...v, tiers: v.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }));
              }}
            />
          ))}
        </div>
      </FormSection>

      <FormSection title="Visibility" description="Only Active events appear on the website and sell tickets.">
        <Panel>
          <Field label="Status">
            {(id) => (
              <Select id={id} value={values.status} onValueChange={(v) => set('status', v)} options={STATUS_OPTIONS} />
            )}
          </Field>
        </Panel>
      </FormSection>

      {mode === 'edit' ? (
        <FormSection title="Danger zone">
          <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium text-slate-900">Delete this event</div>
              <p className="mt-0.5 text-sm text-slate-500">
                {orderCount
                  ? `It has ${orderCount} order${orderCount === 1 ? '' : 's'}, so it can’t be deleted. Set it to Completed instead.`
                  : 'Removes the event and its tiers. This can’t be undone.'}
              </p>
            </div>
            <Button variant="danger" disabled={!!orderCount} onClick={() => setConfirmDelete(true)}>
              <Trash className="size-4" aria-hidden />
              Delete event
            </Button>
          </Panel>
        </FormSection>
      ) : null}

      <div className="sticky bottom-4 z-30 mt-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-white shadow-soft-lg ring-1 ring-white/10">
          <div className="min-w-0 truncate" aria-live="polite">
            {statusLine}
          </div>
          <div className="flex shrink-0 gap-1.5">
            {mode === 'edit' && dirty ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setValues(JSON.parse(baseline));
                  setServerError(null);
                }}
              >
                Discard
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.push('/admin/events')}
              >
                {mode === 'create' ? 'Cancel' : 'Back'}
              </Button>
            )}
            <Button type="submit" size="sm" loading={saving} disabled={mode === 'edit' && !dirty}>
              {mode === 'create' ? 'Create event' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>

      {mode === 'edit' ? (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Delete “${values.title}”?`}
          description="This removes the event and all of its tiers. It can’t be undone."
          confirmLabel="Delete event"
          destructive
          loading={deleting}
          onConfirm={handleDelete}
        />
      ) : null}
    </form>
  );
}
