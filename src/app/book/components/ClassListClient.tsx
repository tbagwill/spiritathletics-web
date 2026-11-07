'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPt } from '@/lib/time';
import BookClassDialog from './BookClassDialog';

interface ClassOccurrence {
  id: string;
  capacity: number;
  startDateTimeUTC: string;
  classTemplate: {
    service: {
      id: string;
      title: string;
      description: string;
      basePriceCents: number;
      coach: {
        user: {
          name: string | null;
        };
      } | null;
    };
    location?: string | null;
  };
  bookings: { id: string }[];
}

interface ClassListClientProps {
  occurrences: ClassOccurrence[];
}

export default function ClassListClient({ occurrences }: ClassListClientProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleBookingSuccess = () => {
    showToast('Redirecting to secure payment…', 'success');
  };

  if (occurrences.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-soft ring-1 ring-slate-200/70">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-spirit-50">
          <svg className="size-7 text-spirit" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-semibold text-slate-900">No classes scheduled in the next 2 weeks</p>
        <p className="mt-1 text-sm text-slate-500">Check back soon, or book a private lesson instead.</p>
        <Link
          href="/book/privates"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-spirit px-5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,254,0.6)] transition-colors hover:bg-spirit-500"
        >
          Book a private lesson
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Class Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {occurrences.map((occ) => {
          const service = occ.classTemplate.service;
          const coachName = service.coach?.user?.name ?? null;
          const booked = occ.bookings.length;
          const remaining = occ.capacity - booked;
          const fillPercent = Math.round((booked / occ.capacity) * 100);
          const startPtText = formatPt(new Date(occ.startDateTimeUTC), "EEE, MMM d • h:mm a 'PT'");
          const priceCents = service.basePriceCents;
          const isFull = remaining <= 0;

          return (
            <div
              key={occ.id}
              className={`group overflow-hidden rounded-3xl bg-white shadow-soft ring-1 transition-all duration-300 ${isFull ? 'opacity-75 ring-slate-200' : 'ring-slate-200/70 hover:-translate-y-0.5 hover:shadow-soft-lg hover:ring-spirit/40'}`}
            >
              {/* Top color accent */}
              <div className={`h-1.5 ${isFull ? 'bg-slate-300' : 'bg-spirit-gradient'}`} />

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-spirit">{service.title}</h3>
                    {coachName && (
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {coachName}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xl font-semibold tabular-nums text-spirit">
                    ${(priceCents / 100).toFixed(2)}
                  </span>
                </div>

                {/* Date/time */}
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-3">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {startPtText}
                </p>

                {/* Capacity bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-semibold ${isFull ? 'text-red-500' : remaining <= 3 ? 'text-amber-500' : 'text-green-600'}`}>
                      {isFull ? 'Class Full' : `${remaining} spot${remaining !== 1 ? 's' : ''} left`}
                    </span>
                    <span className="text-gray-400">{booked} / {occ.capacity}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${fillPercent >= 100 ? 'bg-red-400' : fillPercent >= 80 ? 'bg-amber-400' : 'bg-blue-400'}`}
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="flex justify-end">
                  {!isFull ? (
                    <BookClassDialog
                      occurrenceId={occ.id}
                      serviceId={service.id}
                      title={service.title}
                      startPtText={startPtText}
                      priceCents={priceCents}
                      coachName={coachName}
                      onSuccess={handleBookingSuccess}
                    />
                  ) : (
                    <button disabled className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-400 font-medium cursor-not-allowed">
                      Full
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
