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
  priceCents?: number;
  onClose: () => void;
  onSuccess?: (requiresApproval?: boolean) => void;
};

type FormValues = {
  customerName: string;
  customerEmail: string;
  athleteName: string;
};

const PRICE_MAP: Record<string, Record<number, number>> = {
  SOLO: { 30: 4000, 45: 5000, 60: 6000 },
  SEMI_PRIVATE: { 60: 7000 },
};

export default function BookPrivateDialog({ coachId, serviceId, selection, startUTC, endUTC, priceCents, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const price = priceCents ?? PRICE_MAP[selection.kind]?.[selection.duration] ?? 0;
  const priceText = `$${(price / 100).toFixed(2)}`;
  const kindLabel = selection.kind === 'SEMI_PRIVATE'
    ? 'Semi-Private (2 athletes · 60 min)'
    : `Solo · ${selection.duration} min`;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      // Try Stripe Checkout first
      const res = await fetch('/api/book/private/checkout', {
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

      if (res.status === 503) {
        // Stripe not configured — fall back to free booking
        const fallback = await fetch('/api/book/private', {
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
        const fallbackData = await fallback.json();
        if (!fallback.ok || !fallbackData.ok) throw new Error(fallbackData.error || 'Booking failed');
        onClose();
        reset();
        if (onSuccess) onSuccess(fallbackData.requiresApproval);
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not start checkout');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto text-gray-900">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-xl font-bold text-gray-900">Book Private Lesson</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-2 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500">{kindLabel}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 mb-4 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Your Name *</label>
            <input
              type="text"
              {...register('customerName', { required: true })}
              placeholder="Parent / Guardian name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Email *</label>
            <input
              type="email"
              {...register('customerEmail', { required: true })}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Athlete First Name *</label>
            <input
              type="text"
              {...register('athleteName', { required: true })}
              placeholder="Athlete's first name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Price Summary */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Private Lesson · {kindLabel}</span>
              <span className="text-lg font-bold text-blue-900">{priceText}</span>
            </div>
          </div>

          {/* Stripe notice */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>You'll be securely redirected to Stripe to complete payment</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  Pay {priceText}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">You can cancel up to 4 hours before start time using the link in your confirmation email.</p>
        </form>
      </div>
    </div>
  );
}
