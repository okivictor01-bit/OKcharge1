export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold text-blue-600">OKcharge</h1>
          <p className="text-lg text-gray-600 font-medium">
            Never run out of battery on the go.
          </p>
          <p className="text-sm text-gray-400">
            Rent a fully charged powerbank at partner locations near you — no app download required.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
          <h2 className="font-bold text-gray-700 text-center">How It Works</h2>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <p className="font-bold text-gray-800">Scan the QR code</p>
              <p className="text-sm text-gray-500">Find the OKcharge display at any partner location and scan to start.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <p className="font-bold text-gray-800">Pick a duration & pay</p>
              <p className="text-sm text-gray-500">Choose 1, 3, 5, or 24 hours. Pay instantly by card, transfer, or USSD.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <p className="font-bold text-gray-800">Charge up & return</p>
              <p className="text-sm text-gray-500">Show your code to collect a powerbank, and return it before time runs out.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl shadow-xl p-6 text-center space-y-3">
          <p className="text-white font-bold text-lg">Own a shop, cafe, or kiosk?</p>
          <p className="text-blue-100 text-sm">
            Host OKcharge powerbanks at your location and earn 50% of every rental — no equipment cost to you.
          </p>
          
            href="/owner/signup"
            className="inline-block bg-white text-blue-600 font-bold px-6 py-3 rounded-xl mt-2"
          >
            Become a Partner
          </a>
        </div>

        <div className="text-center space-y-2 pt-4">
          <a href="/account" className="block text-sm text-gray-400 hover:text-gray-600">Manage my account</a>
          <a href="/owner/login" className="block text-sm text-gray-400 hover:text-gray-600">Partner login</a>
        </div>
      </div>
    </main>
  );
}
