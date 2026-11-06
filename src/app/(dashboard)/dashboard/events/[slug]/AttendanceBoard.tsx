'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/components/ui/cn';

type TierStat = { id: string; name: string; tierCode: string; capacity: number | null; sold: number; redeemed: number };

type TicketRow = {
  id: string;
  status: 'ACTIVE' | 'REDEEMED' | 'VOIDED';
  redeemedAt: string | null;
  tierName: string;
  tierCode: string;
  orderId: string;
  customerName: string;
  email: string;
};

type ApiResp = {
  stats: { totalTickets: number; redeemedTickets: number; byTier: TierStat[] };
  tickets: TicketRow[];
  returned: number;
  limit: number;
};

type Filter = 'all' | 'waiting' | 'in';

const POLL_MS = 15_000;
const ACCENT: Record<string, string> = { STANDARD: 'bg-spirit', SENIOR_CHILD: 'bg-emerald-500', VIP: 'bg-amber-400' };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
}

export default function AttendanceBoard({ slug }: { slug: string }) {
  const [data, setData] = useState<ApiResp | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [pending, setPending] = useState<TicketRow | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const qRef = useRef('');
  const seq = useRef(0);

  const load = useCallback(
    async (query: string, silent = false) => {
      const id = ++seq.current;
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const url = `/api/dashboard/events/${slug}/tickets${query ? `?q=${encodeURIComponent(query)}` : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Couldn’t load tickets.');
        const json: ApiResp = await res.json();
        if (id !== seq.current) return;
        setData(json);
        setError(null);
        setUpdatedAt(Date.now());
      } catch (err) {
        if (id === seq.current) setError(err instanceof Error ? err.message : 'Couldn’t load tickets.');
      } finally {
        if (id === seq.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [slug],
  );

  useEffect(() => {
    qRef.current = q.trim();
    const t = setTimeout(() => load(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q, load]);

  useEffect(() => {
    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') load(qRef.current, true);
    }, POLL_MS);
    const clock = setInterval(() => setNow(Date.now()), 5000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function confirmRedeem() {
    if (!pending) return;
    setRedeeming(true);
    try {
      const res = await fetch(`/api/dashboard/events/${slug}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: pending.id }),
      });
      const json = await res.json();
      setToast(
        res.ok && json.ok
          ? { ok: true, msg: `Checked in ${pending.customerName} · ${pending.tierName}` }
          : { ok: false, msg: json.message || 'Couldn’t check in this ticket.' },
      );
    } catch {
      setToast({ ok: false, msg: 'Network error. Try again.' });
    } finally {
      setRedeeming(false);
      setPending(null);
      load(qRef.current, true);
    }
  }

  const stats = data?.stats;
  const total = stats?.totalTickets ?? 0;
  const inCount = stats?.redeemedTickets ?? 0;
  const pct = total ? Math.round((inCount / total) * 100) : 0;

  const rows = useMemo(() => {
    const all = data?.tickets ?? [];
    if (filter === 'waiting') return all.filter((t) => t.status === 'ACTIVE');
    if (filter === 'in') return all.filter((t) => t.status === 'REDEEMED');
    return all;
  }, [data, filter]);

  const ago = updatedAt ? Math.max(0, Math.round((now - updatedAt) / 1000)) : null;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="bg-spirit-deep shadow-spirit relative isolate col-span-2 overflow-hidden rounded-3xl p-5 text-white ring-1 ring-inset ring-white/15 sm:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 -z-10 size-56 rounded-full bg-[#4169E1] opacity-50 blur-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/75">Checked in</span>
            <button
              type="button"
              onClick={() => load(qRef.current, true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80 ring-1 ring-inset ring-white/15 hover:bg-white/20"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              {ago == null ? 'Loading…' : ago < 5 ? 'Live · just now' : `Live · ${ago}s ago`}
              <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} aria-hidden />
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tabular-nums tracking-tight">{stats ? inCount : '—'}</span>
            <span className="text-lg tabular-nums text-white/60">/ {stats ? total : '—'}</span>
            <span className="ml-auto text-2xl font-semibold tabular-nums">{pct}%</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <StatTile label="Still to arrive" value={stats ? total - inCount : null} />
        <StatTile label="Tickets sold" value={stats ? total : null} />
      </div>

      {/* By tier */}
      {stats?.byTier.length ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.byTier.map((t) => {
            const p = t.sold ? Math.round((t.redeemed / t.sold) * 100) : 0;
            return (
              <div key={t.id} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-semibold tracking-tight">
                    <span className={cn('size-2 rounded-full', ACCENT[t.tierCode] || 'bg-spirit')} />
                    {t.name}
                  </span>
                  <span className="text-sm tabular-nums text-slate-500">
                    {t.redeemed} / {t.sold}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full transition-[width] duration-700', ACCENT[t.tierCode] || 'bg-spirit')}
                    style={{ width: `${p}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {t.capacity != null ? `${t.sold} of ${t.capacity} sold online` : `${t.sold} sold online`}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Search + list */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search attendees"
              className="h-11 w-full rounded-full bg-slate-100 pl-10 pr-10 text-base text-slate-900 sm:text-[15px] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spirit-500"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="flex rounded-full bg-slate-100 p-1 text-sm">
            {(
              [
                ['all', 'All'],
                ['waiting', 'To check in'],
                ['in', 'Checked in'],
              ] as [Filter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  'flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium transition-all',
                  filter === value ? 'bg-spirit text-white shadow-spirit' : 'text-slate-500 hover:text-spirit',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && !data ? (
          <ul className="divide-y divide-slate-100">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-4">
                <div className="skeleton size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-40 rounded" />
                  <div className="skeleton h-3 w-56 rounded" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="p-6 text-sm text-red-700">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            {q.trim() ? 'No tickets match that search.' : filter === 'all' ? 'No tickets sold yet.' : 'Nobody here yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((t) => (
              <li key={t.id} className={cn('flex items-center gap-3 px-4 py-3 sm:px-5', t.status !== 'ACTIVE' && 'bg-slate-50/60')}>
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    t.status === 'REDEEMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-spirit-50 text-spirit',
                  )}
                >
                  {t.status === 'REDEEMED' ? <CircleCheck className="size-5" /> : initials(t.customerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">{t.customerName}</div>
                  <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex shrink-0 items-center gap-1.5">
                      <span className={cn('size-1.5 rounded-full', ACCENT[t.tierCode] || 'bg-spirit')} />
                      {t.tierName}
                    </span>
                    <span className="truncate">· {t.email}</span>
                  </div>
                </div>
                {t.status === 'ACTIVE' ? (
                  <Button onClick={() => setPending(t)}>
                    Check in
                  </Button>
                ) : t.status === 'REDEEMED' ? (
                  <span className="shrink-0 text-xs font-semibold text-emerald-700">
                    In{t.redeemedAt ? ` · ${timeOf(t.redeemedAt)}` : ''}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">Void</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {data && data.returned >= data.limit ? (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing the first {data.limit}. Search by name or email to find someone specific.
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending ? `Check in ${pending.customerName}?` : ''}
        description={pending ? `${pending.tierName} ticket · ${pending.email}. Hand out one wristband.` : undefined}
        confirmLabel="Check in"
        loading={redeeming}
        onConfirm={confirmRedeem}
      />

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[95] flex justify-center px-4">
          <div
            role="status"
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-soft-lg motion-safe:animate-sheet',
              toast.ok ? 'bg-ink' : 'bg-red-600',
            )}
          >
            {toast.ok ? <CircleCheck className="size-4 text-emerald-400" aria-hidden /> : null}
            {toast.msg}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6 lg:shadow-soft-lg">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-4xl">{value ?? '—'}</div>
    </div>
  );
}
