import Link from 'next/link';
import { Suspense } from 'react';
import BookingSuccessContent from './BookingSuccessContent';

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600">Loading your confirmation…</p>
          </div>
        }
      >
        <BookingSuccessContent />
      </Suspense>
    </div>
  );
}
