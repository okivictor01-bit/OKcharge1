'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';

interface Ticket {
  ticket_code: string;
  duration_hours: number;
  initial_payment: number;
  used: boolean;
  paystack_reference?: string;
  created_at?: string;
  locations: { name: string } | null;
}

export default function RecoverTicketPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundTickets, setFoundTickets] = useState<Ticket[] | null>(null);

  const [reference, setReference] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoverError, setRecoverError] = useState('');
  const [recoveredTicket, setRecoveredTicket] = useState<Ticket | null>(null);
  const [alreadyExisted, setAlreadyExisted] = useState(false);

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
    return supabase.functions.invoke('admin-recover-ticket', {
      body,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async function handleSearchByPhone() {
    setSearchError('');
    setFoundTickets(null);
    if (!phone.trim()) {
      setSearchError('Enter a phone number.');
      return;
    }

    setSearching(true);
    const { data, error } = await callFunction({ action: 'lookup_by_phone', phone: phone.trim() });
    setSearching(false);

    if (error) {
      setSearchError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setSearchError(data.error);
      return;
    }
    setFoundTickets(data.tickets);
  }

  async function handleRecoverByReference() {
    setRecoverError('');
    setRecoveredTicket(null);
    if (!reference.trim()) {
      setRecoverError('Enter the Paystack transaction reference.');
      return;
    }

    setRecovering(true);
    const { data, error } = await callFunction({ action: 'recover_by_reference', reference: reference.trim() });
    setRecovering(false);

    if (error) {
      setRecoverError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setRecoverError(data.error);
      return;
    }
    setRecoveredTicket(data.ticket);
    setAlreadyExisted(data.already_existed);
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
        <h1 className="text-2xl font-extrabold text-gray-800">Recover Ticket</h1>
        <p className="text-gray-500 text-sm">For customers who paid but never saw their ticket code.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-700">1. Look Up by Phone Number</h2>
        <p className="text-xs text-gray-400">
          Most of the time, the ticket already exists — the customer just never saw the success screen.
        </p>
        <div>
          <input
            type="tel"
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
          />
        </div>
        <button
          onClick={handleSearchByPhone}
          disabled={searching}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
        {searchError && <p className="text-sm text-red-600 font-medium">{searchError}</p>}

        {foundTickets && foundTickets.length === 0 && (
          <p className="text-sm text-gray-400">No tickets found for this customer.</p>
        )}

        {foundTickets && foundTickets.map((t) => (
          <div key={t.ticket_code} className={`border-2 rounded-xl p-4 ${t.used ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50'}`}>
            <p className={`text-2xl font-extrabold tracking-widest ${t.used ? 'text-gray-400' : 'text-green-700'}`}>
              {t.ticket_code}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.locations?.name || 'Unknown location'} · {t.duration_hours}h · ₦{t.initial_payment}
            </p>
            <p className="text-xs font-bold mt-1">
              {t.used ? 'Already used' : 'Not yet used — valid for handover'}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-700">2. Recover by Paystack Reference</h2>
        <p className="text-xs text-gray-400">
          Only use this if step 1 found nothing, but the payment shows as successful in Paystack. This re-verifies the payment directly with Paystack and creates the missing ticket.
        </p>
        <div>
          <input
            type="text"
            placeholder="e.g. T543443667740843"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
          />
        </div>
        <button
          onClick={handleRecoverByReference}
          disabled={recovering}
          className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {recovering ? 'Verifying with Paystack…' : 'Verify & Recover Ticket'}
        </button>
        {recoverError && <p className="text-sm text-red-600 font-medium">{recoverError}</p>}

        {recoveredTicket && (
          <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
            {alreadyExisted && (
              <p className="text-xs text-orange-600 font-bold mb-1">A ticket already existed for this reference:</p>
            )}
            <p className="text-2xl font-extrabold tracking-widest text-green-700">
              {recoveredTicket.ticket_code}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {recoveredTicket.locations?.name || 'Unknown location'} · {recoveredTicket.duration_hours}h · ₦{recoveredTicket.initial_payment}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
