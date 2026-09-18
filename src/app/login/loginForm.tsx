'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

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

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function redirectAfterAuth() {
    router.push(locationId ? `/?location=${locationId}` : '/');
  }

  async function handleSignup() {
    setError('');
    if (phone.replace(/\D/g, '').length < 10) return setError('Enter a valid phone number.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    const e164Phone = toE164(phone);

    const { data, error } = await supabase.auth.signUp({
      phone: e164Phone,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setError(error?.message || 'Could not create account.');
      return;
    }

    // Mirror the auth user into our own `users` table (id MUST match for RLS)
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({ id: data.user.id, phone: e164Phone }, { onConflict: 'id' });

    setLoading(false);
    if (upsertError) return setError(upsertError.message);

    redirectAfterAuth();
  }

  async function handleLogin() {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      phone: toE164(phone),
      password,
    });
    setLoading(false);
    if (error) return setError('Incorrect phone or password.');
    redirectAfterAuth();
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2">OKcharge</h1>
          <p className="text-gray-500 font-medium">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div className="space-y-4">
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
            onClick={mode === 'signup' ? handleSignup : handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>

          <button
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
            className="w-full text-sm text-gray-400 hover:text-gray-600"
          >
            {mode === 'signup' ? 'Already have an account? Log in' : "New here? Create an account"}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
      </div>
    </main>
  );
}
