'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';
import { IconTile } from '@/components/site/blocks';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Field, FormAlert, PasswordInput } from '@/components/ui/Field';

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
    <div className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-ink px-4 py-16 font-sans">
      <HeroBackdrop />
      <div className="w-full max-w-sm motion-safe:animate-rise">
        <div className="text-center text-white">
          <IconTile icon={KeyRound} tone="glass" size="lg" className="mx-auto" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="mt-1 text-sm text-white/60">Choose a new password for your coach account.</p>
        </div>

        <div className="mt-8 rounded-[28px] bg-white p-6 text-slate-900 shadow-2xl sm:p-7">
          {status === 'checking' ? (
            <div className="grid gap-3" aria-label="Checking your reset link">
              <div className="skeleton h-11 rounded-xl" />
              <div className="skeleton h-11 rounded-xl" />
            </div>
          ) : null}

          {status === 'invalid' ? (
            <div className="grid gap-4">
              <FormAlert>
                This reset link is invalid or has expired. Ask an admin to send you a new one.
              </FormAlert>
              <Link href="/dashboard-login" className={buttonStyles({ variant: 'outline', className: 'w-full' })}>
                Back to login
              </Link>
            </div>
          ) : null}

          {status === 'done' ? (
            <div className="grid gap-4">
              <FormAlert tone="success">Your password is updated. Taking you to the login page…</FormAlert>
              <Link href="/dashboard-login" className={buttonStyles({ className: 'w-full' })}>
                Go to login now
              </Link>
            </div>
          ) : null}

          {status === 'valid' ? (
            <form onSubmit={onSubmit} noValidate className="grid gap-4">
              <Field label="New password" hint="At least 8 characters.">
                {(id) => (
                  <PasswordInput
                    id={id}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                )}
              </Field>
              <Field label="Confirm new password">
                {(id) => (
                  <PasswordInput
                    id={id}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                )}
              </Field>
              {error ? <FormAlert>{error}</FormAlert> : null}
              <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
                {submitting ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-ink" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
