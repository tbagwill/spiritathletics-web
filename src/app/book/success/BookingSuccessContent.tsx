'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BookingSuccessContent() {
  const params = useSearchParams();
  const type = params.get('type');
  const payment = params.get('payment');

  const isClinic = type === 'clinic';
  const isCash = payment === 'cash';

  return (
    <div className="w-full max-w-lg">
      {/* Success Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Top Banner */}
        <div
          className="px-8 pt-10 pb-8 text-center"
          style={{
            background: isCash
              ? 'linear-gradient(135deg, #16a34a, #15803d)'
              : isClinic
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : 'linear-gradient(135deg, #1d4ed8, #1e40af)',
          }}
        >
          {/* Checkmark circle */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isClinic ? "You're Registered!" : 'Booking Confirmed!'}
          </h1>
          <p className="text-white/80 text-base">
            {isCash ? 'Registration complete — pay cash on-site' : 'Payment processed successfully'}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-6">
          {/* Cash payment reminder */}
          {isCash && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">Don&apos;t forget to bring cash!</h3>
                  <p className="text-amber-800 text-sm mt-1">
                    You selected the cash payment option. Please bring the exact amount in cash when you arrive.
                    If you do not bring cash, the full card price will apply.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What happens next */}
          <div className="bg-slate-50 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">What happens next</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Confirmation email sent</p>
                  <p className="text-xs text-gray-500">Check your inbox — you&apos;ll get a detailed confirmation with all the info you need{!isClinic ? ' and a calendar invite' : ''}.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Arrive 5-10 minutes early</p>
                  <p className="text-xs text-gray-500">Spirit Athletics — 17537 Bear Valley Rd, Hesperia, CA 92345</p>
                </div>
              </li>
              {isCash && (
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Bring cash to pay on-site</p>
                    <p className="text-xs text-gray-500">Have the cash amount ready when you check in. If you don&apos;t have cash, the full card price will be charged.</p>
                  </div>
                </li>
              )}
              {!isClinic && !isCash && (
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Need to cancel?</p>
                    <p className="text-xs text-gray-500">Use the cancellation link in your email — available up to 4 hours before start time.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/book/classes"
              className="w-full text-center py-3 px-6 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 shadow-md"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
            >
              Browse More Classes
            </Link>
            <Link
              href="/"
              className="w-full text-center py-3 px-6 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Help text */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Questions?{' '}
        <a href="mailto:info@spiritathletics.net" className="text-blue-600 hover:underline font-medium">
          Contact us
        </a>{' '}
        and we&apos;ll be happy to help.
      </p>
    </div>
  );
}
