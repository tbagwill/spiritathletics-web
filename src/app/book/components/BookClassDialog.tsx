'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';



type Props = {
  occurrenceId: string;
  serviceId: string;
  title: string;
  startPtText: string;
  priceCents: number;
  coachName?: string | null;
  onSuccess?: () => void;
};

type FormValues = {
  customerName: string;
  customerEmail: string;
  athleteName: string;
};

export default function BookClassDialog({ occurrenceId, serviceId, title, startPtText, priceCents, coachName, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setError(null);
    }
  }, [open]);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {


      const res = await fetch('/api/book/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classOccurrenceId: occurrenceId,
          serviceId,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          athleteName: values.athleteName,

        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Booking failed');
      
      // Close popup and trigger success callback
      setOpen(false);
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

  const priceText = `$${(priceCents / 100).toFixed(2)}`;

  return (
    <>
      <button
        className="text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
        onClick={() => setOpen(true)}
      >
        Reserve Spot
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-4 sm:p-6 z-10 max-h-[85vh] overflow-y-auto text-gray-900">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reserve: {title}</h3>
              <p className="text-sm text-gray-800">{startPtText} • {priceText}{coachName ? ` • Coach: ${coachName}` : ''}</p>
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
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border text-gray-800">Close</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', opacity: submitting ? 0.8 : 1 }}>
                  {submitting ? 'Submitting…' : 'Confirm'}
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-3">You can cancel up to 4 hours before start time using the link in your confirmation email.</p>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 