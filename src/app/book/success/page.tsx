import { Suspense } from 'react';
import BookingSuccessContent from './BookingSuccessContent';

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-16 font-sans">
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
