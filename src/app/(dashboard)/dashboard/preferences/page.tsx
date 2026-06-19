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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [additionalEmail, setAdditionalEmail] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword.length < 8) {
      setPwMessage({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/dashboard/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPwMessage({ text: 'Password updated successfully.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMessage({ text: data.error || 'Failed to update password.', type: 'error' });
      }
    } catch {
      setPwMessage({ text: 'Failed to update password.', type: 'error' });
    } finally {
      setPwSaving(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dashboard/preferences', { cache: 'no-store' });
        let data: { ok?: boolean; settings?: Settings; error?: string } | null = null;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          data = await res.json();
        } else {
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Hero header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-800">
        <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-50" />
        <div aria-hidden className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-10 sm:px-6 sm:pb-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-50 ring-1 ring-inset ring-white/20 backdrop-blur">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Account
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">Preferences</h1>
              <p className="mt-2 max-w-lg text-sm text-blue-100/90 sm:text-base">Configure your notifications, booking approval, and account security.</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative mx-auto -mt-10 max-w-4xl px-4 pb-20 sm:-mt-12 sm:px-6">
        {/* Account Settings */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-soft-lg ring-1 ring-slate-200">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H5a2 2 0 01-2-2V9a2 2 0 012-2h5m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Account Settings</h2>
              <p className="text-sm text-slate-500">Manage your coaching preferences and notifications</p>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            ) : settings ? (
              <form onSubmit={onSave} className="space-y-6">
                {/* Booking Approval */}
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <h3 className="font-semibold text-slate-900">Booking Approval</h3>
                    </div>
                    <p className="text-sm text-slate-700">Require manual approval for private lesson bookings</p>
                    <p className="mt-0.5 text-xs text-slate-500">When enabled, private lesson requests stay pending until you approve them.</p>
                  </div>
                  <Toggle checked={settings.mustApproveRequests} onChange={(v) => setSettings({ ...settings, mustApproveRequests: v })} />
                </div>

                {/* Additional Email */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <h3 className="font-semibold text-slate-900">Additional Alert Email</h3>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">Send booking notifications to an additional email address.</p>
                  <input
                    type="email"
                    value={additionalEmail}
                    onChange={(e) => setAdditionalEmail(e.target.value)}
                    placeholder="assistant@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                {/* Email Notifications */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H5a2 2 0 01-2-2V9a2 2 0 012-2h5m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6" /></svg>
                    <h3 className="font-semibold text-slate-900">Email Notifications</h3>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">Choose which notifications you&apos;d like to receive.</p>

                  <div className="space-y-2.5">
                    {[
                      { key: 'emailBookingConfirmed' as const, dot: 'bg-emerald-500', title: 'Booking Confirmed', desc: 'When a new booking is confirmed' },
                      { key: 'emailBookingCancelled' as const, dot: 'bg-red-500', title: 'Booking Cancelled', desc: 'When a booking is cancelled' },
                      { key: 'dailyAgendaEmail' as const, dot: 'bg-blue-500', title: 'Daily Agenda', desc: "Morning summary of your day's schedule" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-3">
                          <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                          <div>
                            <div className="font-medium text-slate-900">{item.title}</div>
                            <div className="text-sm text-slate-500">{item.desc}</div>
                          </div>
                        </div>
                        <Toggle checked={settings[item.key]} onChange={(v) => setSettings({ ...settings, [item.key]: v })} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-soft transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-soft-lg disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving…
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </section>

        {/* Change Password */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">Update the password you use to sign in</p>
            </div>
          </div>
          <div className="p-6">
            {pwMessage && (
              <div
                className={`mb-5 rounded-2xl p-4 text-sm font-medium ${
                  pwMessage.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {pwMessage.text}
              </div>
            )}
            <form onSubmit={onChangePassword} className="max-w-md space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-soft transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-soft-lg disabled:opacity-70"
                >
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
