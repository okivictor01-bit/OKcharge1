export default function TermsPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <a href="/" className="text-sm text-blue-600 font-bold">&larr; Back to Home</a>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">Terms &amp; Conditions</h1>
        <p className="text-xs text-gray-400 mt-1">Last updated September 2026</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5 text-gray-600 leading-relaxed text-sm">
        <section>
          <h2 className="font-bold text-gray-800 mb-1">1. Rentals</h2>
          <p>By renting a powerbank, you agree to return it to any OKcharge location within your selected rental period (1, 3, 5, or 24 hours from handover).</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">2. Payment Authorization</h2>
          <p>Your first rental requires payment by card. By completing payment, you authorize OKcharge to save your payment method and charge it automatically for late fees or unreturned equipment penalties, as described below. Subsequent rentals may be paid by card, bank transfer, or USSD.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">3. Late Fees</h2>
          <p>A fee of ₦100 is charged for each hour a powerbank remains unreturned past your selected duration, up to a maximum of ₦2,000.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">4. Lost or Unreturned Equipment</h2>
          <p>If a powerbank is not returned within 7 days of the rental period expiring, it is classified as lost or stolen and a flat replacement fee of ₦15,000 will be charged to your saved payment method or added to your account balance.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">5. Account Suspension</h2>
          <p>If a charge for a late fee or replacement penalty fails, your account will be suspended from renting further powerbanks until the outstanding balance is paid in full.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">6. Partner Locations</h2>
          <p>Partners hosting OKcharge powerbanks receive 50% of the rental fee for transactions at their location. Partners are independent hosts and are not employees of OKcharge.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">7. Changes to These Terms</h2>
          <p>OKcharge may update these terms from time to time. Continued use of the service after changes are posted constitutes acceptance of the updated terms.</p>
        </section>
      </div>
    </main>
  );
}
