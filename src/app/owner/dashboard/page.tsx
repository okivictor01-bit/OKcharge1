'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';
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

  // Handover state
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('manual');
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const handoverScannerInstance = useRef<any>(null);

  // Return state
  const [returnInputMode, setReturnInputMode] = useState<'camera' | 'manual'>('manual');
  const [returnScanning, setReturnScanning] = useState(false);
  const [returnCode, setReturnCode] = useState('');
  const [returnManualCode, setReturnManualCode] = useState('');
  const [returning, setReturning] = useState(false);
  const [returnMessage, setReturnMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const returnScannerInstance = useRef<any>(null);

  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);

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

      // If this owner has no location assigned yet, send them to the pending screen instead
      const { data: myLocation } = await supabase
        .from('locations')
        .select('id')
        .eq('owner_id', data.session.user.id)
        .maybeSingle();

      if (!myLocation) {
        router.push('/owner/pending');
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
      const scanner = new Html5QrcodeScanner('qr-reader-handover', { fps: 10, qrbox: 250 }, false);
      handoverScannerInstance.current = scanner;

      scanner.render(
        (decodedText: string) => {
          setScannedCode(decodedText);
          setScanning(false);
          scanner.clear().catch(() => {});
        },
        () => {}
      );
    });

    return () => {
      cancelled = true;
      handoverScannerInstance.current?.clear().catch(() => {});
    };
  }, [scanning]);

  useEffect(() => {
    if (!returnScanning) return;
    let cancelled = false;

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (cancelled) return;
      const scanner = new Html5QrcodeScanner('qr-reader-return', { fps: 10, qrbox: 250 }, false);
      returnScannerInstance.current = scanner;

      scanner.render(
        (decodedText: string) => {
          setReturnCode(decodedText);
          setReturnScanning(false);
          scanner.clear().catch(() => {});
        },
        () => {}
      );
    });

    return () => {
      cancelled = true;
      returnScannerInstance.current?.clear().catch(() => {});
    };
  }, [returnScanning]);

  function handleUseManualCode() {
    if (!manualCode.trim()) return;
    setScannedCode(manualCode.trim());
    setManualCode('');
  }

  function handleResetPowerbankCode() {
    setScannedCode('');
    setManualCode('');
  }

  function handleUseReturnManualCode() {
    if (!returnManualCode.trim()) return;
    setReturnCode(returnManualCode.trim());
    setReturnManualCode('');
  }

  function handleResetReturnCode() {
    setReturnCode('');
    setReturnManualCode('');
  }

  async function handleSubmitHandover() {
    setMessage(null);
    if (!scannedCode) {
      setMessage({ type: 'error', text: 'Enter or scan a powerbank code first.' });
      return;
    }
    if (!ticketCode.trim()) {
      setMessage({ type: 'error', text: "Enter the customer's ticket code." });
      return;
    }

    setSubmitting(true);
    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('handover', {
      body: {
        powerbank_qr_code: scannedCode,
        ticket_code: ticketCode.trim(),
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setSubmitting(false);

    if (error) {
      setMessage({ type: 'error', text: await parseFunctionError(error) });
      return;
    }
    if (data?.error) {
      setMessage({ type: 'error', text: data.error });
      return;
    }

    setMessage({ type: 'success', text: 'Powerbank handed over successfully!' });
    setScannedCode('');
    setTicketCode('');
    loadActiveRentals();
  }

  async function handleProcessReturn() {
    setReturnMessage(null);
    if (!returnCode.trim()) {
      setReturnMessage({ type: 'error', text: 'Enter or scan the powerbank code first.' });
      return;
    }

    setReturning(true);
    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('process-return', {
      body: { powerbank_qr_code: returnCode.trim() },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setReturning(false);

    if (error) {
      setReturnMessage({ type: 'error', text: await parseFunctionError(error) });
      return;
    }
    if (data?.error) {
      setReturnMessage({ type: 'error', text: data.error });
      return;
    }

    if (data.late_fee > 0) {
      const chargeNote = data.charge_succeeded
        ? `Late fee of ₦${data.late_fee} charged successfully.`
        : `Late fee of ₦${data.late_fee} could NOT be charged — customer account suspended with outstanding debt.`;
      setReturnMessage({ type: data.charge_succeeded ? 'success' : 'error', text: `Return processed. ${chargeNote}` });
    } else {
      setReturnMessage({ type: 'success', text: 'Return processed on time — no late fee.' });
    }

    setReturnCode('');
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

        {!scannedCode && (
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
            <button
              onClick={() => { setInputMode('camera'); setScanning(false); }}
              className={`flex-1 py-2 text-sm font-bold ${inputMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
            >
              Scan QR
            </button>
            <button
              onClick={() => { setInputMode('manual'); setScanning(false); }}
              className={`flex-1 py-2 text-sm font-bold ${inputMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
            >
              Type Code
            </button>
          </div>
        )}

        {!scannedCode && inputMode === 'camera' && !scanning && (
          <button onClick={() => setScanning(true)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">
            Start Camera Scan
          </button>
        )}

        {!scannedCode && inputMode === 'camera' && scanning && <div id="qr-reader-handover" className="w-full" />}

        {!scannedCode && inputMode === 'manual' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Powerbank Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PB-TEST-001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none text-lg"
              />
              <button onClick={handleUseManualCode} className="px-4 bg-gray-800 text-white font-bold rounded-xl">
                Use
              </button>
            </div>
          </div>
        )}

        {scannedCode && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-sm text-green-700 font-semibold break-all">Powerbank: {scannedCode}</p>
            <button onClick={handleResetPowerbankCode} className="text-xs text-gray-400 hover:text-gray-600 ml-2 shrink-0">
              Change
            </button>
          </div>
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

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-700">Process Return</h2>

        {!returnCode && (
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
            <button
              onClick={() => { setReturnInputMode('camera'); setReturnScanning(false); }}
              className={`flex-1 py-2 text-sm font-bold ${returnInputMode === 'camera' ? 'bg-orange-600 text-white' : 'bg-white text-gray-500'}`}
            >
              Scan QR
            </button>
            <button
              onClick={() => { setReturnInputMode('manual'); setReturnScanning(false); }}
              className={`flex-1 py-2 text-sm font-bold ${returnInputMode === 'manual' ? 'bg-orange-600 text-white' : 'bg-white text-gray-500'}`}
            >
              Type Code
            </button>
          </div>
        )}

        {!returnCode && returnInputMode === 'camera' && !returnScanning && (
          <button onClick={() => setReturnScanning(true)} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl">
            Start Camera Scan
          </button>
        )}

        {!returnCode && returnInputMode === 'camera' && returnScanning && <div id="qr-reader-return" className="w-full" />}

        {!returnCode && returnInputMode === 'manual' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Powerbank Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PB-TEST-001"
                value={returnManualCode}
                onChange={(e) => setReturnManualCode(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-600 outline-none text-lg"
              />
              <button onClick={handleUseReturnManualCode} className="px-4 bg-gray-800 text-white font-bold rounded-xl">
                Use
              </button>
            </div>
          </div>
        )}

        {returnCode && (
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <p className="text-sm text-orange-700 font-semibold break-all">Powerbank: {returnCode}</p>
            <button onClick={handleResetReturnCode} className="text-xs text-gray-400 hover:text-gray-600 ml-2 shrink-0">
              Change
            </button>
          </div>
        )}

        <button
          onClick={handleProcessReturn}
          disabled={returning}
          className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {returning ? 'Processing…' : 'Mark as Returned'}
        </button>

        {returnMessage && (
          <p className={`text-sm text-center font-medium ${returnMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {returnMessage.text}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-700">Active Rentals</h2>
        {activeRentals.length === 0 && <p className="text-sm text-gray-400">No active rentals right now.</p>}
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
