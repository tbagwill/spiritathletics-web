'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.ok) {
        router.push('/dashboard');
      } else if (res?.error) {
        setError('Invalid email or password');
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
    <div className="min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 border border-blue-100 text-gray-900">
        <h1 className="text-2xl font-bold mb-4">Coach Login</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50" required />
          </div>
          <div className="flex items-center justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', opacity: loading ? 0.8 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 