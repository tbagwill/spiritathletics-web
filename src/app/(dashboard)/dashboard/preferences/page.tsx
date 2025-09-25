"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Settings = {
  mustApproveRequests: boolean;
  alertEmails: string[];
  emailBookingConfirmed: boolean;
  emailBookingCancelled: boolean;
  dailyAgendaEmail: boolean;
};

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [additionalEmail, setAdditionalEmail] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dashboard/preferences', { cache: 'no-store' });
        let data: { ok?: boolean; settings?: Settings; error?: string } | null = null;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          data = await res.json();
        } else {
          // Fallback to text to avoid JSON parse error
          const text = await res.text();
          throw new Error(text || 'Unexpected response');
        }
        if (res.ok && data?.ok && data.settings) {
          setSettings(data.settings);
          setAdditionalEmail(data.settings.alertEmails?.[0] ?? '');
        } else {
          throw new Error(data?.error || 'Failed to load preferences');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    const res = await fetch('/api/dashboard/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mustApproveRequests: settings.mustApproveRequests,
        additionalEmail: additionalEmail || null,
        emailBookingConfirmed: settings.emailBookingConfirmed,
        emailBookingCancelled: settings.emailBookingCancelled,
        dailyAgendaEmail: settings.dailyAgendaEmail,
      }),
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      setError(text || 'Failed to save preferences');
      setSaving(false);
      return;
    }
    setSaving(false);
    if (res.ok && data.ok) {
      setSettings(data.settings);
    } else {
      setError(data.error || 'Failed to save preferences');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-slide-up">
            {/* Mobile-first layout: stack vertically on small screens */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Preferences</h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Configure your account settings and notifications</p>
              </div>
              <div className="flex justify-center sm:justify-end">
                <Link href="/dashboard" className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md text-sm sm:text-base">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
            <p className="text-sm text-gray-600">Manage your coaching preferences and notifications</p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  </div>
                  <p className="text-gray-600 font-medium">Loading preferences...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            ) : settings ? (
              <form onSubmit={onSave} className="space-y-8">
                {/* Booking Approval Settings */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">Booking Approval</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">Require manual approval for private lesson bookings</p>
                      <p className="text-xs text-blue-700 font-medium">When enabled, you'll receive email notifications for approval</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.mustApproveRequests} 
                        onChange={(e)=>setSettings({ ...settings, mustApproveRequests: e.target.checked })} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Additional Email */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900">Additional Alert Email</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">Send booking notifications to an additional email address</p>
                  <input 
                    type="email"
                    value={additionalEmail} 
                    onChange={(e)=>setAdditionalEmail(e.target.value)} 
                    placeholder="assistant@example.com" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Email Notifications */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H5a2 2 0 01-2-2V9a2 2 0 012-2h5m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6" />
                    </svg>
                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-6">Choose which notifications you'd like to receive</p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-white transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">Booking Confirmed</div>
                          <div className="text-sm text-gray-600">When a new booking is confirmed</div>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.emailBookingConfirmed} 
                          onChange={(e)=>setSettings({ ...settings, emailBookingConfirmed: e.target.checked })} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-white transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">Booking Cancelled</div>
                          <div className="text-sm text-gray-600">When a booking is cancelled</div>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.emailBookingCancelled} 
                          onChange={(e)=>setSettings({ ...settings, emailBookingCancelled: e.target.checked })} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-white transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">Daily Agenda</div>
                          <div className="text-sm text-gray-600">Morning summary of your day's schedule</div>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.dailyAgendaEmail} 
                          onChange={(e)=>setSettings({ ...settings, dailyAgendaEmail: e.target.checked })} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl disabled:opacity-70"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
