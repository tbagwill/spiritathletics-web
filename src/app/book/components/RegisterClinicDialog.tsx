'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  clinicId: string;
  clinicTitle: string;
  clinicWhen: string;
  priceCents: number;
  spotsLeft: number;
};

type FormValues = {
  customerName: string;
  customerEmail: string;
  athleteFirstName: string;
};

export default function RegisterClinicDialog({ clinicId, clinicTitle, clinicWhen, priceCents, spotsLeft }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const priceText = `$${(priceCents / 100).toFixed(2)}`;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/clinics/register/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          athleteFirstName: values.athleteFirstName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Registration failed');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  if (spotsLeft <= 0) {
    return (
      <button disabled className="w-full py-3 px-6 rounded-xl font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">
        Sold Out
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(null); reset(); }}
        className="w-full py-3 px-6 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 shadow-md"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
      >
        Register Now — {priceText}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto text-gray-900">
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mb-2 inline-block">Clinic Registration</span>
                  <h3 className="text-xl font-bold text-gray-900">{clinicTitle}</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors ml-2 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500">{clinicWhen}</p>
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
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Your Name (Parent / Guardian) *</label>
                <input
                  type="text"
                  {...register('customerName', { required: true })}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Email *</label>
                <input
                  type="email"
                  {...register('customerEmail', { required: true })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Athlete First Name *</label>
                <input
                  type="text"
                  {...register('athleteFirstName', { required: true })}
                  placeholder="Athlete's first name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-800">Clinic registration</span>
                  <span className="text-lg font-bold text-purple-900">{priceText}</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>
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
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
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
                      Register — {priceText}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">Your athlete's first name will be listed publicly as a registered participant.</p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
