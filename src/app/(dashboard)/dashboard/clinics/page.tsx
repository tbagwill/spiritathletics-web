'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClinicRegistration {
  id: string;
  athleteFirstName: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: 'CARD' | 'CASH';
  status: string;
  createdAt: string;
  stripeSessionId?: string | null;
}

interface Clinic {
  id: string;
  title: string;
  slug: string;
  description: string;
  dateTimeUTC: string;
  endDateTimeUTC: string;
  durationMinutes: number;
  priceCents: number;
  capacity: number;
  location?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  registrations: ClinicRegistration[];
}

type FormMode = 'create' | 'edit' | null;

const DEFAULT_LOCATION = 'Spirit Athletics — 17537 Bear Valley Rd, Hesperia, CA 92345';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit',
    timeZoneName: 'short', timeZone: 'America/Los_Angeles',
  });
}

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  const ptStr = d.toLocaleString('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  return ptStr.replace(', ', 'T').replace(' ', 'T');
}

/** Given a datetime-local string and duration in minutes, return the end ISO string */
function computeEndDateTimeUTC(startLocal: string, durationMinutes: number): string {
  const start = new Date(startLocal);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return end.toISOString();
}

const EMPTY_FORM = {
  title: '', slug: '', description: '',
  dateTimeUTC: '',
  durationMinutes: 60,
  priceCents: 0,
  capacity: 20,
  location: DEFAULT_LOCATION,
  imageUrl: '',
  isActive: true,
  isFeatured: true,
};

// Shared input className — visible placeholder text
const INPUT = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white';
const TEXTAREA = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white resize-none';

export default function DashboardClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [removingRegId, setRemovingRegId] = useState<string | null>(null);
  const [printClinicId, setPrintClinicId] = useState<string | null>(null);

  const handlePrintRoster = (clinic: Clinic) => {
    const rows = clinic.registrations
      .map(
        (reg, i) =>
          `<tr style="border-bottom:1px solid #e5e7eb;${i % 2 === 0 ? 'background:#f9fafb;' : ''}">
            <td style="padding:6px 10px;color:#6b7280;">${i + 1}</td>
            <td style="padding:6px 10px;font-weight:600;color:#111827;">${reg.athleteFirstName}</td>
            <td style="padding:6px 10px;color:#374151;">${reg.customerName}</td>
            <td style="padding:6px 10px;color:#374151;">${reg.customerEmail}</td>
            <td style="padding:6px 10px;"><span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;${reg.paymentMethod === 'CASH' ? 'background:#fef3c7;color:#b45309;' : 'background:#d1fae5;color:#047857;'}">${reg.paymentMethod === 'CASH' ? 'Cash' : 'Card'}</span></td>
            <td style="padding:6px 10px;color:#6b7280;">${new Date(reg.createdAt).toLocaleDateString()}</td>
          </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html><head><title>${clinic.title} — Attendee Roster</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #111827; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { font-size: 13px; color: #4b5563; margin: 2px 0; }
  .total { font-size: 13px; font-weight: 600; color: #374151; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
  thead tr { border-bottom: 2px solid #d1d5db; }
  th { padding: 6px 10px; text-align: left; font-weight: 600; color: #374151; }
  @media print {
    body { padding: 12px; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
  }
</style></head><body>
<h1>${clinic.title}</h1>
<p class="meta">${formatDateTime(clinic.dateTimeUTC)} · ${clinic.durationMinutes} min</p>
${clinic.location ? `<p class="meta">${clinic.location}</p>` : ''}
<p class="total">Total registered: ${clinic.registrations.length} / ${clinic.capacity}</p>
${clinic.registrations.length === 0 ? '<p style="color:#9ca3af;margin-top:16px;">No registrations yet.</p>' : `
<table>
  <thead><tr>
    <th style="width:30px;">#</th><th>Athlete</th><th>Parent / Guardian</th><th>Email</th><th>Payment</th><th>Registered</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`}
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRemoveRegistration = async (reg: ClinicRegistration, refund: boolean) => {
    const action = refund ? 'refund and remove' : 'remove';
    if (!confirm(`Are you sure you want to ${action} ${reg.athleteFirstName} (booked by ${reg.customerName})?`)) return;

    setRemovingRegId(reg.id);
    try {
      const url = `/api/dashboard/clinics/registrations/${reg.id}${refund ? '?refund=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast(data.refunded ? 'Refunded & removed.' : 'Registration removed.');
      load();
    } catch (e: any) {
      showToast(e.message || 'Something went wrong.');
    } finally {
      setRemovingRegId(null);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/clinics');
      const data = await res.json();
      if (data.ok) setClinics(data.clinics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setFormMode('create');
    setError(null);
  };

  const openEdit = (clinic: Clinic) => {
    setForm({
      title: clinic.title,
      slug: clinic.slug,
      description: clinic.description,
      dateTimeUTC: toLocalDatetimeValue(clinic.dateTimeUTC),
      durationMinutes: clinic.durationMinutes,
      priceCents: clinic.priceCents,
      capacity: clinic.capacity,
      location: clinic.location || DEFAULT_LOCATION,
      imageUrl: clinic.imageUrl || '',
      isActive: clinic.isActive,
      isFeatured: clinic.isFeatured,
    });
    setEditingId(clinic.id);
    setFormMode('edit');
    setError(null);
  };

  const closeForm = () => { setFormMode(null); setEditingId(null); setError(null); };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!form.dateTimeUTC) throw new Error('Start date & time is required');
      if (!form.title.trim()) throw new Error('Title is required');
      if (!form.description.trim()) throw new Error('Description is required');

      const startISO = new Date(form.dateTimeUTC).toISOString();
      const endISO = computeEndDateTimeUTC(form.dateTimeUTC, Number(form.durationMinutes));

      const payload = {
        ...form,
        priceCents: Number(form.priceCents),
        durationMinutes: Number(form.durationMinutes),
        capacity: Number(form.capacity),
        dateTimeUTC: startISO,
        endDateTimeUTC: endISO,
        imageUrl: form.imageUrl || '',
        location: form.location.trim() || DEFAULT_LOCATION,
      };

      const url = formMode === 'create' ? '/api/dashboard/clinics' : `/api/dashboard/clinics/${editingId}`;
      const method = formMode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save');
      showToast(formMode === 'create' ? 'Clinic created!' : 'Clinic updated!');
      closeForm();
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clinic: Clinic) => {
    if (!confirm(`Delete "${clinic.title}"? This will also remove all registrations.`)) return;
    await fetch(`/api/dashboard/clinics/${clinic.id}`, { method: 'DELETE' });
    showToast('Clinic deleted.');
    load();
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Derived end time preview for the form
  const endPreview = form.dateTimeUTC && form.durationMinutes
    ? new Date(new Date(form.dateTimeUTC).getTime() + Number(form.durationMinutes) * 60_000).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles',
      }) + ' PT'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-xl shadow-lg font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinics &amp; Special Events</h1>
              <p className="text-sm text-gray-500">All coaches can create and manage clinics · visible on the public booking page</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-md hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Clinic
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">No clinics yet</p>
            <p className="text-gray-400 text-sm">Create your first clinic to display it on the booking page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clinics.map((clinic) => {
              const spotsLeft = clinic.capacity - clinic.registrations.length;
              const isPast = new Date(clinic.dateTimeUTC) < new Date();
              return (
                <div key={clinic.id} className="bg-white rounded-2xl shadow border border-gray-100">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">{clinic.title}</h3>
                          {clinic.isFeatured && (
                            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Featured</span>
                          )}
                          {!clinic.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">Inactive</span>
                          )}
                          {isPast && (
                            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Past</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{formatDateTime(clinic.dateTimeUTC)} · {clinic.durationMinutes} min</p>
                        <p className="text-sm text-gray-500">{spotsLeft} / {clinic.capacity} spots available · ${(clinic.priceCents / 100).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpandedId(expandedId === clinic.id ? null : clinic.id)}
                          className="px-3 py-1.5 rounded-lg text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-medium transition-colors"
                        >
                          {expandedId === clinic.id ? 'Hide' : `Registrants (${clinic.registrations.length})`}
                        </button>
                        <button
                          onClick={() => setPrintClinicId(clinic.id)}
                          title="Print roster"
                          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEdit(clinic)}
                          title="Edit clinic"
                          className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(clinic)}
                          title="Delete clinic"
                          className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded registrants */}
                  {expandedId === clinic.id && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Registrants</h4>
                      {clinic.registrations.length === 0 ? (
                        <p className="text-sm text-gray-400">No registrations yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {clinic.registrations.map((reg) => {
                            const isRemoving = removingRegId === reg.id;
                            const canRefund = reg.paymentMethod === 'CARD' && !!reg.stripeSessionId;
                            return (
                              <div key={reg.id} className={`flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 ${isRemoving ? 'opacity-50' : ''}`}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-800 truncate">{reg.athleteFirstName} <span className="text-gray-400 font-normal">(booked by {reg.customerName})</span></p>
                                    {reg.paymentMethod === 'CASH' ? (
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">CASH</span>
                                    ) : (
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">PAID</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">{reg.customerEmail}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                  <span className="text-xs text-gray-400 hidden sm:inline">{new Date(reg.createdAt).toLocaleDateString()}</span>
                                  {canRefund && (
                                    <button
                                      onClick={() => handleRemoveRegistration(reg, true)}
                                      disabled={isRemoving}
                                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                                    >
                                      Refund &amp; Remove
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleRemoveRegistration(reg, false)}
                                    disabled={isRemoving}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Print Roster Preview Dialog */}
      {printClinicId && (() => {
        const clinic = clinics.find((c) => c.id === printClinicId);
        if (!clinic) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPrintClinicId(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10">
              {/* Dialog header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">Attendee Roster</h2>
                <button onClick={() => setPrintClinicId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-gray-900">{clinic.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{formatDateTime(clinic.dateTimeUTC)} · {clinic.durationMinutes} min</p>
                  {clinic.location && <p className="text-sm text-gray-600">{clinic.location}</p>}
                  <p className="text-sm font-semibold text-gray-700 mt-2">
                    Total registered: {clinic.registrations.length} / {clinic.capacity}
                  </p>
                </div>

                {clinic.registrations.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">No registrations yet.</p>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300 text-left">
                        <th className="py-2 pr-3 font-semibold text-gray-700 w-8">#</th>
                        <th className="py-2 pr-3 font-semibold text-gray-700">Athlete</th>
                        <th className="py-2 pr-3 font-semibold text-gray-700">Parent / Guardian</th>
                        <th className="py-2 pr-3 font-semibold text-gray-700">Email</th>
                        <th className="py-2 pr-3 font-semibold text-gray-700">Payment</th>
                        <th className="py-2 font-semibold text-gray-700">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinic.registrations.map((reg, i) => (
                        <tr key={reg.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-2 pr-3 text-gray-500">{i + 1}</td>
                          <td className="py-2 pr-3 font-medium text-gray-900">{reg.athleteFirstName}</td>
                          <td className="py-2 pr-3 text-gray-700">{reg.customerName}</td>
                          <td className="py-2 pr-3 text-gray-700">{reg.customerEmail}</td>
                          <td className="py-2 pr-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${reg.paymentMethod === 'CASH' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {reg.paymentMethod === 'CASH' ? 'Cash' : 'Card'}
                            </span>
                          </td>
                          <td className="py-2 text-gray-500">{new Date(reg.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Action buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setPrintClinicId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintRoster(clinic)}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all"
                  style={{ background: 'linear-gradient(135deg, #374151, #1f2937)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Roster
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create / Edit Form Modal */}
      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">{formMode === 'create' ? 'Create Clinic' : 'Edit Clinic'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
                    className={INPUT}
                    placeholder="e.g. Summer Cheer Clinic"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className={TEXTAREA}
                    placeholder="Describe the clinic, what athletes will learn, who it's for..."
                  />
                </div>

                {/* Start Date & Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date &amp; Time (PT) *</label>
                  <input
                    type="datetime-local"
                    value={form.dateTimeUTC}
                    onChange={(e) => setForm({ ...form, dateTimeUTC: e.target.value })}
                    className={INPUT}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    className={INPUT}
                    min={1}
                    placeholder="60"
                  />
                  {endPreview && (
                    <p className="text-xs text-purple-600 font-medium mt-1.5">
                      ✓ Ends at {endPreview}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      value={form.priceCents === 0 ? '' : (form.priceCents / 100).toFixed(2)}
                      onChange={(e) => setForm({ ...form, priceCents: Math.round(Number(e.target.value) * 100) })}
                      className={INPUT + ' pl-7'}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className={INPUT}
                    min={1}
                    placeholder="20"
                  />
                </div>

                {/* Location */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={INPUT}
                    placeholder={DEFAULT_LOCATION}
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave as-is for the Spirit Athletics gym, or change for off-site events.</p>
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className={INPUT}
                    placeholder="https://..."
                  />
                </div>

                {/* Slug — advanced, collapsed at the bottom */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Slug <span className="font-normal text-gray-400">(auto-generated)</span></label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={INPUT + ' font-mono text-sm'}
                    placeholder="summer-cheer-clinic"
                  />
                </div>

                {/* Toggles */}
                <div className="sm:col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded accent-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (visible to public)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded accent-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60 flex items-center gap-2 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  formMode === 'create' ? 'Create Clinic' : 'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
