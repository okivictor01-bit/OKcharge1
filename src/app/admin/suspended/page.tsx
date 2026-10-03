'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';

interface SuspendedAccount {
  id: string;
  phone: string;
  name: string | null;
  outstanding_debt: number;
  has_card_on_file: boolean;
  debt_retry_count: number;
  last_debt_retry_at: string | null;
  retries_exhausted: boolean;
}

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_INTERVAL_DAYS = 30;

export default function SuspendedAccountsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [accounts, setAccounts] = useState<SuspendedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  async function loadAccounts() {
    setLoading(true);
    setError('');

    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error: invokeError } = await supabase.functions.invoke('admin-suspended', {
      body: { action: 'list' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setLoading(false);

    if (invokeError) {
      setError(await parseFunctionError(invokeError));
      return;
    }
    if (data?.error) {
      setError(data.error);
      return;
    }
    setAccounts(data.accounts);
  }

  useEffect(() => {
    if (!checkingAuth) loadAccounts();
  }, [checkingAuth]);

  function formatNaira(n: number): string {
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
  }

  function nextRetryText(account: SuspendedAccount): string {
    if (account.retries_exhausted) return 'Retries exhausted';
    if (!account.has_card_on_file) return 'No card on file — cannot retry';
    if (!account.last_debt_retry_at) return 'Due on next daily run';

    const nextRetry = new Date(account.last_debt_retry_at);
    nextRetry.setDate(nextRetry.getDate() + RETRY_INTERVAL_DAYS);
    const daysLeft = Math.ceil((nextRetry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) return 'Due on next daily run';
    return `Next retry in ${daysLeft}d`;
  }

  const totalOutstanding = accounts.reduce((sum, a) => sum + Number(a.outstanding_debt || 0), 0);

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <a href="/admin/dashboard" className="text-sm text-blue-600 font-bold">&larr; Back to Dashboard</a>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-gray-800">Suspended Accounts</h1>
        <p className="text-gray-500 text-sm">Outstanding debt &amp; automatic retry status</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-red-700">Total Outstanding</p>
          <p className="text-2xl font-extrabold text-red-700">{formatNaira(totalOutstanding)}</p>
        </div>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-gray-600">Suspended Accounts</p>
          <p className="text-2xl font-extrabold text-gray-800">{accounts.length}</p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400 text-center">Loading…</p>}
      {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}

      {!loading && accounts.length === 0 && !error && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
          <p className="text-green-700 font-bold">✓ No suspended accounts right now.</p>
        </div>
      )}

      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl shadow-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{a.name || 'No name provided'}</p>
                <p className="text-xs text-gray-500">{a.phone}</p>
              </div>
              <p className="text-xl font-extrabold text-red-600">{formatNaira(a.outstanding_debt)}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">
                  Retry {a.debt_retry_count} / {MAX_RETRY_ATTEMPTS}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: MAX_RETRY_ATTEMPTS }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < a.debt_retry_count ? 'bg-red-400' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  a.retries_exhausted
                    ? 'bg-gray-100 text-gray-500'
                    : !a.has_card_on_file
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {nextRetryText(a)}
              </span>
            </div>

            {a.last_debt_retry_at && (
              <p className="text-xs text-gray-400">
                Last attempt: {new Date(a.last_debt_retry_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
