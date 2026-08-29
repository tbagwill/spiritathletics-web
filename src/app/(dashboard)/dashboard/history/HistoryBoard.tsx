'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatPt, ptTodayString } from '@/lib/time';

type Kind = 'private' | 'class' | 'clinic';
type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

type AthleteRow = {
  id: string;
  athleteName: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: 'CARD' | 'CASH';
  priceCents: number;
  status: Status;
};

type PrivateRow = {
  id: string;
  title: string;
  startISO: string;
  endISO: string;
  coachName: string;
  athleteName: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: 'CARD' | 'CASH';
  priceCents: number;
  status: Status;
  privateKind: string | null;
};

type SessionRow = {
  id: string;
  title: string;
  startISO: string;
  endISO: string;
  coachName: string;
  status: Status;
  athletes: AthleteRow[];
};

type CoachOption = { id: string; name: string };

function currentMonth(): string {
  return ptTodayString().slice(0, 7);
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function statusBadge(status: Status) {
  if (status === 'CANCELLED') return 'bg-red-100 text-red-700';
  if (status === 'PENDING') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-600';
}

function statusLabel(status: Status) {
  if (status === 'CANCELLED') return 'Cancelled';
  if (status === 'PENDING') return 'Pending';
  return 'Completed';
}

function payLabel(method: 'CARD' | 'CASH') {
  return method === 'CASH' ? 'CASH due' : 'PAID';
}

function payClass(method: 'CARD' | 'CASH') {
  return method === 'CASH' ? 'text-amber-700' : 'text-emerald-700';
}

function kindPill(kind: Kind) {
  if (kind === 'class') return 'bg-emerald-50 text-emerald-800';
  if (kind === 'clinic') return 'bg-purple-50 text-purple-800';
  return 'bg-blue-50 text-blue-800';
}

function kindLabel(kind: Kind) {
  if (kind === 'class') return 'Class';
  if (kind === 'clinic') return 'Clinic';
  return 'Private';
}

function privateLabel(kind?: string | null) {
  if (kind === 'SEMI_PRIVATE') return 'Semi-private';
  if (kind === 'SOLO') return 'Solo';
  return null;
}

function AthleteDetails({ athletes, showStatus }: { athletes: AthleteRow[]; showStatus?: boolean }) {
  if (athletes.length === 0) {
    return <p className="px-4 py-3 text-sm text-slate-500">No athletes recorded for this session.</p>;
  }
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
          <th className="px-4 py-2 font-semibold">Athlete</th>
          <th className="px-2 py-2 font-semibold">Parent</th>
          <th className="px-2 py-2 font-semibold">Amount</th>
          <th className="px-2 py-2 font-semibold">Pay</th>
          {showStatus && <th className="px-4 py-2 font-semibold">Status</th>}
        </tr>
      </thead>
      <tbody>
        {athletes.map((a) => (
          <tr key={a.id} className="border-t border-gray-100">
            <td className="px-4 py-2 font-medium text-slate-900">{a.athleteName}</td>
            <td className="px-2 py-2">
              <p className="text-slate-800">{a.customerName}</p>
              {a.customerEmail && (
                <a href={`mailto:${a.customerEmail}`} className="text-[11px] text-blue-600 hover:underline break-all">
                  {a.customerEmail}
                </a>
              )}
            </td>
            <td className="px-2 py-2 whitespace-nowrap text-slate-800">{money(a.priceCents)}</td>
            <td className={`px-2 py-2 text-[11px] font-semibold whitespace-nowrap ${payClass(a.paymentMethod)}`}>
              {payLabel(a.paymentMethod)}
            </td>
            {showStatus && (
              <td className="px-4 py-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge(a.status)}`}>
                  {statusLabel(a.status)}
                </span>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function HistoryBoard({ isAdmin }: { isAdmin: boolean }) {
  const [kind, setKind] = useState<Kind>('private');
  const [month, setMonth] = useState(currentMonth);
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [coachId, setCoachId] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [privates, setPrivates] = useState<PrivateRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
    setLoading(true);
  }, [kind, month, debouncedQ, coachId]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      kind,
      month,
      page: String(page),
    });
    if (debouncedQ) params.set('q', debouncedQ);
    if (isAdmin && coachId && kind !== 'clinic') params.set('coachId', coachId);

    try {
      const res = await fetch(`/api/dashboard/history?${params.toString()}`);
      const data = await res.json();
      if (id !== requestId.current) return;
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load history');
      setTotal(data.total ?? 0);
      setPageSize(data.pageSize ?? 50);
      if (Array.isArray(data.coaches) && data.coaches.length) setCoaches(data.coaches);
      if (data.kind === 'private') {
        setPrivates(data.rows ?? []);
        setSessions([]);
      } else {
        setSessions(data.sessions ?? []);
        setPrivates([]);
      }
      setExpanded(new Set());
    } catch (e: unknown) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load history');
      setPrivates([]);
      setSessions([]);
      setTotal(0);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [kind, month, page, debouncedQ, coachId, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const tabs: { id: Kind; label: string }[] = [
    { id: 'private', label: 'Privates' },
    { id: 'class', label: 'Classes' },
    { id: 'clinic', label: 'Clinics' },
  ];

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [month]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 sm:px-5 border-b border-gray-100 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setKind(t.id);
                setLoading(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                kind === t.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setLoading(true);
              }}
              className="ml-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-800"
            />
          </label>
          {isAdmin && kind !== 'clinic' && (
            <select
              value={coachId}
              onChange={(e) => {
                setCoachId(e.target.value);
                setLoading(true);
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-800"
            >
              <option value="">All coaches</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athlete, parent, email, program…"
            className="sm:ml-auto w-full sm:max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="px-5 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</p>
      )}

      {loading ? (
        <p className="px-5 py-12 text-center text-sm text-gray-500">Loading {monthLabel}…</p>
      ) : kind === 'private' ? (
        privates.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">No private lessons in {monthLabel}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-gray-100">
                  <th className="px-4 sm:px-5 py-2 font-semibold">Date</th>
                  <th className="px-2 py-2 font-semibold">Time</th>
                  <th className="px-2 py-2 font-semibold">Type</th>
                  <th className="px-2 py-2 font-semibold">Athlete</th>
                  <th className="px-2 py-2 font-semibold">Parent</th>
                  {isAdmin && <th className="px-2 py-2 font-semibold">Coach</th>}
                  <th className="px-2 py-2 font-semibold">Amount</th>
                  <th className="px-2 py-2 font-semibold">Pay</th>
                  <th className="px-4 sm:px-5 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {privates.map((row) => (
                  <tr key={row.id} className={`border-t border-gray-50 ${row.status === 'CANCELLED' ? 'opacity-60' : 'hover:bg-slate-50/80'}`}>
                    <td className="px-4 sm:px-5 py-2.5 whitespace-nowrap font-medium text-slate-900">
                      {formatPt(new Date(row.startISO), 'EEE, MMM d')}
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-slate-700">
                      {formatPt(new Date(row.startISO), 'h:mm a')}
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${kindPill('private')}`}>
                        {kindLabel('private')}
                      </span>
                      {privateLabel(row.privateKind) && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{privateLabel(row.privateKind)}</p>
                      )}
                    </td>
                    <td className="px-2 py-2.5 font-medium text-slate-900">{row.athleteName}</td>
                    <td className="px-2 py-2.5">
                      <p className="text-slate-800">{row.customerName}</p>
                      {row.customerEmail && (
                        <a href={`mailto:${row.customerEmail}`} className="text-[11px] text-blue-600 hover:underline break-all">
                          {row.customerEmail}
                        </a>
                      )}
                    </td>
                    {isAdmin && <td className="px-2 py-2.5 whitespace-nowrap text-slate-700">{row.coachName || '—'}</td>}
                    <td className="px-2 py-2.5 whitespace-nowrap">{money(row.priceCents)}</td>
                    <td className={`px-2 py-2.5 text-[11px] font-semibold whitespace-nowrap ${payClass(row.paymentMethod)}`}>
                      {payLabel(row.paymentMethod)}
                    </td>
                    <td className="px-4 sm:px-5 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : sessions.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-gray-500">
          No {kind === 'class' ? 'classes' : 'clinics'} in {monthLabel}.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {sessions.map((session) => {
            const open = expanded.has(session.id);
            const confirmedCount = session.athletes.filter((a) => a.status !== 'CANCELLED').length;
            return (
              <div key={session.id}>
                <button
                  type="button"
                  onClick={() => toggle(session.id)}
                  className={`w-full text-left px-4 sm:px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 hover:bg-slate-50 ${
                    session.status === 'CANCELLED' ? 'opacity-60' : ''
                  }`}
                >
                  <span className="text-slate-400 text-xs w-4">{open ? '▾' : '▸'}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${kindPill(kind)}`}>
                    {kindLabel(kind)}
                  </span>
                  <span className="font-semibold text-slate-900 min-w-[10rem]">{session.title}</span>
                  <span className="text-sm text-slate-600 whitespace-nowrap">
                    {formatPt(new Date(session.startISO), "EEE, MMM d · h:mm a")}
                  </span>
                  {session.coachName && (
                    <span className="text-sm text-slate-500">{session.coachName}</span>
                  )}
                  <span className="text-xs font-semibold text-slate-500">
                    {confirmedCount} {confirmedCount === 1 ? 'athlete' : 'athletes'}
                    {session.athletes.length !== confirmedCount ? ` · ${session.athletes.length} total` : ''}
                  </span>
                  <span className={`ml-auto inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge(session.status)}`}>
                    {statusLabel(session.status)}
                  </span>
                </button>
                {open && (
                  <div className="bg-slate-50/80 border-t border-gray-100">
                    <AthleteDetails athletes={session.athletes} showStatus />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && total > pageSize && (
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-slate-600">
          <span>
            {total} result{total === 1 ? '' : 's'} · page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
