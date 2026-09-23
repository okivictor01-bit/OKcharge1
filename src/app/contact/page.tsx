export default function ContactPage() {
  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-6">
      <a href="/" className="text-sm text-blue-600 font-bold">&larr; Back to Home</a>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">Contact Us</h1>
        <p className="text-gray-500 text-sm mt-1">We're happy to help.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase">WhatsApp</p>
          <a href="https://wa.me/2347032385674" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-green-600">+234 703 238 5674</a>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
          <a href="mailto:support@okcharge.ng" className="text-lg font-bold text-blue-600">support@okcharge.ng</a>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase">Response Time</p>
          <p className="text-gray-600">We typically respond within a few hours, every day.</p>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400">
        For account issues (suspended account, outstanding balance), you can also visit
        {' '}<a href="/account" className="text-blue-600 font-bold">My Account</a> directly.
      </p>
    </main>
  );
}
