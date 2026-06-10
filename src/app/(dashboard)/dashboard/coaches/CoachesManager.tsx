'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Coach = {
  id: string;
  name: string | null;
  email: string;
  role: 'COACH' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  hasProfile: boolean;
  bio: string | null;
  specialties: string[];
  canManageShop: boolean;
};

type FormState = {
  name: string;
  email: string;
  role: 'COACH' | 'ADMIN';
  bio: string;
  specialties: string;
  canManageShop: boolean;
  isActive: boolean;
  newPassword: string;
};

const emptyForm: FormState = {
  name: '',
  email: '',
  role: 'COACH',
  bio: '',
  specialties: '',
  canManageShop: false,
  isActive: true,
  newPassword: '',
};

export default function CoachesManager({ currentUserId }: { currentUserId: string }) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/coaches', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.ok) setCoaches(data.coaches);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Coach) => {
    setEditingId(c.id);
    setForm({
      name: c.name ?? '',
      email: c.email,
      role: c.role,
      bio: c.bio ?? '',
      specialties: c.specialties.join(', '),
      canManageShop: c.canManageShop,
      isActive: c.isActive,
      newPassword: '',
    });
    setError(null);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSaving(true);
    const specialties = form.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      let res: Response;
      if (editingId) {
        const body: Record<string, unknown> = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          bio: form.bio.trim() || null,
          specialties,
          canManageShop: form.canManageShop,
          isActive: form.isActive,
        };
        if (form.newPassword) body.newPassword = form.newPassword;
        res = await fetch(`/api/dashboard/coaches/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/dashboard/coaches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            bio: form.bio.trim() || null,
            specialties,
            canManageShop: form.canManageShop,
          }),
        });
      }
      const data = await res.json();
      if (res.ok && data.ok) {
        setModalOpen(false);
        await load();
        showToast(editingId ? 'Coach updated.' : 'Coach added. Default password: SpiritCoach123!', 'success');
      } else {
        setError(data.error || 'Failed to save.');
      }
    } catch {
      setError('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (c: Coach) => {
    if (!confirm(`Deactivate ${c.name || c.email}? They will no longer be able to log in. Their history is preserved.`)) return;
    const res = await fetch(`/api/dashboard/coaches/${c.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.ok) {
      await load();
      showToast('Coach deactivated.', 'success');
    } else {
      showToast(data.error || 'Failed to deactivate.', 'error');
    }
  };

  const reactivate = async (c: Coach) => {
    const res = await fetch(`/api/dashboard/coaches/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      await load();
      showToast('Coach reactivated.', 'success');
    } else {
      showToast(data.error || 'Failed to reactivate.', 'error');
    }
  };

  const sendReset = async (c: Coach) => {
    const res = await fetch(`/api/dashboard/coaches/${c.id}/send-reset`, { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.ok) {
      showToast(`Password reset email sent to ${c.email}.`, 'success');
    } else {
      showToast(data.error || 'Failed to send reset email.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coach Management</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Add, edit, and manage dashboard accounts</p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-3">
              <button
                onClick={openAdd}
                className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Coach
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Dashboard Accounts</h2>
            <p className="text-sm text-gray-600">Coaches and admins who can sign in</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading…</div>
          ) : coaches.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No accounts yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {coaches.map((c) => (
                <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{c.name || '(no name)'}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.role === 'ADMIN' ? 'Admin' : 'Coach'}
                        </span>
                        {c.canManageShop && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Shop
                          </span>
                        )}
                        {!c.isActive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            Deactivated
                          </span>
                        )}
                        {c.id === currentUserId && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{c.email}</p>
                      {c.specialties.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{c.specialties.join(' • ')}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openEdit(c)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => sendReset(c)}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-sm hover:bg-blue-50 transition-colors"
                      >
                        Send reset
                      </button>
                      {c.isActive ? (
                        <button
                          onClick={() => deactivate(c)}
                          disabled={c.id === currentUserId}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivate(c)}
                          className="px-3 py-1.5 rounded-lg border border-green-200 text-green-700 text-sm hover:bg-green-50 transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Coach' : 'Add New Coach'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] text-gray-900">
              <form onSubmit={submit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm font-medium">{error}</div>
                )}

                {!editingId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                    New coaches start with the default password <strong>SpiritCoach123!</strong> — they can change it in Preferences after logging in.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                      placeholder="Coach name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                      placeholder="coach@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as 'COACH' | 'ADMIN' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white"
                    >
                      <option value="COACH">Coach</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Specialties (comma-separated)</label>
                    <input
                      value={form.specialties}
                      onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                      placeholder="Tumbling, Stunting"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                      placeholder="Short bio (optional)"
                    />
                  </div>
                  {editingId && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Set New Password (optional)</label>
                      <input
                        type="text"
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.canManageShop}
                      onChange={(e) => setForm({ ...form, canManageShop: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Can manage shop
                  </label>
                  {editingId && (
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Active
                    </label>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-70"
                  >
                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Coach'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
