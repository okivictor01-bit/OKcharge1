'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';

interface Account {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  location_name: string | null;
}

function toE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [phone, setPhone] = useState('');
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [account, setAccount] = useState<Account | null>(null);

  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);

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
    return supabase.functions.invoke('admin-reset-password', {
      body,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async function handleLookup() {
    setLookupError('');
    setAccount(null);
    setTempPassword('');
    setResetError('');
    setCopied(false);
    if (!phone.trim()) {
      setLookupError('Enter a phone number.');
      return;
    }

    setLooking(true);
    const { data, error } = await callFunction({ action: 'lookup', phone: toE164(phone.trim()) });
    setLooking(false);

    if (error) {
      setLookupError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setLookupError(data.error);
      return;
    }
    setAccount(data.account);
  }

  async function handleReset() {
    if (!account) return;
    setResetError('');

    const ok = window.confirm(
      `Reset the password for ${account.name || account.phone}? Their current password will stop working immediately.`
    );
    if (!ok) return;

    setResetting(true);
    const { data, error } = await callFunction({ action: 'reset', user_id: account.id });
    setResetting(false);

    if (error) {
      setResetError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setResetError(data.error);
      return;
    }
    setTempPassword(data.temp_password);
  }

  function handleCopy() {
    navigator.clipboard.writeText(tempPassword).then(() => setCopied(true));
  }

  const whatsappUrl = account
    ? `https://wa.me/${account.phone.replace('+', '')}?text=${encodeURIComponent(
        `Your OKcharge temporary password is: ${tempPassword}. Please log in and change it right away from your dashboard.`
      )}`
    : '';

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
        <h1 className="text-2xl font-extrabold text-gray-800">Reset Password</h1>
        <p className="text-gray-500 text-sm">For partners or customers who forgot their password.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-700">1. Find the account</h2>
        <input
          type="tel"
          placeholder="e.g. 08012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
        />
        <button
          onClick={handleLookup}
          disabled={looking}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {looking ? 'Searching…' : 'Look Up'}
        </button>
        {lookupError && <p className="text-sm text-red-600 font-medium">{lookupError}</p>}
      </div>

      {account && (
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="font-bold text-gray-700">2. Confirm who you're talking to</h2>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-1">
            <p className="font-bold text-gray-800">{account.name || 'No name on file'}</p>
            <p className="text-sm text-gray-500">{account.phone}</p>
            <p className="text-xs font-bold text-gray-500 uppercase">{account.role}</p>
            {account.location_name && (
              <p className="text-sm text-gray-600">Location: {account.location_name}</p>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Ask the person for their full name and location, and check they match before resetting.
          </p>

          {!tempPassword && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {resetting ? 'Resetting…' : 'Generate Temporary Password'}
            </button>
          )}
          {resetError && <p className="text-sm text-red-600 font-medium">{resetError}</p>}

          {tempPassword && (
            <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4 space-y-3 text-center">
              <p className="text-xs font-bold text-green-700 uppercase">Temporary Password</p>
              <p className="text-3xl font-extrabold tracking-widest text-green-700 break-all">{tempPassword}</p>
              <p className="text-xs text-green-700">Shown only once. Send it to the person now.</p>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl">
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl text-center">Send via WhatsApp</a>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
