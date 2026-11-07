'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import BookPrivateDialog from './BookPrivateDialog';
import { ptTodayString } from '@/lib/time';
import { Field, Input } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';

type Coach = { id: string; name: string; serviceId: string; specialties: string[] };

type Props = {
  coaches: Coach[];
};

const durations = [
  { key: 'SOLO_30', label: '30 min · Solo · $40', selection: { kind: 'SOLO' as const, duration: 30 } },
  { key: 'SOLO_45', label: '45 min · Solo · $50', selection: { kind: 'SOLO' as const, duration: 45 } },
  { key: 'SOLO_60', label: '60 min · Solo · $60', selection: { kind: 'SOLO' as const, duration: 60 } },
  { key: 'SEMI_60', label: '60 min · Semi-private · $70', description: '2 athletes, $35 each', selection: { kind: 'SEMI_PRIVATE' as const, duration: 60 } },
];

export default function PrivateLessonPicker({ coaches }: Props) {
  const [coachId, setCoachId] = useState(coaches[0]?.id ?? '');
  const [durationKey, setDurationKey] = useState('SOLO_60'); // Default to 60 min Solo
  const [date, setDate] = useState(ptTodayString());

  const [slots, setSlots] = useState<{ startUTC: string; endUTC: string; display: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ startUTC: string; endUTC: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedDuration = useMemo(() => durations.find((d) => d.key === durationKey)!, [durationKey]);
  const selectedCoach = useMemo(() => coaches.find((c) => c.id === coachId) || coaches[0], [coachId, coaches]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchSlots = useCallback(async () => {
    if (!selectedCoach || !selectedDuration || !date) return;
    setLoading(true);
    setError(null);
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const res = await fetch(`/api/availability/slots?coachId=${encodeURIComponent(selectedCoach.id)}&date=${encodeURIComponent(date)}&duration=${selectedDuration.selection.duration}&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load slots');
      setSlots(data.slots.map((s: any) => ({ ...s, startUTC: new Date(s.startUTC).toISOString(), endUTC: new Date(s.endUTC).toISOString() })));
    } catch (e: any) {
      setError(e.message || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [selectedCoach, selectedDuration, date]);

  useEffect(() => {
    fetchSlots();
  }, [selectedCoach, selectedDuration, date, fetchSlots]);

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-2xl px-5 py-4 shadow-soft-lg ring-1 backdrop-blur transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50/95 text-emerald-800 ring-emerald-200'
            : 'bg-red-50/95 text-red-800 ring-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-fade-in">
      {/* Selection Form */}
      <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Pick a coach</h3>
        <p className="mt-0.5 text-sm text-slate-500">Then choose a lesson length and date to see open times.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Coach" className="sm:col-span-2">
            {(id) => (
              <Select
                id={id}
                value={coachId}
                onValueChange={setCoachId}
                options={coaches.map((c) => ({
                  value: c.id,
                  label: c.name,
                  description: c.specialties.length > 0 ? c.specialties.join(', ') : undefined,
                }))}
              />
            )}
          </Field>
          <Field label="Lesson length">
            {(id) => (
              <Select
                id={id}
                value={durationKey}
                onValueChange={setDurationKey}
                options={durations.map((d) => ({ value: d.key, label: d.label, description: d.description }))}
              />
            )}
          </Field>
          <Field label="Date">
            {(id) => (
              <Input id={id} type="date" value={date} min={ptTodayString()} onChange={(e) => setDate(e.target.value)} />
            )}
          </Field>
        </div>
      </div>

      {/* Available Times */}
      <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h4 className="text-base font-bold text-slate-900">Available Times</h4>
          {!loading && !error && slots.length > 0 && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {slots.length} open
            </span>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        ) : slots.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">No available time slots for the selected date.</p>
            <p className="mt-1 text-xs text-slate-500">Try selecting a different date or coach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {slots.map((s, index) => (
              <button
                key={s.startUTC}
                onClick={() => setSelectedSlot({ startUTC: s.startUTC, endUTC: s.endUTC })}
                className="animate-fade-in rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-soft"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {s.display}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSlot && selectedCoach && selectedDuration && (
        <div className="animate-fade-in">
          <BookPrivateDialog
            coachId={selectedCoach.id}
            serviceId={selectedCoach.serviceId}
            coachName={selectedCoach.name}
            selection={selectedDuration.selection as any}
            startUTC={selectedSlot.startUTC}
            endUTC={selectedSlot.endUTC}
            onClose={() => setSelectedSlot(null)}
            onSuccess={(requiresApproval) => {
              // Clear selected slot and refresh availability
              setSelectedSlot(null);
              fetchSlots();
              
              // Show appropriate success message
              if (requiresApproval) {
                showToast('Request submitted! You\'ll receive an email once your coach approves it.', 'success');
              } else {
                showToast('Private lesson booked! Check your email for details.', 'success');
              }
            }}
          />
        </div>
      )}
      </div>
    </>
  );
} 