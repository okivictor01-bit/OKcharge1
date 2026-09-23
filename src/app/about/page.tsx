export default function AboutPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <a href="/" className="text-sm text-blue-600 font-bold">&larr; Back to Home</a>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">About OKcharge</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 text-gray-600 leading-relaxed">
        <p>
          OKcharge is a portable powerbank rental network built for people on the move.
          Never let a dead phone battery slow you down \u2014 find an OKcharge location,
          scan, pay, and go.
        </p>
        <p>
          We partner with shops, cafes, and kiosks across your city to host our powerbanks,
          so you're never far from a charge. Our partners handle the physical handover and
          earn a share of every rental made at their location \u2014 a simple, low-cost way to
          add a new income stream to an existing business.
        </p>
        <p>
          OKcharge handles the technology: secure payments, automated tracking, and a
          simple app experience \u2014 no downloads required.
        </p>
      </div>

      <div className="bg-blue-600 rounded-2xl shadow-xl p-6 text-center space-y-3">
        <p className="text-white font-bold text-lg">Want to host OKcharge at your location?</p>
        <a href="/owner/signup" className="inline-block bg-white text-blue-600 font-bold px-6 py-3 rounded-xl mt-2">Become a Partner</a>
      </div>
    </main>
  );
}
