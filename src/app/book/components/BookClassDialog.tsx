'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CARD_FEE_CENTS } from '@/lib/pricing';

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
};

type PaymentMethod = 'CARD' | 'CASH';

export default function BookClassDialog({ occurrenceId, serviceId, title, startPtText, priceCents, coachName, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [athleteNames, setAthleteNames] = useState<string[]>(['']);

  useEffect(() => {
    if (!open) { setError(null); setPaymentMethod('CARD'); setAthleteNames(['']); }
  }, [open]);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const numAthletes = athleteNames.length;
  const baseTotalCents = priceCents * numAthletes;
  const cardTotalCents = baseTotalCents + CARD_FEE_CENTS;
  const cashTotalCents = baseTotalCents;
  const displayTotal = paymentMethod === 'CASH' ? cashTotalCents : cardTotalCents;

  const perAthleteText = `$${(priceCents / 100).toFixed(2)}`;
  const cardTotalText = `$${(cardTotalCents / 100).toFixed(2)}`;
  const cashTotalText = `$${(cashTotalCents / 100).toFixed(2)}`;
  const feeText = `$${(CARD_FEE_CENTS / 100).toFixed(2)}`;

  const addAthlete = () => setAthleteNames([...athleteNames, '']);
  const removeAthlete = (i: number) => {
    if (numAthletes > 1) setAthleteNames(athleteNames.filter((_, idx) => idx !== i));
  };
  const updateAthlete = (i: number, value: string) => {
    const updated = [...athleteNames];
    updated[i] = value;
    setAthleteNames(updated);
  };

  const allAthletesValid = athleteNames.every((n) => n.trim().length > 0);

  const onSubmit = async (values: FormValues) => {
    if (!allAthletesValid) { setError('Please enter a name for each athlete.'); return; }
    setSubmitting(true);
    setError(null);
    const trimmedNames = athleteNames.map((n) => n.trim());
    try {
      if (paymentMethod === 'CASH') {
        const res = await fetch('/api/book/class', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classOccurrenceId: occurrenceId,
            serviceId,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteNames: trimmedNames,
            paymentMethod: 'CASH',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Booking failed');
        window.location.href = `/book/success?payment=cash`;
      } else {
        const res = await fetch('/api/book/class/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classOccurrenceId: occurrenceId,
            serviceId,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteNames: trimmedNames,
          }),
        });

        if (res.status === 503) {
          const fallback = await fetch('/api/book/class', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              classOccurrenceId: occurrenceId,
              serviceId,
              customerName: values.customerName,
              customerEmail: values.customerEmail,
              athleteNames: trimmedNames,
            }),
          });
          const fallbackData = await fallback.json();
          if (!fallback.ok || !fallbackData.ok) throw new Error(fallbackData.error || 'Booking failed');
          setOpen(false);
          reset();
          if (onSuccess) onSuccess();
          return;
        }

        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Could not start checkout');
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-md"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
        onClick={() => setOpen(true)}
      >
        Reserve Spot
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto text-gray-900">
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-xl font-bold text-gray-900">Reserve Your Spot</h3>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors ml-2 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500">{title}{coachName ? ` · Coach ${coachName}` : ''}</p>
              <p className="text-sm text-gray-500">{startPtText}</p>
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

              {/* Athlete Names */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Athlete{numAthletes > 1 ? 's' : ''} *
                  </label>
                  <button
                    type="button"
                    onClick={addAthlete}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                    Add Athlete
                  </button>
                </div>
                <div className="space-y-2">
                  {athleteNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => updateAthlete(i, e.target.value)}
                        placeholder={`Athlete ${i + 1} first name`}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                      {numAthletes > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAthlete(i)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === 'CARD'
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'CARD' && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <svg className={`w-6 h-6 ${paymentMethod === 'CARD' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className={`text-sm font-semibold ${paymentMethod === 'CARD' ? 'text-blue-700' : 'text-gray-700'}`}>Pay Online</span>
                    <span className={`text-xs ${paymentMethod === 'CARD' ? 'text-blue-500' : 'text-gray-400'}`}>
                      + {feeText} processing
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === 'CASH'
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'CASH' && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <svg className={`w-6 h-6 ${paymentMethod === 'CASH' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className={`text-sm font-semibold ${paymentMethod === 'CASH' ? 'text-green-700' : 'text-gray-700'}`}>Pay Cash</span>
                    <span className={`text-xs ${paymentMethod === 'CASH' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                      No extra fee
                    </span>
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className={`rounded-xl p-4 border ${paymentMethod === 'CASH' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className={paymentMethod === 'CASH' ? 'text-green-800' : 'text-blue-800'}>
                      {numAthletes > 1 ? `${numAthletes} athletes × ${perAthleteText}` : title}
                    </span>
                    <span className={`font-semibold ${paymentMethod === 'CASH' ? 'text-green-800' : 'text-blue-800'}`}>
                      {numAthletes > 1 ? `$${(baseTotalCents / 100).toFixed(2)}` : perAthleteText}
                    </span>
                  </div>
                  {paymentMethod === 'CARD' && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-600">Card processing fee</span>
                      <span className="text-blue-600">{feeText}</span>
                    </div>
                  )}
                  <div className="border-t border-current/10 pt-1.5 flex justify-between items-center">
                    <span className={`text-sm font-semibold ${paymentMethod === 'CASH' ? 'text-green-900' : 'text-blue-900'}`}>Total</span>
                    <span className={`text-lg font-bold ${paymentMethod === 'CASH' ? 'text-green-700' : 'text-blue-900'}`}>
                      ${(displayTotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash payment warning */}
              {paymentMethod === 'CASH' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-800">Remember to bring cash!</p>
                      <p className="text-amber-700 mt-0.5">
                        Please bring <strong>{cashTotalText} cash</strong> to pay when you arrive. If you do not bring cash, the full card price of <strong>{cardTotalText}</strong> will apply.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment notice */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {paymentMethod === 'CASH' ? (
                  <>
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You&apos;ll be registered immediately and pay cash on-site</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>You&apos;ll be securely redirected to Stripe to complete payment</span>
                  </>
                )}
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
                  disabled={submitting || !allAthletesValid}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                  style={{
                    background: paymentMethod === 'CASH'
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                  }}
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
                      {paymentMethod === 'CASH' ? 'Reserve' : 'Pay'} — ${(displayTotal / 100).toFixed(2)}
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
      )}
    </>
  );
}
