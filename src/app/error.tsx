'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>If this problem persists, please contact:</p>
          <a
            href="mailto:support@spiritathletics.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            support@spiritathletics.com
          </a>
        </div>
      </div>
    </div>
  );
}
