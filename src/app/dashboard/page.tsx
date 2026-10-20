'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Profile {
  name: string | null;
  phone: string;
  address: string | null;
  is_suspended: boolean;
  outstanding_debt: number;
}

interface UnusedTicket {
  ticket_code: string;
  duration_hours: number;
  initial_payment: number;
  created_at: string;
  locations: { name: string } | null;
}

interface ActiveRental {
  id: string;
  duration_hours: number;
  start_time: string;
  expected_return_time: string;
  status: string;
  late_fee: number;
}

interface PastRental {
  id: string;
  start_time: string;
  status: string;
  duration_hours: number;
  initial_payment: number;
  late_fee: number;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<UnusedTicket[]>([]);
  const [activeRental, setActiveRental] = useState<ActiveRental | null>(null);
  const [pastRentals, setPastRentals] = useState<PastRental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.push('/login?redirect=/dashboard');
        return;
      }
      setUser(data.session.user);
      setCheckingAuth(false);
    });
  }, [router]);

  async function loadAll(userId: string, silent = false) {
    if (!silent) setLoading(true);

    const { data: profileData } = await supabase
      .from('users')
      .select('name, phone, address, is_suspended, outstanding_debt')
      .eq('id', userId)
      .single();
    setProfile(profileData || null);

    // Paid for, but not yet handed over by the location owner.
    const { data: ticketData } = await supabase
      .from('pending_tickets')
      .select('ticket_code, duration_hours, initial_payment, created_at, locations(name)')
      .eq('customer_id', userId)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(5);
    setTickets((ticketData as unknown as UnusedTicket[]) || []);

    const { data: activeData } = await supabase
      .from('rentals')
      .select('id, duration_hours, start_time, expected_return_time, status, late_fee')
      .in('status', ['active', 'overdue'])
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    setActiveRental(activeData || null);

    const { data: historyData } = await supabase
      .from('rentals')
      .select('id, start_time, status, duration_hours, initial_payment, late_fee')
      .order('start_time', { ascending: false })
      .limit(15);
    setPastRentals(historyData || []);

    if (!silent) setLoading(false);
  }

  useEffect(() => {
    if (!checkingAuth && user) loadAll(user.id);
  }, [checkingAuth, user]);

  // While the page is open, quietly refresh every 20 seconds so the ticket turns
  // into an active rental as soon as the owner confirms the handover.
  useEffect(() => {
    if (checkingAuth || !user) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') loadAll(user.id, true);
    }, 20000);
    return () => clearInterval(id);
  }, [checkingAuth, user]);

  function formatCountdown(expectedReturn: string, status: string, lateFee: number): { text: string; isOverdue: boolean } {
    const diffMs = new Date(expectedReturn).getTime() - Date.now();
    if (diffMs <= 0 || status === 'overdue') {
      return { text: `Overdue — ₦${lateFee} owed`, isOverdue: true };
    }
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hrs}h ${mins}m remaining`, isOverdue: false };
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-blue-600">My Account</h1>
        {profile?.name && <p className="text-gray-700 font-medium mt-1">{profile.name}</p>}
        <p className="text-gray-500 text-sm">{profile?.phone}</p>
      </div>

      {/* Ticket(s) the customer has paid for but not yet collected */}
      {tickets.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-600 rounded-2xl shadow-xl p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs font-bold text-blue-700 uppercase">
              {tickets.length === 1 ? 'Your Ticket' : `Your Tickets (${tickets.length})`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Show this code to the location owner to collect your powerbank.
            </p>
          </div>

          {tickets.map((t) => (
            <div key={t.ticket_code} className="bg-white rounded-xl p-4 text-center space-y-1">
              <p className="text-4xl font-extrabold tracking-widest text-blue-600">{t.ticket_code}</p>
              <p className="text-xs text-gray-500">
                {t.locations?.name || 'Partner location'} · {t.duration_hours}h · ₦{t.initial_payment}
              </p>
              <p className="text-xs text-gray-400">Paid {new Date(t.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Account standing */}
      {profile?.is_suspended ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-xl p-6 text-center space-y-3">
          <p className="text-red-700 font-bold">⚠ Account Suspended</p>
          <p className="text-sm text-red-600">
            You have an outstanding balance from a late return or unreturned powerbank.
          </p>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500">Amount Owed</p>
            <p className="text-3xl font-extrabold text-red-600">
              ₦{(profile?.outstanding_debt || 0).toLocaleString()}
            </p>
          </div>
          <a href="/account" className="inline-block w-full bg-red-600 text-white font-bold py-3 rounded-xl">Pay Now to Restore Account</a>
        </div>
      ) : (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-xl p-6 text-center">
          <p className="text-green-700 font-bold">✓ Account in Good Standing</p>
          <p className="text-sm text-green-600 mt-1">No outstanding balance.</p>
        </div>
      )}

      {/* Active rental, if any */}
      {activeRental && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl shadow-xl p-6 text-center space-y-1">
          <p className="text-xs font-bold text-blue-700 uppercase">Active Rental</p>
          {(() => {
            const c = formatCountdown(activeRental.expected_return_time, activeRental.status, activeRental.late_fee);
            return (
              <p className={`text-2xl font-extrabold ${c.isOverdue ? 'text-red-600' : 'text-blue-700'}`}>
                {c.text}
              </p>
            );
          })()}
          <p className="text-xs text-gray-500">{activeRental.duration_hours}h rental in progress</p>
        </div>
      )}

      {/* Profile details */}
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-2">
        <h2 className="font-bold text-gray-700 mb-1">Profile</h2>
        <p className="text-sm text-gray-600"><span className="font-bold">Name:</span> {profile?.name || 'Not set'}</p>
        <p className="text-sm text-gray-600"><span className="font-bold">Phone:</span> {profile?.phone}</p>
        <p className="text-sm text-gray-600"><span className="font-bold">Address:</span> {profile?.address || 'Not set'}</p>
      </div>

      {/* Rental history */}
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-700">Rental History</h2>
        {pastRentals.length === 0 && <p className="text-sm text-gray-400">No rentals yet.</p>}
        {pastRentals.map((r) => (
          <div key={r.id} className="flex justify-between items-center border-b border-gray-100 pb-2 text-sm">
            <div>
              <p className="font-bold text-gray-700">{r.duration_hours}h rental</p>
              <p className="text-xs text-gray-400">{new Date(r.start_time).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
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
              {r.late_fee > 0 && <p className="text-xs text-red-500 mt-1">+₦{r.late_fee} late fee</p>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleLogout} className="w-full text-sm text-gray-400 text-center">
        Log out
      </button>
    </main>
  );
}y
