'use client';

import { useCallback, useEffect, useState } from 'react';
import BookPrivateDialog from './BookPrivateDialog';

type CoachSlot = {
  id: string;
  name: string;
  serviceId: string;
  specialties: string[];
  startUTC: string;
  endUTC: string;
};

type TimeEntry = {
  display: string;
  startMinutes: number;
  coaches: CoachSlot[];
};

type DayEntry = {
  date: string;
  label: string;
  times: TimeEntry[];
};

type BookingTarget = {
  coachId: string;
  serviceId: string;
  startUTC: string;
  endUTC: string;
  coachName: string;
  timeDisplay: string;
  dayLabel: string;
};

const DEFAULT_SELECTION = { kind: 'SOLO' as const, duration: 60 as const };

export default function QuickBookSection() {
  const [days, setDays] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedTime, setExpandedTime] = useState<string | null>(null); // "date|startMinutes"
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/availability/quick-book', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load availability');
      setDays(data.days);
      // Auto-expand first day that has availability
      const firstAvailable = (data.days as DayEntry[]).find((d) => d.times.length > 0);
      if (firstAvailable) setExpandedDay(firstAvailable.date);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleDay = (date: string) => {
    setExpandedDay((prev) => (prev === date ? null : date));
    setExpandedTime(null);
  };

  const toggleTime = (timeKey: string) => {
    setExpandedTime((prev) => (prev === timeKey ? null : timeKey));
  };

  const totalSlots = days.reduce((acc, d) => acc + d.times.length, 0);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm rounded-2xl px-5 py-4 shadow-soft-lg ring-1 backdrop-blur transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-50/95 text-emerald-800 ring-emerald-200'
              : 'bg-red-50/95 text-red-800 ring-red-200'
          }`}
        >
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

      <section className="overflow-hidden rounded-3xl bg-white shadow-soft-lg ring-1 ring-slate-200">
        {/* Section header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 px-6 py-5">
          <div aria-hidden className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quick Book</h3>
                <p className="mt-0.5 text-sm text-blue-100">
                  {loading
                    ? 'Finding availability…'
                    : error
                    ? 'Could not load availability'
                    : totalSlots === 0
                    ? 'No availability in the next 5 business days'
                    : 'Next 5 business days · 60 min Solo'}
                </p>
              </div>
            </div>
            {!loading && !error && totalSlots > 0 && (
              <span className="hidden flex-shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/25 sm:inline-block">
                {totalSlots} slot{totalSlots !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        ) : totalSlots === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mb-1 font-semibold text-slate-700">No availability in the next 5 business days</p>
            <p className="text-sm text-slate-500">Try searching by coach below to check further dates.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {days.map((day) => {
              const isExpanded = expandedDay === day.date;
              const hasSlots = day.times.length > 0;

              return (
                <div key={day.date} className={isExpanded ? 'bg-blue-50/40' : ''}>
                  {/* Day row */}
                  <button
                    type="button"
                    disabled={!hasSlots}
                    onClick={() => hasSlots && toggleDay(day.date)}
                    className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors sm:px-6 ${
                      hasSlots ? 'hover:bg-slate-50' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-colors ${
                          isExpanded
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm'
                            : hasSlots
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className={`font-semibold ${isExpanded ? 'text-blue-900' : 'text-slate-900'}`}>{day.label}</p>
                        <p className={`mt-0.5 text-xs ${isExpanded ? 'text-blue-600' : 'text-slate-500'}`}>
                          {hasSlots
                            ? `${day.times.length} time slot${day.times.length !== 1 ? 's' : ''} available`
                            : 'No availability'}
                        </p>
                      </div>
                    </div>

                    {hasSlots && (
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                          isExpanded ? 'rotate-180 bg-blue-100 text-blue-600' : 'text-slate-400'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    )}
                  </button>

                  {/* Time slots panel */}
                  {isExpanded && (
                    <div className="animate-fade-in space-y-3 px-5 pb-5 pt-1 sm:px-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Select a time</p>
                      <div className="space-y-2">
                        {day.times.map((time) => {
                          const timeKey = `${day.date}|${time.startMinutes}`;
                          const isTimeExpanded = expandedTime === timeKey;

                          return (
                            <div key={timeKey}>
                              {/* Time button */}
                              <button
                                type="button"
                                onClick={() => toggleTime(timeKey)}
                                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                  isTimeExpanded
                                    ? 'border-transparent bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-soft'
                                    : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/60'
                                }`}
                              >
                                <span className="flex items-center gap-2.5">
                                  <svg
                                    className={`h-4 w-4 ${isTimeExpanded ? 'text-blue-200' : 'text-slate-400'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold">{time.display}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                      isTimeExpanded ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {time.coaches.length} coach{time.coaches.length !== 1 ? 'es' : ''}
                                  </span>
                                  <svg
                                    className={`h-4 w-4 transition-transform duration-200 ${
                                      isTimeExpanded ? 'rotate-180 text-white' : 'text-slate-400'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </span>
                              </button>

                              {/* Coach list */}
                              {isTimeExpanded && (
                                <div className="mt-2 grid animate-fade-in grid-cols-1 gap-2 sm:grid-cols-2">
                                  <p className="col-span-full text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Select a coach
                                  </p>
                                  {time.coaches.map((coach) => (
                                    <button
                                      key={coach.id}
                                      type="button"
                                      onClick={() =>
                                        setBookingTarget({
                                          coachId: coach.id,
                                          serviceId: coach.serviceId,
                                          startUTC: coach.startUTC,
                                          endUTC: coach.endUTC,
                                          coachName: coach.name,
                                          timeDisplay: time.display,
                                          dayLabel: day.label,
                                        })
                                      }
                                      className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/60 hover:shadow-soft"
                                    >
                                      <span className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
                                          {coach.name.charAt(0)}
                                        </span>
                                        <span className="flex flex-col items-start">
                                          <span className="font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                                            {coach.name}
                                          </span>
                                          {coach.specialties.length > 0 && (
                                            <span className="text-xs text-slate-500">
                                              {coach.specialties.join(' • ')}
                                            </span>
                                          )}
                                        </span>
                                      </span>
                                      <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition-colors group-hover:bg-blue-100">
                                        Book
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Booking dialog */}
      {bookingTarget && (
        <BookPrivateDialog
          coachId={bookingTarget.coachId}
          serviceId={bookingTarget.serviceId}
          selection={DEFAULT_SELECTION}
          startUTC={bookingTarget.startUTC}
          endUTC={bookingTarget.endUTC}
          onClose={() => setBookingTarget(null)}
          onSuccess={(requiresApproval) => {
            setBookingTarget(null);
            load(); // refresh availability after booking
            if (requiresApproval) {
              showToast("Request submitted! You'll receive an email once your coach approves it.", 'success');
            } else {
              showToast('Private lesson booked! Check your email for details.', 'success');
            }
          }}
        />
      )}
    </>
  );
}
