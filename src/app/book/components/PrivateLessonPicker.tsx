'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import BookPrivateDialog from './BookPrivateDialog';

type Coach = { id: string; name: string; serviceId: string };

type Props = {
  coaches: Coach[];
};

const durations = [
  { key: 'SOLO_30', label: '30 min — $40', selection: { kind: 'SOLO' as const, duration: 30 } },
  { key: 'SOLO_45', label: '45 min — $50', selection: { kind: 'SOLO' as const, duration: 45 } },
  { key: 'SOLO_60', label: '60 min (Solo) — $60', selection: { kind: 'SOLO' as const, duration: 60 } },
  { key: 'SEMI_60', label: '60 min (Semi-Private, 2 athletes) — $35 per athlete ($70 total)', selection: { kind: 'SEMI_PRIVATE' as const, duration: 60 } },
];

export default function PrivateLessonPicker({ coaches }: Props) {
  const { register, watch } = useForm<{ coachId: string; date: string; durationKey: string }>({
    defaultValues: {
      coachId: coaches[0]?.id ?? '',
      durationKey: 'SOLO_60', // Default to 60 min Solo
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const coachId = watch('coachId');
  const durationKey = watch('durationKey');
  const date = watch('date');

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

      <div className="space-y-6 animate-fade-in">
      {/* Selection Form */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 animate-slide-up">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Your Preferences</h3>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Coach</label>
            <select 
              {...register('coachId')} 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white transition-all duration-200"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            >
              {coaches.map((c) => (
                <option key={c.id} value={c.id} className="text-gray-900 bg-white">{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Duration & Pricing</label>
            <select 
              {...register('durationKey')} 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white transition-all duration-200"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            >
              {durations.map((d) => (
                <option key={d.key} value={d.key} className="text-gray-900 bg-white">{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Date</label>
            <input 
              type="date" 
              {...register('date')} 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white transition-all duration-200"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            />
          </div>
        </div>
      </div>

      {/* Available Times */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 animate-slide-up">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Available Times</h4>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-700 font-medium">Finding available slots...</p>
              <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No available time slots for the selected date.</p>
            <p className="text-xs text-gray-500 mt-1">Try selecting a different date or coach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((s, index) => (
              <button 
                key={s.startUTC} 
                onClick={() => setSelectedSlot({ startUTC: s.startUTC, endUTC: s.endUTC })} 
                className="px-4 py-3 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 text-sm font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
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
            selection={selectedDuration.selection as any}
            startUTC={selectedSlot.startUTC}
            endUTC={selectedSlot.endUTC}
            onClose={() => setSelectedSlot(null)}
            onSuccess={() => {
              // Clear selected slot and refresh availability
              setSelectedSlot(null);
              fetchSlots();
              showToast('Private lesson booked! Check your email for details.', 'success');
            }}
          />
        </div>
      )}
      </div>
    </>
  );
} 