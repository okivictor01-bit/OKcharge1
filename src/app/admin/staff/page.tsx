'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';

interface StaffMember {
  id: string;
  phone: string;
  name: string | null;
  role: string;
}

function toE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export default function StaffManagementPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPhone, setNewPhone] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) {
        router.push('/admin/login');
        return;
      }
      const { data: profile } = await supabase
        .from('users').select('role').eq('id', data.session.user.id).single();

      // Staff Management is Admin-only — Staff is redirected away, matching the server-side check.
      if (!profile || profile.role !== 'admin') {
        router.push('/admin/dashboard');
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  async function callFunction(body: Record<string, unknown>) {
    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;
    return supabase.functions.invoke('admin-staff', {
      body,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async function loadStaff() {
    setLoading(true);
    const { data, error } = await callFunction({ action: 'list' });
    setLoading(false);
    if (!error && data?.staff) setStaffList(data.staff);
  }

  useEffect(() => {
    if (!checkingAuth) loadStaff();
  }, [checkingAuth]);

  async function handleAddStaff() {
    setAddError('');
    setAddSuccess('');
    if (!newPhone.trim()) {
      setAddError('Enter a phone number.');
      return;
    }

    setAdding(true);
    const { data, error } = await callFunction({
      action: 'add',
      phone: toE164(newPhone.trim()),
    });
    setAdding(false);

    if (error) {
      setAddError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setAddError(data.error);
      return;
    }

    setAddSuccess('Staff account added.');
    setNewPhone('');
    loadStaff();
  }

  async function handleRemoveStaff(member: StaffMember) {
    const { error } = await callFunction({ action: 'remove', user_id: member.id });
    if (error) {
      console.error('remove staff error:', await parseFunctionError(error));
    }
    loadStaff();
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-6">
      <a href="/admin/dashboard" className="text-sm text-blue-600 font-bold">&larr; Back to Dashboard</a>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-gray-800">Staff Management</h1>
        <p className="text-gray-500 text-sm">Admin only</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-700">Add Staff Member</h2>
        <p className="text-xs text-gray-400">
          The person must already have an OKcharge account, created by signing up at the customer login page.
        </p>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="e.g. 08012345678"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
          />
        </div>

        <button
          onClick={handleAddStaff}
          disabled={adding}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add as Staff'}
        </button>

        {addError && <p className="text-sm text-red-600 font-medium">{addError}</p>}
        {addSuccess && <p className="text-sm text-green-600 font-medium">{addSuccess}</p>}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-700">Current Staff ({staffList.length})</h2>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {!loading && staffList.length === 0 && (
          <p className="text-sm text-gray-400">No staff members yet.</p>
        )}

        {staffList.map((member) => (
          <div key={member.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <p className="font-bold text-gray-800">{member.phone}</p>
              {member.name && <p className="text-xs text-gray-400">{member.name}</p>}
            </div>
            <button
              onClick={() => handleRemoveStaff(member)}
              className="text-sm text-red-600 font-bold"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
