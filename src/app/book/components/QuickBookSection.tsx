'use client';

import { useCallback, useEffect, useState } from 'react';
import BookPrivateDialog from './BookPrivateDialog';

type CoachSlot = {
  id: string;
  name: string;
  serviceId: string;
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
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden animate-slide-up">
        {/* Section header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Quick Book</h3>
              <p className="text-blue-100 text-sm mt-0.5">
                {loading
                  ? 'Finding availability...'
                  : error
                  ? 'Could not load availability'
                  : totalSlots === 0
                  ? 'No availability in the next 5 business days'
                  : 'Available times for the next 5 business days · 60 min Solo'}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        ) : totalSlots === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium text-gray-700 mb-1">No availability in the next 5 business days</p>
            <p className="text-sm text-gray-500">Try searching by coach below to check further dates.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {days.map((day) => {
              const isExpanded = expandedDay === day.date;
              const hasSlots = day.times.length > 0;

              return (
                <div key={day.date}>
                  {/* Day row */}
                  <button
                    type="button"
                    disabled={!hasSlots}
                    onClick={() => hasSlots && toggleDay(day.date)}
                    className={`w-full flex items-center justify-between px-6 py-4 transition-colors text-left ${
                      hasSlots
                        ? isExpanded
                          ? 'bg-blue-50 hover:bg-blue-50'
                          : 'hover:bg-gray-50'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isExpanded
                            ? 'bg-blue-600 text-white'
                            : hasSlots
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className={`font-semibold ${isExpanded ? 'text-blue-900' : 'text-gray-900'}`}>
                          {day.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${isExpanded ? 'text-blue-600' : 'text-gray-500'}`}>
                          {hasSlots
                            ? `${day.times.length} time slot${day.times.length !== 1 ? 's' : ''} available`
                            : 'No availability'}
                        </p>
                      </div>
                    </div>

                    {hasSlots && (
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-blue-600' : 'text-gray-400'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Time slots panel */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-2 bg-blue-50/60 space-y-2 animate-fade-in">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                        Select a time
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {day.times.map((time) => {
                          const timeKey = `${day.date}|${time.startMinutes}`;
                          const isTimeExpanded = expandedTime === timeKey;

                          return (
                            <div key={timeKey} className="col-span-2 sm:col-span-3 md:col-span-4">
                              {/* Time button */}
                              <button
                                type="button"
                                onClick={() => toggleTime(timeKey)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                                  isTimeExpanded
                                    ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                                    : 'border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <svg
                                    className={`w-4 h-4 ${isTimeExpanded ? 'text-blue-200' : 'text-gray-400'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold">{time.display}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      isTimeExpanded
                                        ? 'bg-white/20 text-white'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {time.coaches.length} coach{time.coaches.length !== 1 ? 'es' : ''}
                                  </span>
                                  <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                      isTimeExpanded ? 'rotate-180 text-white' : 'text-gray-400'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>

                              {/* Coach list */}
                              {isTimeExpanded && (
                                <div className="mt-2 pl-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
                                  <p className="col-span-full text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
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
                                      className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                          {coach.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                          {coach.name}
                                        </span>
                                      </div>
                                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 group-hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors">
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
      </div>

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
