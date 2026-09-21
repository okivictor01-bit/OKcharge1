'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';

interface RentalRow {
  id: string;
  start_time: string;
  status: string;
  duration_hours: number;
  initial_payment: number;
  late_fee: number;
  theft_penalty: number;
  location_name: string;
}

interface FinancialsData {
  range: { from: string; to: string };
  rental_count: number;
  total_initial_payments: number;
  total_late_fees: number;
  total_theft_penalties: number;
  estimated_owner_payout: number;
  estimated_platform_earnings: number;
  rentals: RentalRow[];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function FinancialsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [data, setData] = useState<FinancialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      // Financial Analytics is Admin-only — Staff is redirected away, matching the server-side check
      if (!profile || profile.role !== 'admin') {
        router.push('/admin/dashboard');
        return;
      }

      setCheckingAuth(false);
    });
  }, [router]);

  async function loadFinancials() {
    setLoading(true);
    setError('');

    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const { data: result, error: invokeError } = await supabase.functions.invoke('admin-financials', {
      body: { date_from: dateFrom, date_to: dateTo },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setLoading(false);

    if (invokeError) {
      setError(await parseFunctionError(invokeError));
      return;
    }
    if (result?.error) {
      setError(result.error);
      return;
    }

    setData(result);
  }

  useEffect(() => {
    if (!checkingAuth) loadFinancials();
  }, [checkingAuth]);

  function setToday() {
    const t = todayISO();
    setDateFrom(t);
    setDateTo(t);
  }

  function setLast7Days() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  }

  function formatNaira(n: number): string {
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
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
        <h1 className="text-3xl font-extrabold text-gray-800">Financial Analytics</h1>
        <p className="text-gray-500 text-sm">Admin only</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex gap-2">
          <button onClick={setToday} className="text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg">
            Today
          </button>
          <button onClick={setLast7Days} className="text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg">
            Last 7 Days
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 outline-none text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 outline-none text-sm"
            />
          </div>
        </div>

        <button
          onClick={loadFinancials}
          disabled={loading}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Apply Filter'}
        </button>

        {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-green-700">Platform Earnings</p>
              <p className="text-2xl font-extrabold text-green-700">
                {formatNaira(data.estimated_platform_earnings)}
              </p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-700">Owner Payouts</p>
              <p className="text-2xl font-extrabold text-blue-700">
                {formatNaira(data.estimated_owner_payout)}
              </p>
            </div>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-600">Total Rentals</p>
              <p className="text-2xl font-extrabold text-gray-800">{data.rental_count}</p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-orange-700">Late/Theft Fees</p>
              <p className="text-2xl font-extrabold text-orange-700">
                {formatNaira(data.total_late_fees + data.total_theft_penalties)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
            <h2 className="font-bold text-gray-700">
              Rentals ({data.range.from} to {data.range.to})
            </h2>

            {data.rentals.length === 0 && (
              <p className="text-sm text-gray-400">No rentals in this date range.</p>
            )}

            {data.rentals.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">{r.location_name}</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      r.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : r.status === 'stolen'
                        ? 'bg-red-100 text-red-700'
                        : r.status === 'overdue'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>{new Date(r.start_time).toLocaleString()}</span>
                  <span>
                    {formatNaira(r.initial_payment)}
                    {r.late_fee > 0 && ` + ${formatNaira(r.late_fee)} late`}
                    {r.theft_penalty > 0 && ` + ${formatNaira(r.theft_penalty)} theft`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
