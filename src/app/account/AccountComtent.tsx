'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { parseFunctionError } from '../../lib/parseFunctionError';

interface Profile {
  phone: string;
  name: string | null;
  outstanding_debt: number;
  is_suspended: boolean;
}

export default function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasReference = !!searchParams.get('reference');

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(hasReference);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.push('/login?redirect=/account');
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  async function loadProfile() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return;

    const { data } = await supabase
      .from('users')
      .select('phone, name, outstanding_debt, is_suspended')
      .eq('id', userId)
      .single();

    setLoading(false);
    if (data) setProfile(data);
    return data;
  }

  useEffect(() => {
    if (checkingAuth) return;

    if (!hasReference) {
      loadProfile();
      return;
    }

    // Just returned from a debt payment — poll briefly for the webhook to catch up.
    let attempt = 0;
    let cancelled = false;

    async function pollAfterPayment() {
      const data = await loadProfile();
      if (cancelled) return;
      if (data && !data.is_suspended) {
        setConfirming(false);
        return;
      }
      attempt++;
      if (attempt < 6) {
        setTimeout(pollAfterPayment, 1500);
      } else {
        setConfirming(false);
      }
    }
    pollAfterPayment();

    return () => { cancelled = true; };
  }, [checkingAuth]);

  async function handlePayDebt() {
    setPayError('');
    setPayLoading(true);

    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('pay-debt', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setPayLoading(false);

    if (error) {
      setPayError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setPayError(data.error);
      return;
    }
    if (!data?.authorization_url) {
      setPayError('Could not start payment. Try again.');
      return;
    }

    window.location.href = data.authorization_url;
  }

  if (checkingAuth || loading || confirming) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{confirming ? 'Confirming payment…' : 'Loading…'}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Could not load your account.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-1">My Account</h1>
          <p className="text-gray-500 text-sm">{profile.phone}</p>
        </div>

        {profile.is_suspended ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 space-y-3 text-center">
            <p className="text-red-700 font-bold">Account Suspended</p>
            <p className="text-sm text-red-600">
              You have an outstanding balance from a late return or unreturned powerbank.
              Clear this to resume renting.
            </p>
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-gray-500">Amount Owed</p>
              <p className="text-3xl font-extrabold text-red-600">₦{profile.outstanding_debt.toLocaleString()}</p>
            </div>
            <button
              onClick={handlePayDebt}
              disabled={payLoading}
              className="w-full bg-red-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {payLoading ? 'Please wait…' : `Pay ₦${profile.outstanding_debt.toLocaleString()} Now`}
            </button>
            {payError && <p className="text-sm text-red-600 font-medium">{payError}</p>}
          </div>
        ) : (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
            <p className="text-green-700 font-bold">✓ Account in Good Standing</p>
            <p className="text-sm text-green-600 mt-1">No outstanding balance.</p>
          </div>
        )}
      </div>
    </main>
  );
}
