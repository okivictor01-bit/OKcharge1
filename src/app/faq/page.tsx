export default function FaqPage() {
  const faqs = [
    {
      q: 'How do I rent a powerbank?',
      a: 'Scan the OKcharge QR code at any partner location, choose a duration (1, 3, 5, or 24 hours), pay, and show your ticket code to the location owner to collect a fully charged powerbank.',
    },
    {
      q: 'How much does it cost?',
      a: '1 hour: ₦100. 3 hours: ₦250. 5 hours: ₦400. 24 hours: ₦900.',
    },
    {
      q: 'What if I return it late?',
      a: 'A late fee of ₦100 is charged for every hour past your selected duration, capped at ₦2,000. This is charged automatically to your saved card, or added to your account balance if no card is on file.',
    },
    {
      q: 'What happens if I don\u2019t return the powerbank at all?',
      a: 'If a powerbank is not returned within 7 days of the rental expiring, it is treated as lost or stolen and a flat replacement fee of ₦15,000 is charged.',
    },
    {
      q: 'Why do I need to pay by card for my first rental?',
      a: 'Card payment is required for your first rental so we have a valid, chargeable payment method on file in case of late fees or an unreturned powerbank. After that, you can pay by card, bank transfer, or USSD.',
    },
    {
      q: 'My account is suspended \u2014 how do I fix it?',
      a: 'An account is suspended if a late fee or theft penalty could not be charged automatically. Log in and go to "Manage my account" to view and pay off any outstanding balance \u2014 your account is restored as soon as it\u2019s cleared.',
    },
    {
      q: 'I own a shop or kiosk \u2014 how do I become a partner?',
      a: 'Sign up on our Partner page. Once approved, OKcharge sets up your location, provides powerbank QR codes, and you earn 50% of every rental made at your location \u2014 with no equipment cost to you.',
    },
  ];

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <a href="/" className="text-sm text-blue-600 font-bold">&larr; Back to Home</a>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-xl p-6">
            <p className="font-bold text-gray-800 mb-2">{item.q}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
