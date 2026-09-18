'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

// Converts a local Nigerian number (e.g. 08012345678) to E.164 format (+2348012345678)
function toE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location');

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendOtp() {
    setError('');
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid phone number.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: toE164(phone),
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep('otp');
  }

  async function verifyOtp() {
    setError('');
    if (otp.length < 4) {
      setError('Enter the code sent to your phone.');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: toE164(phone),
      token: otp,
      type: 'sms',
    });

    if (error || !data.user) {
      setLoading(false);
      setError(error?.message || 'Verification failed. Try again.');
      return;
    }

    // Ensure a matching row exists in our own `users` table.
    // id here MUST equal the Supabase Auth user id for RLS to work.
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        { id: data.user.id, phone: toE164(phone) },
        { onConflict: 'id', ignoreDuplicates: false }
      );

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    // Send the customer back to the rental page, preserving the location they scanned
    const redirectUrl = locationId ? `/?location=${locationId}` : '/';
    router.push(redirectUrl);
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2">OKcharge</h1>
          <p className="text-gray-500 font-medium">
            {step === 'phone' ? 'Verify your phone to continue' : 'Enter the code we sent you'}
          </p>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-blue-600 outline-none text-lg"
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Code'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-blue-600 outline-none text-lg tracking-widest text-center"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Wrong number? Go back
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 text-center font-medium">{error}</p>
        )}
      </div>
    </main>
  );
}
