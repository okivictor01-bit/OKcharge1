export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <a href="/" className="text-sm text-blue-600 font-bold">&larr; Back to Home</a>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mt-1">Last updated September 2026</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5 text-gray-600 leading-relaxed text-sm">
        <section>
          <h2 className="font-bold text-gray-800 mb-1">Information We Collect</h2>
          <p>We collect your name, phone number, and rental history to operate the service. Payment details (such as card information) are collected and securely stored by our payment processor, Paystack \u2014 OKcharge never sees or stores your full card details directly.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">How We Use Your Information</h2>
          <p>Your information is used to process rentals and payments, send service-related notifications (such as return reminders), calculate and collect late fees or penalties where applicable, and provide customer support.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">Sharing of Information</h2>
          <p>We share the minimum necessary information with Paystack to process payments. We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">Data Security</h2>
          <p>Your account is protected by a password you choose. Payment authorization is handled entirely by Paystack under their own security standards.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">Your Rights</h2>
          <p>You may contact us at any time to request a copy of the personal information we hold about you, or to request that your account be closed.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">Contact</h2>
          <p>Questions about this policy can be sent to support@okcharge.ng.</p>
        </section>
      </div>
    </main>
  );
}
