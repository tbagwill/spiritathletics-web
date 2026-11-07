'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';
import { IconTile } from '@/components/site/blocks';
import { Button } from '@/components/ui/Button';
import { Field, FormAlert, Input, PasswordInput } from '@/components/ui/Field';

export default function DashboardLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else if (res?.error) {
        setError('That email and password don’t match. Try again.');
      } else {
        setError('An error occurred during sign in');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-ink px-4 py-16 font-sans">
      <HeroBackdrop />
      <div className="w-full max-w-sm motion-safe:animate-rise">
        <div className="text-center text-white">
          <IconTile icon={LayoutDashboard} tone="glass" size="lg" className="mx-auto" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Coach login</h1>
          <p className="mt-1 text-sm text-white/60">Sign in to the Spirit Athletics dashboard.</p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-8 grid gap-4 rounded-[28px] bg-white p-6 text-slate-900 shadow-2xl sm:p-7"
        >
          <Field label="Email">
            {(id) => (
              <Input
                id={id}
                type="email"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            )}
          </Field>
          <Field label="Password">
            {(id) => (
              <PasswordInput
                id={id}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>

          {error ? <FormAlert>{error}</FormAlert> : null}

          <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <p className="text-center text-xs text-slate-500">Forgot your password? Ask an admin to send you a reset link.</p>
        </form>
      </div>
    </div>
  );
}
