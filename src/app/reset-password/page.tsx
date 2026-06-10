'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'done'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/reset-password?token=${encodeURIComponent(token)}`);
        setStatus(res.ok ? 'valid' : 'invalid');
      } catch {
        setStatus('invalid');
      }
    })();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus('done');
        setTimeout(() => router.push('/dashboard-login'), 2500);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-black">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-blue-100 text-gray-900">
          <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

          {status === 'checking' && (
            <p className="text-gray-600">Verifying your reset link…</p>
          )}

          {status === 'invalid' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                This password reset link is invalid or has expired. Please ask an administrator to send a new one.
              </div>
              <Link href="/dashboard-login" className="text-blue-600 font-medium hover:underline">
                Back to login
              </Link>
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
                Your password has been updated. Redirecting you to the login page…
              </div>
              <Link href="/dashboard-login" className="text-blue-600 font-medium hover:underline">
                Go to login now
              </Link>
            </div>
          )}

          {status === 'valid' && (
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50 transition-all text-gray-900"
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50 transition-all text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0000FE, #1e40af)' }}
              >
                {submitting ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
