'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Location {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
}

export default function RentalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationCode = searchParams.get('location');

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [location, setLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState('');

  const [duration, setDuration] = useState(1);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check whether the customer is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCheckingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Look up the scanned location in the database
  useEffect(() => {
    if (!locationCode) {
      setLoadingLocation(false);
      return;
    }
    supabase
      .from('locations')
      .select('id, name, address, is_active')
      .eq('location_qr_code', locationCode)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setLocationError('This location could not be found or is no longer active.');
        } else {
          setLocation(data);
        }
        setLoadingLocation(false);
      });
  }, [locationCode]);

  function handlePayClick() {
    if (!locationCode || !location) return;

    if (!user) {
      router.push(`/login?location=${locationCode}`);
      return;
    }

    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }

    setSubmitting(true);
    // Placeholder — next step wires this into real Paystack checkout
    alert(
      `Ready for Paystack: ${duration}h at "${location.name}" (location id: ${location.id}) for user ${user.id}`
    );
    setSubmitting(false);
  }

  if (!locationCode) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h1>
          <p className="text-gray-500">
            Please scan the QR code at an OKcharge location to start a rental.
          </p>
        </div>
      </main>
    );
  }

  if (loadingLocation || checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  if (locationError || !location) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Location Not Found</h1>
          <p className="text-gray-500">{locationError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">OKcharge</h1>
          <p className="text-gray-500 font-medium">{location.name}</p>
          {location.address && (
            <p className="text-xs text-gray-400">{location.address}</p>
          )}
        </div>

        {user && (
          <p className="text-xs text-center text-green-600 font-semibold">
            Logged in as {user.phone}
          </p>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">Select Duration</label>
          <div className="grid grid-cols-2 gap-3">
            {[1, 3, 5, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => setDuration(hours)}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${
                  duration === hours
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {hours} {hours === 1 ? 'Hour' : 'Hours'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Ada Obi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-blue-600 outline-none text-lg"
          />
        </div>

        {!user && (
          <p className="text-xs text-center text-gray-400">
            You'll be asked to log in or create an account before payment.
          </p>
        )}

        <button
          onClick={handlePayClick}
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl mt-4 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
        >
          {user ? 'Pay & Rent Now' : 'Continue to Login'}
        </button>

        <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
          By continuing, you agree to authorize a saved payment method. Unreturned powerbanks incur a flat ₦15,000 penalty.
        </p>
      </div>
    </main>
  );
}
