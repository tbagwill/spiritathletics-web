'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CancelledPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'blocked' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing cancellation token.');
      return;
    }
    const run = async () => {
      setStatus('loading');
      try {
        const res = await fetch(`/cancel?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.ok) {
          setStatus('success');
          setMessage('Your booking has been cancelled.');
        } else if (data?.message?.includes('4 hours')) {
          setStatus('blocked');
          setMessage('Cancellations must be at least 4 hours before start. Please call the front desk.');
        } else if (data?.message?.includes('Already')) {
          setStatus('already');
          setMessage('This booking was already cancelled.');
        } else {
          setStatus('error');
          setMessage(data?.error || data?.message || 'Cancellation failed.');
        }
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Cancellation failed.');
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 border border-blue-100">
        <h1 className="text-2xl font-bold mb-2">Cancellation</h1>
        {status === 'loading' && (
          <p className="text-gray-700">Processing your cancellation…</p>
        )}
        {status !== 'loading' && (
          <p className={status === 'success' ? 'text-green-700' : status === 'blocked' ? 'text-yellow-700' : 'text-red-700'}>
            {message}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Link href="/book/classes" className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}>
            Back to Classes
          </Link>
          <Link href="/book/privates" className="inline-flex items-center px-4 py-2 rounded-lg border text-sm font-semibold">
            Back to Private Lessons
          </Link>
        </div>
      </div>
    </div>
  );
} 