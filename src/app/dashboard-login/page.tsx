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

  // Define animation styles inline
  const animationStyles = `
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes drift1 {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(100px, -80px); }
      50% { transform: translate(150px, 60px); }
      75% { transform: translate(-50px, 100px); }
    }
    @keyframes drift2 {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(-120px, 90px); }
      50% { transform: translate(80px, -70px); }
      75% { transform: translate(60px, 120px); }
    }
    @keyframes drift3 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(-100px, -80px) scale(1.3); }
      66% { transform: translate(90px, 100px) scale(0.8); }
    }
    @keyframes float1 {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      33% { transform: translateY(-60px) translateX(40px); }
      66% { transform: translateY(40px) translateX(-30px); }
    }
    @keyframes float2 {
      0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
      50% { transform: translateY(-80px) translateX(-60px) rotate(180deg); }
    }
    @keyframes waveMove {
      0% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(-100px) translateY(-50px); }
      100% { transform: translateX(0) translateY(0); }
    }
    @keyframes pulseOpacity {
      0%, 100% { opacity: 0.1; }
      50% { opacity: 0.2; }
    }
    .bg-animated { 
      animation: gradientMove 10s ease infinite; 
      background-size: 400% 400%; 
    }
    .orb-1 { animation: drift1 15s ease-in-out infinite; }
    .orb-2 { animation: drift2 18s ease-in-out infinite; }
    .orb-3 { animation: drift3 20s ease-in-out infinite; }
    .orb-4 { animation: float1 12s ease-in-out infinite; }
    .orb-5 { animation: float2 16s ease-in-out infinite; }
    .orb-6 { animation: waveMove 14s ease-in-out infinite; }
    .grid-pulse { animation: pulseOpacity 4s ease-in-out infinite; }
  `;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.ok) {
        router.push('/dashboard');
        router.refresh();
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
    <>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <div className="min-h-screen px-4 py-12 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          {/* Animated Gradient Base */}
          <div className="absolute inset-0 bg-animated" style={{ 
            background: 'linear-gradient(135deg, #0000FE 0%, #4169E1 20%, #1e40af 40%, #000064 60%, #1e3a8a 80%, #000000 100%)',
          }}></div>
          
          {/* Large Visible Drifting Orbs with less blur */}
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-2xl orb-1" style={{ backgroundColor: 'rgba(65,105,225,0.6)' }}></div>
          <div className="absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl orb-2" style={{ backgroundColor: 'rgba(100,149,237,0.5)' }}></div>
          <div className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full blur-2xl orb-3" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}></div>
          <div className="absolute bottom-40 right-1/3 w-60 h-60 rounded-full blur-2xl orb-4" style={{ backgroundColor: 'rgba(30,144,255,0.4)' }}></div>
          
          {/* Additional Floating Elements */}
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full blur-xl orb-5" style={{ backgroundColor: 'rgba(135,206,250,0.35)' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-56 h-56 rounded-full blur-2xl orb-6" style={{ backgroundColor: 'rgba(70,130,180,0.4)' }}></div>
          
          {/* Grid Pattern Overlay with Pulse */}
          <div className="absolute inset-0 grid-pulse" style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-blue-100 text-gray-900 animate-fade-in-up">
            <h1 className="text-2xl font-bold mb-6">Coach Login</h1>
            {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50 transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/50 transition-all" 
                  required 
                />
              </div>
              <div className="flex items-center justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed" 
                  style={{ background: 'linear-gradient(135deg, #0000FE, #1e40af)' }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 