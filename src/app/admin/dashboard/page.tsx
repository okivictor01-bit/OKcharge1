'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Location {
  id: string;
  name: string;
  address: string | null;
  location_qr_code: string;
  is_active: boolean;
  owner_id: string | null;
  users: { phone: string; name: string | null } | null;
}

function toE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOwnerPhone, setFormOwnerPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) {
        router.push('/admin/login');
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
        router.push('/admin/login');
        return;
      }

      setUser(data.session.user);
      setRole(profile.role as 'admin' | 'staff');
      setCheckingAuth(false);
    });
  }, [router]);

  async function loadLocations() {
    setLoadingLocations(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('admin-locations', {
      body: { action: 'list' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setLoadingLocations(false);
    if (!error && data?.locations) setLocations(data.locations);
  }

  useEffect(() => {
    if (!checkingAuth) loadLocations();
  }, [checkingAuth]);

  function openCreateForm() {
    setEditingId(null);
    setFormName('');
    setFormAddress('');
    setFormOwnerPhone('');
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(loc: Location) {
    setEditingId(loc.id);
    setFormName(loc.name);
    setFormAddress(loc.address || '');
    setFormOwnerPhone(loc.users?.phone || '');
    setFormError('');
    setShowForm(true);
  }

  async function handleSave() {
    setFormError('');
    if (!formName.trim()) {
      setFormError('Location name is required.');
      return;
    }
    if (!formOwnerPhone.trim()) {
      setFormError('Owner phone number is required.');
      return;
    }

    setSaving(true);

    // Refresh the session first, so a stale token never silently causes a 401
    const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    if (sessionError || !accessToken) {
      setSaving(false);
      setFormError('Your session expired. Please log in again.');
      router.push('/admin/login');
      return;
    }

    const normalizedPhone = toE164(formOwnerPhone.trim());

    const body = editingId
      ? { action: 'update', location_id: editingId, name: formName, address: formAddress, owner_phone: normalizedPhone }
      : { action: 'create', name: formName, address: formAddress, owner_phone: normalizedPhone };

    const { data, error } = await supabase.functions.invoke('admin-locations', {
      body,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setSaving(false);

    if (error || data?.error) {
      setFormError(data?.error || error?.message || 'Save failed.');
      return;
    }

    setShowForm(false);
    loadLocations();
  }

  async function toggleActive(loc: Location) {
    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    await supabase.functions.invoke('admin-locations', {
      body: { action: 'update', location_id: loc.id, is_active: !loc.is_active },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    loadLocations();
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">OKcharge Admin</h1>
        <p className="text-gray-500 text-sm">
          Logged in as {user?.phone} ({role})
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-700">Locations</h2>
          <button
            onClick={openCreateForm}
            className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-xl"
          >
            + New Location
          </button>
        </div>

        {loadingLocations && <p className="text-sm text-gray-400">Loading locations…</p>}

        {!loadingLocations && locations.length === 0 && (
          <p className="text-sm text-gray-400">No locations yet.</p>
        )}

        <div className="space-y-3">
          {locations.map((loc) => (
            <div key={loc.id} className="border border-gray-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800">{loc.name}</p>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    loc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {loc.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {loc.address && <p className="text-sm text-gray-500">{loc.address}</p>}
              <p className="text-xs text-gray-400">Code: {loc.location_qr_code}</p>
              <p className="text-xs text-gray-400">
                Owner: {loc.users?.phone || 'Unassigned'}
              </p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => openEditForm(loc)} className="text-sm text-blue-600 font-bold">
                  Edit
                </button>
                <button onClick={() => toggleActive(loc)} className="text-sm text-orange-600 font-bold">
                  {loc.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-gray-800">
              {editingId ? 'Edit Location' : 'New Location'}
            </h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Owner Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 08012345678"
                value={formOwnerPhone}
                onChange={(e) => setFormOwnerPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                The owner must already have an OKcharge account (signed up via the customer login page).
              </p>
            </div>

            {formError && <p className="text-sm text-red-600 font-medium">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
