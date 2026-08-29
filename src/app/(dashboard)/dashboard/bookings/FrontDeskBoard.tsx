'use client';

import { useMemo, useState } from 'react';
import { formatPt, ptDateString } from '@/lib/time';

type Kind = 'PRIVATE' | 'CLASS' | 'CLINIC' | 'HOLD';

export type DeskBooking = {
  id: string;
  kind: Kind;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  startISO: string;
  endISO: string;
  title: string;
  coachName: string;
  athleteName: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: 'CARD' | 'CASH' | null;
  priceCents: number;
  notes?: string | null;
  privateKind?: string | null;
  cancelable: boolean;
};

type Filter = 'all' | 'today' | 'pending' | 'private' | 'class' | 'clinic';

function kindStyles(kind: Kind) {
  if (kind === 'CLASS') return 'bg-emerald-50 text-emerald-800';
  if (kind === 'CLINIC') return 'bg-purple-50 text-purple-800';
  if (kind === 'HOLD') return 'bg-amber-50 text-amber-800';
  return 'bg-blue-50 text-blue-800';
}

function kindLabel(kind: Kind) {
  if (kind === 'CLASS') return 'Class';
  if (kind === 'CLINIC') return 'Clinic';
  if (kind === 'HOLD') return 'Hold';
  return 'Private';
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function durationLabel(startISO: string, endISO: string) {
  const mins = Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins <= 0) return '';
  return `${mins} min`;
}

function privateLabel(kind?: string | null) {
  if (kind === 'SEMI_PRIVATE') return 'Semi-private';
  if (kind === 'SOLO') return 'Solo';
  return null;
}

export default function FrontDeskBoard({ rows, canCancel }: { rows: DeskBooking[]; canCancel: boolean }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<DeskBooking | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const today = ptDateString(new Date());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === 'today' && ptDateString(new Date(row.startISO)) !== today) return false;
      if (filter === 'pending' && row.status !== 'PENDING') return false;
      if (filter === 'private' && row.kind !== 'PRIVATE') return false;
      if (filter === 'class' && row.kind !== 'CLASS') return false;
      if (filter === 'clinic' && row.kind !== 'CLINIC') return false;
      if (!q) return true;
      const hay = [row.title, row.coachName, row.athleteName, row.customerName, row.customerEmail].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [rows, filter, query, today]);

  const groups = useMemo(() => {
    const map = new Map<string, DeskBooking[]>();
    for (const row of filtered) {
      const key = ptDateString(new Date(row.startISO));
      const list = map.get(key) || [];
      list.push(row);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const pendingCount = rows.filter((r) => r.status === 'PENDING').length;
  const todayCount = rows.filter((r) => ptDateString(new Date(r.startISO)) === today && r.status !== 'CANCELLED').length;

  const runApprove = async (row: DeskBooking) => {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/dashboard/bookings/${row.id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');
      showToast(data.warning || 'Approved and confirmed.', data.warning ? 'error' : 'success');
      window.location.reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to approve', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const runDecline = async (row: DeskBooking) => {
    const refundNote = row.paymentMethod === 'CARD'
      ? ' A card refund will be issued if payment was processed.'
      : ' No card payment is on file.';
    if (!confirm(`Decline this private request for ${row.athleteName}? The family will be emailed.${refundNote}`)) return;
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/dashboard/bookings/${row.id}/decline`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to decline');
      showToast('Request declined.', 'success');
      window.location.reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to decline', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const runCancel = async () => {
    if (!cancelTarget || cancelTarget.kind === 'CLINIC') return;
    setBusyId(cancelTarget.id);
    try {
      const res = await fetch(`/api/dashboard/bookings/${cancelTarget.id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel');
      showToast(data.message || 'Cancelled.', 'success');
      setCancelTarget(null);
      window.location.reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to cancel', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'today', label: `Today (${todayCount})` },
    { id: 'pending', label: `Pending (${pendingCount})` },
    { id: 'private', label: 'Privates' },
    { id: 'class', label: 'Classes' },
    { id: 'clinic', label: 'Clinics' },
  ];

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md px-5 py-3 rounded-xl border text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-4 sm:px-5 border-b border-gray-100 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athlete, parent, coach, email, program…"
            className="lg:ml-auto w-full lg:max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        {groups.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">No matching sessions in this window.</p>
        ) : (
          groups.map(([dateKey, items]) => (
            <div key={dateKey} className="border-b border-gray-100 last:border-b-0">
              <div className="px-4 sm:px-5 py-2 bg-slate-50 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {formatPt(new Date(items[0].startISO), 'EEEE, MMMM d')}
                  {dateKey === today ? ' · Today' : ''}
                  <span className="ml-2 font-medium normal-case tracking-normal text-slate-400">{items.length}</span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="px-4 sm:px-5 py-2 font-semibold">Time</th>
                      <th className="px-2 py-2 font-semibold">Type</th>
                      <th className="px-2 py-2 font-semibold">Program</th>
                      <th className="px-2 py-2 font-semibold">Coach</th>
                      <th className="px-2 py-2 font-semibold">Athlete</th>
                      <th className="px-2 py-2 font-semibold">Parent</th>
                      <th className="px-2 py-2 font-semibold">Pay</th>
                      <th className="px-4 sm:px-5 py-2 font-semibold text-right"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.sort((a, b) => a.startISO.localeCompare(b.startISO)).map((row) => {
                      const muted = row.status === 'CANCELLED';
                      return (
                        <tr key={`${row.kind}-${row.id}`} className={`border-t border-gray-50 ${muted ? 'opacity-50' : 'hover:bg-slate-50/80'}`}>
                          <td className="px-4 sm:px-5 py-2.5 whitespace-nowrap align-top">
                            <p className="font-semibold text-slate-900">{formatPt(new Date(row.startISO), 'h:mm a')}</p>
                            <p className="text-[11px] text-slate-400">{durationLabel(row.startISO, row.endISO)}</p>
                          </td>
                          <td className="px-2 py-2.5 align-top">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${kindStyles(row.kind)}`}>
                              {kindLabel(row.kind)}
                            </span>
                            {row.status === 'PENDING' && (
                              <span className="ml-1 inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>
                            )}
                            {row.status === 'CANCELLED' && (
                              <span className="ml-1 inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">Cancelled</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 align-top">
                            <p className="font-medium text-slate-900">{row.title}</p>
                            {privateLabel(row.privateKind) && (
                              <p className="text-[11px] text-slate-400">{privateLabel(row.privateKind)}</p>
                            )}
                          </td>
                          <td className="px-2 py-2.5 align-top text-slate-700 whitespace-nowrap">{row.coachName || '—'}</td>
                          <td className="px-2 py-2.5 align-top font-medium text-slate-900">{row.athleteName || '—'}</td>
                          <td className="px-2 py-2.5 align-top">
                            <p className="text-slate-800">{row.customerName || '—'}</p>
                            {row.customerEmail && (
                              <a href={`mailto:${row.customerEmail}`} className="text-[11px] text-blue-600 hover:underline break-all">
                                {row.customerEmail}
                              </a>
                            )}
                          </td>
                          <td className="px-2 py-2.5 align-top whitespace-nowrap">
                            {row.kind === 'HOLD' ? (
                              <span className="text-xs text-slate-400">—</span>
                            ) : (
                              <>
                                <p className="text-slate-800">{money(row.priceCents)}</p>
                                <p className={`text-[11px] font-semibold ${row.paymentMethod === 'CASH' ? 'text-amber-700' : 'text-emerald-700'}`}>
                                  {row.paymentMethod === 'CASH' ? 'CASH due' : 'PAID'}
                                </p>
                              </>
                            )}
                          </td>
                          <td className="px-4 sm:px-5 py-2.5 align-top text-right whitespace-nowrap">
                            {row.status === 'PENDING' && (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  disabled={busyId === row.id}
                                  onClick={() => runApprove(row)}
                                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  disabled={busyId === row.id}
                                  onClick={() => runDecline(row)}
                                  className="px-2.5 py-1 rounded-md text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            {row.status === 'CONFIRMED' && row.cancelable && canCancel && row.kind !== 'CLINIC' && (
                              <button
                                onClick={() => setCancelTarget(row)}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </button>
                            )}
                            {row.kind === 'CLINIC' && row.status === 'CONFIRMED' && (
                              <a href="/dashboard/clinics" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                                Clinics
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Cancel this session?</h3>
            <p className="text-sm text-gray-600 mt-1">
              {cancelTarget.title} · {cancelTarget.athleteName} · {formatPt(new Date(cancelTarget.startISO), "EEE, MMM d 'at' h:mm a 'PT'")}
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              {cancelTarget.customerEmail} will be emailed.
              {cancelTarget.paymentMethod === 'CARD'
                ? ' If a card payment was processed, a Stripe refund will be issued.'
                : ' No card payment is on file.'}
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCancelTarget(null)} className="flex-1 px-4 py-2 rounded-lg border text-sm">Keep</button>
              <button
                onClick={runCancel}
                disabled={busyId === cancelTarget.id}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                Cancel session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
