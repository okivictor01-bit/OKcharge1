'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../../lib/supabaseClient';
import { parseFunctionError } from '../../../lib/parseFunctionError';

interface LocationDetail {
  id: string;
  name: string;
  address: string | null;
  location_qr_code: string;
  is_active: boolean;
}

interface Powerbank {
  id: string;
  powerbank_qr_code: string;
  status: string;
}

const SITE_URL = 'https://okcharge1.pages.dev';

export default function QrCodesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location_id');

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [powerbanks, setPowerbanks] = useState<Powerbank[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [addCount, setAddCount] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) {
        router.push('/admin/login');
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
        router.push('/admin/login');
        return;
      }

      setAuthorized(true);
      setCheckingAuth(false);
    });
  }, [router]);

  async function loadData() {
    if (!locationId) return;
    setLoading(true);
    setLoadError('');

    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const [locRes, pbRes] = await Promise.all([
      supabase.functions.invoke('admin-locations', {
        body: { action: 'get', location_id: locationId },
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      supabase.functions.invoke('admin-powerbanks', {
        body: { action: 'list', location_id: locationId },
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    setLoading(false);

    if (locRes.error || locRes.data?.error) {
      setLoadError(locRes.error ? await parseFunctionError(locRes.error) : locRes.data.error);
      return;
    }
    setLocation(locRes.data.location);

    if (!pbRes.error && pbRes.data?.powerbanks) {
      setPowerbanks(pbRes.data.powerbanks);
    }
  }

  useEffect(() => {
    if (authorized) loadData();
  }, [authorized, locationId]);

  async function handleAddPowerbanks() {
    setAddError('');
    if (!locationId) return;

    setAdding(true);
    const { data: sessionData } = await supabase.auth.refreshSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('admin-powerbanks', {
      body: { action: 'create', location_id: locationId, count: addCount },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setAdding(false);

    if (error) {
      setAddError(await parseFunctionError(error));
      return;
    }
    if (data?.error) {
      setAddError(data.error);
      return;
    }

    setAddCount(1);
    loadData();
  }

  function handlePrint() {
    window.print();
  }

  if (!locationId) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center p-6">
        <p className="text-gray-500">No location selected. Go back to the Admin dashboard and choose a location.</p>
      </main>
    );
  }

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  if (loadError || !location) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center p-6">
        <p className="text-red-600 font-medium">{loadError || 'Location not found.'}</p>
      </main>
    );
  }

  const locationUrl = `${SITE_URL}/?location=${location.location_qr_code}`;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-sheet { display: grid !important; }
          body { background: white !important; }
        }
        @media screen {
          .print-sheet { display: none; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">{location.name}</h1>
          <p className="text-sm text-gray-500">QR Codes & Batch Printing</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-xl"
        >
          Print A4 Sheet
        </button>
      </div>

      {/* Screen view */}
      <div className="no-print bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center space-y-3">
        <h2 className="font-bold text-gray-700 self-start">Location QR</h2>
        <QRCodeSVG value={locationUrl} size={180} />
        <p className="text-sm text-gray-500 break-all text-center">{locationUrl}</p>
        <p className="text-xs text-gray-400">Code: {location.location_qr_code}</p>
      </div>

      <div className="no-print bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-700">Powerbanks ({powerbanks.length})</h2>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Add how many?</label>
            <input
              type="number"
              min={1}
              max={50}
              value={addCount}
              onChange={(e) => setAddCount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
            />
          </div>
          <button
            onClick={handleAddPowerbanks}
            disabled={adding}
            className="bg-purple-600 text-white font-bold px-4 py-3 rounded-xl disabled:opacity-50"
          >
            {adding ? 'Adding…' : 'Generate'}
          </button>
        </div>
        {addError && <p className="text-sm text-red-600 font-medium">{addError}</p>}

        <div className="grid grid-cols-2 gap-4 pt-2">
          {powerbanks.map((pb) => (
            <div key={pb.id} className="border border-gray-200 rounded-xl p-3 flex flex-col items-center space-y-2">
              <QRCodeSVG value={pb.powerbank_qr_code} size={100} />
              <p className="text-xs font-mono text-gray-600">{pb.powerbank_qr_code}</p>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  pb.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : pb.status === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {pb.status}
              </span>
            </div>
          ))}
        </div>
        {powerbanks.length === 0 && (
          <p className="text-sm text-gray-400 text-center">No powerbanks yet — generate some above.</p>
        )}
      </div>

      {/* Print-only sheet */}
      <div className="print-sheet grid-cols-3 gap-4 p-4">
        <div className="col-span-3 flex flex-col items-center border-b-2 border-black pb-4 mb-2">
          <p className="font-bold text-lg">{location.name}</p>
          <QRCodeSVG value={locationUrl} size={140} />
          <p className="text-xs mt-1">LOCATION — {location.location_qr_code}</p>
        </div>
        {powerbanks.map((pb) => (
          <div key={pb.id} className="flex flex-col items-center border border-black rounded p-2">
            <QRCodeSVG value={pb.powerbank_qr_code} size={100} />
            <p className="text-xs font-mono mt-1">{pb.powerbank_qr_code}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
