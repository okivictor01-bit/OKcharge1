'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function toE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export default function OwnerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup() {
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const e164Phone = toE164(phone);

    const { data, error: signUpError } = await supabase.auth.signUp({
      phone: e164Phone,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      if (signUpError?.message?.toLowerCase().includes('already registered')) {
        setError('An account with this phone number already exists. Please use Partner Login instead.');
      } else {
        setError(signUpError?.message || 'Could not create account.');
      }
      return;
    }

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        { id: data.user.id, phone: e164Phone, name: name.trim(), role: 'owner' },
        { onConflict: 'id' }
      );

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push('/owner/pending');
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2">OKcharge</h1>
          <p className="text-gray-500 font-medium">Become a Partner</p>
          <p className="text-xs text-gray-400 mt-1">
            Host OKcharge powerbanks at your location and earn 50% of every rental.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ada Obi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none text-lg"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait…' : 'Create Partner Account'}
          </button>

          <a href="/owner/login" className="block text-center text-sm text-gray-400 hover:text-gray-600">Already a partner? Log in</a>
        </div>

        {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}

        <p className="text-xs text-center text-gray-400 leading-relaxed">
          After signing up, an OKcharge Admin will set up your location and payout account.
        </p>
      </div>
    </main>
  );
}
