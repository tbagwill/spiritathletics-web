'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClinicRegistration {
  id: string;
  athleteFirstName: string;
  customerName: string;
  customerEmail: string;
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
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

  const handleToggleActive = async (clinic: Clinic) => {
    await fetch(`/api/dashboard/clinics/${clinic.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !clinic.isActive }),
    });
    load();
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setExpandedId(expandedId === clinic.id ? null : clinic.id)}
                          className="px-3 py-1.5 rounded-lg text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-medium transition-colors"
                        >
                          {expandedId === clinic.id ? 'Hide' : `Registrants (${clinic.registrations.length})`}
                        </button>
                        <button
                          onClick={() => openEdit(clinic)}
                          className="px-3 py-1.5 rounded-lg text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(clinic)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${clinic.isActive ? 'text-gray-600 bg-gray-100 hover:bg-gray-200' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}
                        >
                          {clinic.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(clinic)}
                          className="px-3 py-1.5 rounded-lg text-sm text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors"
                        >
                          Delete
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
                          {clinic.registrations.map((reg) => (
                            <div key={reg.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{reg.athleteFirstName} <span className="text-gray-400 font-normal">(booked by {reg.customerName})</span></p>
                                <p className="text-xs text-gray-500">{reg.customerEmail}</p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(reg.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
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
