'use client';
import { useState } from 'react';

export default function Home() {
  const [duration, setDuration] = useState(1);
  const [phone, setPhone] = useState('');

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">OKcharge</h1>
          <p className="text-gray-500 font-medium">Rent a powerbank instantly.</p>
        </div>

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
          <label className="block text-sm font-bold text-gray-700">Phone Number</label>
          <input
            type="tel"
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-blue-600 outline-none text-lg"
          />
        </div>

        <button 
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl mt-4 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
          onClick={() => alert(`Next: Connect to Paystack for ${duration} hours!`)}
        >
          Pay & Rent Now
        </button>
        
        <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
          By continuing, you agree to authorize a saved payment method. Unreturned powerbanks incur a flat ₦15,000 penalty.
        </p>
      </div>
    </main>
  );
}
