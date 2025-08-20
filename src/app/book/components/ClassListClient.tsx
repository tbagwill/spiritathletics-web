'use client';

import { useState } from 'react';
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
      basePriceCents: number;
      coach: {
        user: {
          name: string | null;
        };
      } | null;
    };
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
    showToast('Class reservation confirmed! Check your email for details.', 'success');
  };

  if (occurrences.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm font-medium text-gray-900">No classes scheduled in the next 2 weeks.</p>
        <p className="text-xs text-gray-500 mt-1">Please check back soon or book a private lesson.</p>
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

      {/* Class Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {occurrences.map((occ) => {
          const service = occ.classTemplate.service;
          const coachName = service.coach?.user?.name ?? null;
          const remaining = occ.capacity - occ.bookings.length;
          const startPtText = formatPt(new Date(occ.startDateTimeUTC), "EEE, MMM d • h:mm a 'PT'");
          const priceCents = service.basePriceCents;
          
          return (
            <div key={occ.id} className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                {coachName && <span className="text-sm text-gray-800">Coach: {coachName}</span>}
              </div>
              <p className="text-sm text-gray-900 mb-2">{startPtText}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-blue-700">
                  {remaining > 0 ? `${remaining} spots left` : 'Full'}
                </span>
                <span className="text-sm text-gray-800">${(priceCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-end">
                {remaining > 0 ? (
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
                  <button className="px-4 py-2 rounded-lg border text-gray-600" disabled>
                    Full
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
