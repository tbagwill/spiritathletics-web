'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Field, FormAlert, Input, PasswordInput, Textarea } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { FormGroup, MoreOptions, Sheet } from '@/components/ui/Sheet';
import { Switch } from '@/components/ui/Switch';

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

      {/* Add/Edit coach */}
      <Sheet
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="lg"
        eyebrow={editingId ? 'Edit coach' : 'New coach'}
        title={form.name.trim() || (editingId ? 'Coach' : 'Add a coach')}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="coach-form" loading={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add coach'}
            </Button>
          </div>
        }
      >
        <form id="coach-form" onSubmit={submit} noValidate className="grid gap-8">
          {error ? <FormAlert>{error}</FormAlert> : null}

          {!editingId ? (
            <FormAlert tone="info">
              New coaches start with the default password <strong>SpiritCoach123!</strong> and can change it in
              Preferences after logging in.
            </FormAlert>
          ) : null}

          <FormGroup title="Account">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                {(id) => (
                  <Input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                )}
              </Field>
              <Field label="Email" hint="Used to log in.">
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                )}
              </Field>
              <Field label="Role" className="sm:col-span-2">
                {(id) => (
                  <Select
                    id={id}
                    value={form.role}
                    onValueChange={(role) => setForm({ ...form, role })}
                    options={[
                      { value: 'COACH', label: 'Coach', description: 'Day-to-day coaching tools' },
                      { value: 'ADMIN', label: 'Admin', description: 'Coaching tools, plus managing coaches and events' },
                    ]}
                  />
                )}
              </Field>
            </div>
          </FormGroup>

          <FormGroup title="Profile" description="Shown to families when they pick a coach.">
            <Field label="Specialties" hint="Separate with commas, e.g. Tumbling, Stunting." optional>
              {(id) => (
                <Input
                  id={id}
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                />
              )}
            </Field>
            <Field label="Bio" optional>
              {(id) => (
                <Textarea
                  id={id}
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              )}
            </Field>
          </FormGroup>

          <FormGroup title="Permissions">
            <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
              <Switch
                checked={form.canManageShop}
                onChange={(checked) => setForm({ ...form, canManageShop: checked })}
                label="Can manage the shop"
                description="Campaigns, products and orders."
              />
              {editingId ? (
                <Switch
                  checked={form.isActive}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                  label="Active"
                  description="Turn off to block their login and hide them from booking."
                />
              ) : null}
            </div>
          </FormGroup>

          {editingId ? (
            <MoreOptions label="Reset their password">
              <Field label="New password" hint="Leave blank to keep their current password.">
                {(id) => (
                  <PasswordInput
                    id={id}
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  />
                )}
              </Field>
            </MoreOptions>
          ) : null}
        </form>
      </Sheet>
    </div>
  );
}
