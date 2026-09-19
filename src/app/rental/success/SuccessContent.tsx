'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

interface Ticket {
  ticket_code: string;
  duration_hours: number;
  initial_payment: number;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchTicket() {
      const { data } = await supabase
        .from('pending_tickets')
        .select('ticket_code, duration_hours, initial_payment')
        .eq('paystack_reference', reference)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setTicket(data);
        setLoading(false);
      } else if (attempt < 6) {
        setTimeout(() => setAttempt((a) => a + 1), 1500);
      } else {
        setLoading(false);
      }
    }
    fetchTicket();
    return () => { cancelled = true; };
  }, [reference, attempt]);

  if (!reference) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center max-w-md mx-auto text-center">
        <p className="text-gray-500">No payment reference found.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <p className="text-gray-500">Confirming your payment…</p>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-red-600 mb-2">Still Processing</h1>
          <p className="text-gray-500 text-sm">
            Your payment was received but we're still confirming it. Please refresh in a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-green-600">Payment Successful</h1>
        <p className="text-gray-500">Show this code to the Location Owner to collect your powerbank.</p>
        <div className="bg-blue-50 border-2 border-blue-600 rounded-xl py-6">
          <p className="text-5xl font-extrabold tracking-widest text-blue-600">{ticket.ticket_code}</p>
        </div>
        <p className="text-sm text-gray-500">{ticket.duration_hours} hour rental — ₦{ticket.initial_payment}</p>
      </div>
    </main>
  );
}
