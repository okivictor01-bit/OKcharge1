'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

interface RentalRow {
  id: string;
  start_time: string;
  status: string;
  duration_hours: number;
  initial_payment: number;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function OwnerEarningsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [rentals, setRentals] = useState<RentalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) {
        router.push('/owner/login');
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      if (!profile || profile.role !== 'owner') {
        router.push('/owner/login');
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  async function loadHistory() {
    setLoading(true);
    setError('');

    const start = `${dateFrom}T00:00:00.000Z`;
    const end = `${dateTo}T23:59:59.999Z`;

    // RLS already restricts this to only rentals at locations this owner actually owns.
    const { data, error: queryError } = await supabase
      .from('rentals')
      .select('id, start_time, status, duration_hours, initial_payment')
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time', { ascending: false });

    setLoading(false);

    if (queryError) {
      setError(queryError.message);
      return;
    }
    setRentals(data || []);
  }

  useEffect(() => {
    if (!checkingAuth) loadHistory();
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

  function setThisMonth() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom(first.toISOString().split('T')[0]);
    setDateTo(todayISO());
  }

  function formatNaira(n: number): string {
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
  }

  const totalEarnings = rentals.reduce((sum, r) => sum + Number(r.initial_payment || 0), 0) * 0.5;

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-6">
      <a href="/owner/dashboard" className="text-sm text-blue-600 font-bold">&larr; Back to Dashboard</a>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-gray-800">My Earnings</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button onClick={setToday} className="text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg">Today</button>
          <button onClick={setLast7Days} className="text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg">Last 7 Days</button>
          <button onClick={setThisMonth} className="text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg">This Month</button>
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
          onClick={loadHistory}
          disabled={loading}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Apply Filter'}
        </button>

        {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
        <p className="text-xs font-bold text-green-700 uppercase">Earnings for this period</p>
        <p className="text-3xl font-extrabold text-green-700 mt-1">{formatNaira(totalEarnings)}</p>
        <p className="text-xs text-green-600 mt-1">{rentals.length} rentals</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-700">
          Transactions ({dateFrom} to {dateTo})
        </h2>

        {rentals.length === 0 && (
          <p className="text-sm text-gray-400">No rentals in this date range.</p>
        )}

        {rentals.map((r) => (
          <div key={r.id} className="border-b border-gray-100 pb-2 text-sm">
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">{r.duration_hours}h rental</span>
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
              <span className="font-bold text-green-600">
                +{formatNaira(Number(r.initial_payment || 0) * 0.5)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
