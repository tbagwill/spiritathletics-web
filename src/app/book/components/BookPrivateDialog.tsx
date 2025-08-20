'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export type PrivateSelection =
  | { kind: 'SOLO'; duration: 30 }
  | { kind: 'SOLO'; duration: 45 }
  | { kind: 'SOLO'; duration: 60 }
  | { kind: 'SEMI_PRIVATE'; duration: 60 };



type Props = {
  coachId: string;
  serviceId: string;
  selection: PrivateSelection;
  startUTC: string;
  endUTC: string;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh availability and show toast
};

type FormValues = {
  customerName: string;
  customerEmail: string;
  athleteName: string;
};

export default function BookPrivateDialog({ coachId, serviceId, selection, startUTC, endUTC, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {


      const res = await fetch('/api/book/private', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          serviceId,
          startDateTimeUTC: startUTC,
          endDateTimeUTC: endUTC,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          athleteName: values.athleteName,
          selection,

        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Booking failed');
      
      // Close modal and trigger success callback
      onClose();
      reset();
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-4 sm:p-6 z-10 max-h-[85vh] overflow-y-auto text-gray-900">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Book Private Lesson</h3>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Your Name *</label>
            <input type="text" {...register('customerName', { required: true })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Email *</label>
            <input type="email" {...register('customerEmail', { required: true })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Athlete First Name *</label>
            <input type="text" {...register('athleteName', { required: true })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50" />
          </div>


          

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-800">Close</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', opacity: submitting ? 0.8 : 1 }}>
              {submitting ? 'Submitting…' : 'Confirm'}
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-3">You can cancel up to 4 hours before start time using the link in your confirmation email.</p>
        </form>
      </div>
    </div>
  );
} 