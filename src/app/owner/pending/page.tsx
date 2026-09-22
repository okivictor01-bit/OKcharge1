'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function OwnerPendingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [phone, setPhone] = useState('');

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

      // If a location has already been assigned since they last checked, send them straight in.
      const { data: myLocation } = await supabase
        .from('locations')
        .select('id')
        .eq('owner_id', data.session.user.id)
        .maybeSingle();

      if (myLocation) {
        router.push('/owner/dashboard');
        return;
      }

      setPhone(data.session.user.phone || '');
      setChecking(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/owner/login');
  }

  async function handleRefresh() {
    setChecking(true);
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      router.push('/owner/login');
      return;
    }
    const { data: myLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('owner_id', data.session.user.id)
      .maybeSingle();

    if (myLocation) {
      router.push('/owner/dashboard');
      return;
    }
    setChecking(false);
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto text-center">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-4">
        <div className="text-4xl">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-800">Thanks for signing up!</h1>
        <p className="text-gray-500">
          An OKcharge Admin will set up your location and payout account soon.
          You'll be able to start receiving powerbanks once that's done.
        </p>
        {phone && <p className="text-xs text-gray-400">Registered as {phone}</p>}

        <button
          onClick={handleRefresh}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-2"
        >
          Check Again
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-sm text-gray-400 hover:text-gray-600"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
