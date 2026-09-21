'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';

interface LocationDetail {
  id: string;
  name: string;
  location_qr_code: string;
  paystack_subaccount_code: string | null;
  users: { phone: string; name: string | null } | null;
}

interface Bank {
  name: string;
  code: string;
}

export default function PayoutsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location_id');

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const [businessName, setBusinessName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [resolvedName, setResolvedName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) {
        router.push('/admin/login');
        return;
      }
      const { data: profile } = await supabase
        .from('users').select('role').eq('id', data.session.user.id).single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
        router.push('/admin/login');
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  async function callFunction(body: Record<string, unknown>) {
    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;
    return supabase.functions.invoke('admin-payouts', {
      body,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async function loadLocation() {
    if (!locationId) return;
    setLoading(true);
    setLoadError('');

    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('admin-locations', {
      body: { action: 'get', location_id: locationId },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setLoading(false);

    if (error || data?.error) {
      setLoadError(error ? await parseFunctionError(error) : data.error);
      return;
    }

    setLocation(data.location);
    setBusinessName(data.location.name);
  }

  async function loadBanks() {
    setLoadingBanks(true);
    const { data, error } = await callFunction({ action: 'list_banks' });
    setLoadingBanks(false);
    if (!error && data?.banks) setBanks(data.banks);
  }

  useEffect(() => {
    if (!checkingAuth) {
      loadLocation();
      loadBanks();
    }
  }, [checkingAuth, locationId]);

  async function handleVerify() {
    setVerifyError('');
    setResolvedName('');
    setSaveSuccess('');
    if (!bankCode || !accountNumber.trim()) {
      setVerifyError('Select a bank and enter the account number.');
      return;
    }

    setVerifying(true);
    const { data, error } = await callFunction({
      action: 'resolve_account',
      bank_code: bankCode,
      account_number: accountNumber.trim(),
    });
    setVerifying(false);

    if (error) {
      setVerifyError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setVerifyError(data.error);
      return;
    }
    setResolvedName(data.account_name);
  }

  async function handleSave() {
    setSaveError('');
    setSaveSuccess('');
    if (!resolvedName) {
      setSaveError('Please verify the account first.');
      return;
    }
    if (!businessName.trim()) {
      setSaveError('Business/payout name is required.');
      return;
    }

    setSaving(true);
    const { data, error } = await callFunction({
      action: 'create',
      location_id: locationId,
      business_name: businessName.trim(),
      bank_code: bankCode,
      account_number: accountNumber.trim(),
    });
    setSaving(false);

    if (error) {
      setSaveError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setSaveError(data.error);
      return;
    }

    setSaveSuccess('Payout account saved! Future rentals at this location will now split automatically.');
    setResolvedName('');
    setAccountNumber('');
    loadLocation();
  }

  if (!locationId) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center p-6">
        <p className="text-gray-500">No location selected.</p>
      </main>
    );
  }

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  if (loadError || !location) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center p-6">
        <p className="text-red-600 font-medium">{loadError || 'Location not found.'}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-gray-800">{location.name}</h1>
        <p className="text-sm text-gray-500">Payout Account Setup</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-2">
        <p className="text-sm text-gray-600">
          Owner: <span className="font-bold">{location.users?.phone || 'Unassigned'}</span>
        </p>
        {location.paystack_subaccount_code ? (
          <p className="text-sm text-green-600 font-bold">
            ✓ Payout account active ({location.paystack_subaccount_code})
          </p>
        ) : (
          <p className="text-sm text-orange-600 font-bold">
            ⚠ No payout account set up — all payments currently go 100% to the main account.
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-700">
          {location.paystack_subaccount_code ? 'Update Payout Account' : 'Set Up Payout Account'}
        </h2>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Business / Payout Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Bank</label>
          {loadingBanks ? (
            <p className="text-sm text-gray-400">Loading bank list…</p>
          ) : (
            <select
              value={bankCode}
              onChange={(e) => { setBankCode(e.target.value); setResolvedName(''); }}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none bg-white"
            >
              <option value="">Select a bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Account Number</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="10-digit NUBAN"
            value={accountNumber}
            onChange={(e) => { setAccountNumber(e.target.value); setResolvedName(''); }}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {verifying ? 'Verifying…' : 'Verify Account'}
        </button>

        {verifyError && <p className="text-sm text-red-600 font-medium">{verifyError}</p>}

        {resolvedName && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-xs text-green-700 font-bold">Account Name</p>
            <p className="text-lg font-bold text-green-800">{resolvedName}</p>
            <p className="text-xs text-green-600 mt-1">Confirm this matches the Owner before saving.</p>
          </div>
        )}

        {resolvedName && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Confirm & Save Payout Account'}
          </button>
        )}

        {saveError && <p className="text-sm text-red-600 font-medium">{saveError}</p>}
        {saveSuccess && <p className="text-sm text-green-600 font-medium">{saveSuccess}</p>}
      </div>
    </main>
  );
}
