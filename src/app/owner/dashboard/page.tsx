'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface ActiveRental {
  id: string;
  duration_hours: number;
  start_time: string;
  expected_return_time: string;
  powerbank_id: string;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);
  const scannerInstance = useRef<any>(null);

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

      setUser(data.session.user);
      setCheckingAuth(false);
    });
  }, [router]);

  async function loadActiveRentals() {
    const { data } = await supabase
      .from('rentals')
      .select('id, duration_hours, start_time, expected_return_time, powerbank_id')
      .eq('status', 'active')
      .order('expected_return_time', { ascending: true });
    if (data) setActiveRentals(data);
  }

  useEffect(() => {
    if (!checkingAuth) loadActiveRentals();
  }, [checkingAuth]);

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (cancelled) return;
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
      scannerInstance.current = scanner;

      scanner.render(
        (decodedText: string) => {
          setScannedCode(decodedText);
          setScanning(false);
          scanner.clear().catch(() => {});
        },
        () => {
          // ignore per-frame scan misses
        }
      );
    });

    return () => {
      cancelled = true;
      scannerInstance.current?.clear().catch(() => {});
    };
  }, [scanning]);

  async function handleSubmitHandover() {
    setMessage(null);
    if (!scannedCode) {
      setMessage({ type: 'error', text: 'Scan a powerbank QR code first.' });
      return;
    }
    if (!ticketCode.trim()) {
      setMessage({ type: 'error', text: "Enter the customer's ticket code." });
      return;
    }

    setSubmitting(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('handover', {
      body: {
        powerbank_qr_code: scannedCode,
        ticket_code: ticketCode.trim(),
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setSubmitting(false);

    if (error || data?.error) {
      setMessage({ type: 'error', text: data?.error || error?.message || 'Handover failed.' });
      return;
    }

    setMessage({ type: 'success', text: 'Powerbank handed over successfully!' });
    setScannedCode('');
    setTicketCode('');
    loadActiveRentals();
  }

  function formatCountdown(expectedReturn: string): string {
    const diffMs = new Date(expectedReturn).getTime() - Date.now();
    if (diffMs <= 0) return 'Overdue';
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m left`;
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
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-blue-600">OKcharge Partner</h1>
        <p className="text-gray-500 text-sm">Logged in as {user?.phone}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-700">Hand Over Powerbank</h2>

        {!scanning && !scannedCode && (
          <button
            onClick={() => setScanning(true)}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
          >
            Scan Powerbank QR
          </button>
        )}

        {scanning && <div id="qr-reader" className="w-full" />}

        {scannedCode && (
          <p className="text-sm text-green-600 font-semibold break-all">
            Scanned: {scannedCode}
          </p>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Customer Ticket Code</label>
          <input
            type="text"
            placeholder="e.g. AB12CD"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none text-lg tracking-widest text-center"
          />
        </div>

        <button
          onClick={handleSubmitHandover}
          disabled={submitting}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {submitting ? 'Processing…' : 'Confirm Handover'}
        </button>

        {message && (
          <p className={`text-sm text-center font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-700">Active Rentals</h2>
        {activeRentals.length === 0 && (
          <p className="text-sm text-gray-400">No active rentals right now.</p>
        )}
        {activeRentals.map((r) => (
          <div key={r.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">{r.duration_hours}h rental</span>
            <span className="text-sm font-bold text-blue-600">{formatCountdown(r.expected_return_time)}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
