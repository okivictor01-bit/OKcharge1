type Block =
  | { type: 'p'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] };

interface Section {
  title: string;
  blocks: Block[];
}

const INTRO: string[] = [
  `Welcome to OKcharge. These Terms & Conditions govern your use of the OKcharge power-bank rental service, website, payment services, and related services.`,
  `By creating an account, making a rental, or using an OKcharge power bank, you agree to these Terms & Conditions.`,
];

const SECTIONS: Section[] = [
  {
    title: `1. About OKcharge`,
    blocks: [
      { type: 'p', text: `OKcharge provides portable power-bank rental services through participating OKcharge locations.` },
      { type: 'p', text: `Customers may rent an OKcharge power bank for a selected rental period and return it to an eligible OKcharge location.` },
      { type: 'p', text: `OKcharge locations may be operated by independent business partners. These partners provide the physical location and may assist with handing out and receiving power banks but are not employees of OKcharge.` },
    ],
  },
  {
    title: `2. Eligibility`,
    blocks: [
      { type: 'p', text: `To rent a power bank through OKcharge, you must:` },
      {
        type: 'ul',
        items: [
          `Be at least 18 years old.`,
          `Provide accurate registration information.`,
          `Provide a valid phone number and email address where requested.`,
          `Complete the required payment process.`,
          `Accept these Terms & Conditions.`,
          `Provide a valid payment card for your first rental.`,
        ],
      },
      { type: 'p', text: `OKcharge may refuse, suspend, or terminate access to the service where information provided by a customer is inaccurate, fraudulent, or used for abusive purposes.` },
    ],
  },
  {
    title: `3. Rental Periods`,
    blocks: [
      { type: 'p', text: `Available rental periods may include:` },
      { type: 'ul', items: [`1 hour`, `3 hours`, `5 hours`, `24 hours`] },
      { type: 'p', text: `The rental period begins when the power bank is handed over to the customer or otherwise marked as rented in the OKcharge system.` },
      { type: 'p', text: `The customer is responsible for the power bank from the time of handover until the power bank is successfully returned and the return has been recorded by OKcharge or an authorized OKcharge location.` },
      { type: 'p', text: `The customer must return the power bank within the selected rental period.` },
    ],
  },
  {
    title: `4. Returning a Power Bank`,
    blocks: [
      { type: 'p', text: `Power banks may be returned to any designated OKcharge return location that accepts returns.` },
      { type: 'p', text: `When returning a power bank, the customer should hand it to an authorized staff member and ensure that the return is properly recorded.` },
      { type: 'p', text: `Simply leaving a power bank at a location, with an unauthorized person, or in another place does not necessarily constitute a completed return.` },
      { type: 'p', text: `The rental remains the customer's responsibility until the return is confirmed in the OKcharge system.` },
    ],
  },
  {
    title: `5. Payment for Your First Rental`,
    blocks: [
      { type: 'strong', text: `A payment card is required for your first OKcharge rental.` },
      { type: 'p', text: `When completing your first rental, your card payment is processed through our payment provider.` },
      { type: 'p', text: `Where the payment authorization is eligible for reuse, OKcharge may securely retain the payment authorization provided by its payment processor for the purpose of charging applicable fees permitted under these Terms.` },
      { type: 'p', text: `OKcharge does not store your full card number or CVV.` },
      { type: 'p', text: `Payment-card information is processed by our authorized payment service provider.` },
      { type: 'p', text: `By completing your first rental, you acknowledge and authorize OKcharge to charge your authorized payment method for applicable fees described in these Terms, including applicable late-return and non-return/replacement charges.` },
      { type: 'h3', text: `Subsequent rentals` },
      { type: 'p', text: `After your first rental, OKcharge may allow subsequent rentals to be paid through available payment methods, which may include:` },
      { type: 'ul', items: [`Card`, `Bank transfer`, `USSD`, `Other payment methods made available by OKcharge`] },
      { type: 'p', text: `However, any outstanding amount owed to OKcharge may need to be settled before another rental is permitted.` },
    ],
  },
  {
    title: `6. Late Return Fees`,
    blocks: [
      { type: 'p', text: `If a power bank is not returned when the selected rental period expires, the rental is marked overdue. Late-return fees are charged per completed hour: no fee applies until one full hour has passed after the rental period expires.` },
      { type: 'p', text: `The late-return fee is:` },
      { type: 'strong', text: `₦100 per completed hour` },
      { type: 'p', text: `subject to a maximum late-return fee of:` },
      { type: 'strong', text: `₦2,000 per rental.` },
      { type: 'h3', text: `Example` },
      { type: 'p', text: `If your rental expires at 7:00 PM and you return the power bank at 9:30 PM, you are 2 completed hours late (the extra half hour is not charged):` },
      { type: 'strong', text: `2 hours × ₦100 = ₦200 late fee.` },
      { type: 'p', text: `If the accumulated late fee reaches ₦2,000, no additional late-return fee will be charged beyond that maximum.` },
      { type: 'p', text: `Where applicable, the accumulated late fee may be charged to the payment authorization associated with your account.` },
    ],
  },
  {
    title: `7. Power Banks Not Returned Within Seven Days`,
    blocks: [
      { type: 'p', text: `If a power bank remains unreturned for seven (7) days after the selected rental period expires, OKcharge may classify the power bank as lost or unreturned equipment.` },
      { type: 'p', text: `A replacement charge of:` },
      { type: 'strong', text: `₦15,000` },
      { type: 'p', text: `will then be charged to the customer's authorized payment method or recorded as an outstanding balance on the customer's OKcharge account.` },
      { type: 'p', text: `The ₦15,000 charge represents the replacement cost associated with the unreturned power bank.` },
      { type: 'p', text: `This ₦15,000 replacement charge is the total amount payable for an unreturned power bank. It replaces, and is not added to, any late-return fees accumulated on that rental.` },
      { type: 'p', text: `OKcharge may also take reasonable steps to recover its equipment or outstanding amounts where appropriate and lawful.` },
      { type: 'h3', text: `Important` },
      { type: 'p', text: `The seven-day period does not cancel the customer's responsibility to return the power bank. Customers should return the power bank as soon as possible after the rental period expires.` },
    ],
  },
  {
    title: `8. Failed Charges and Outstanding Balances`,
    blocks: [
      { type: 'p', text: `If OKcharge attempts to charge an applicable fee and the payment fails, the amount will remain outstanding on the customer's account.` },
      { type: 'p', text: `OKcharge may:` },
      {
        type: 'ul',
        items: [
          `Retry the payment where permitted by the payment provider.`,
          `Record the amount as an outstanding balance.`,
          `Restrict the customer's ability to make another rental.`,
          `Suspend the customer's account until the outstanding amount is settled.`,
        ],
      },
      { type: 'p', text: `A customer with an outstanding balance may not be permitted to make another rental until the balance has been resolved.` },
    ],
  },
  {
    title: `9. Loss, Theft or Damage`,
    blocks: [
      { type: 'p', text: `Customers are responsible for taking reasonable care of an OKcharge power bank while it is in their possession.` },
      { type: 'p', text: `Customers must not:` },
      {
        type: 'ul',
        items: [
          `Intentionally damage the power bank.`,
          `Tamper with or modify the power bank.`,
          `Open or dismantle the power bank.`,
          `Remove or deliberately damage its identification markings.`,
          `Use the power bank for an unlawful purpose.`,
          `Give the power bank to another person without authorization.`,
          `Deliberately conceal, abandon, or dispose of the power bank.`,
        ],
      },
      { type: 'p', text: `If a power bank is damaged, lost, stolen, deliberately misused, or otherwise cannot be recovered, OKcharge may hold the customer responsible for the resulting loss in accordance with these Terms and any applicable charges communicated by OKcharge.` },
    ],
  },
  {
    title: `10. Customer Responsibility`,
    blocks: [
      { type: 'p', text: `The customer is responsible for the power bank throughout the rental period.` },
      { type: 'p', text: `Customers should:` },
      {
        type: 'ul',
        items: [
          `Keep the power bank in their possession or in a secure place.`,
          `Protect it from water, excessive heat, theft, and physical damage.`,
          `Return it promptly when the rental period ends.`,
          `Report any problem with the power bank to OKcharge as soon as possible.`,
        ],
      },
      { type: 'p', text: `If a customer believes that a power bank has been lost or stolen, they should contact OKcharge immediately.` },
      { type: 'p', text: `Prompt reporting may assist OKcharge in recovering the equipment.` },
    ],
  },
  {
    title: `11. Rental Tickets and Power Banks`,
    blocks: [
      { type: 'p', text: `Each rental may generate a unique rental ticket, reference, or code.` },
      { type: 'p', text: `Customers should keep their rental information until the power bank has been successfully returned.` },
      { type: 'p', text: `The rental ticket identifies the rental transaction and may be used by an authorized OKcharge location to verify the customer's rental.` },
      { type: 'p', text: `Power banks may also carry a unique OKcharge identification number.` },
    ],
  },
  {
    title: `12. No Unauthorized Transfer`,
    blocks: [
      { type: 'p', text: `A customer must not sell, rent out, transfer, pledge, or otherwise give an OKcharge power bank to another person.` },
      { type: 'p', text: `If another person uses the power bank after it has been issued to you, you remain responsible for the rental unless OKcharge has officially transferred responsibility to that person.` },
    ],
  },
  {
    title: `13. Refunds and Payment Disputes`,
    blocks: [
      { type: 'p', text: `Rental payments are generally made before the power bank is issued.` },
      { type: 'p', text: `Where a customer believes that they have been incorrectly charged, they should contact OKcharge support with:` },
      {
        type: 'ul',
        items: [
          `Rental ticket/reference`,
          `Customer name`,
          `Phone number or email`,
          `Payment reference`,
          `Description of the issue`,
        ],
      },
      { type: 'p', text: `OKcharge will review disputed transactions and make corrections where an error is confirmed.` },
      { type: 'p', text: `Payment disputes involving a third-party payment provider may also be subject to that provider's procedures.` },
    ],
  },
  {
    title: `14. Service Availability`,
    blocks: [
      { type: 'p', text: `OKcharge aims to provide a reliable rental service but does not guarantee that:` },
      {
        type: 'ul',
        items: [
          `A power bank will always be available at every location.`,
          `Every location will be open at all times.`,
          `The website or rental system will always be available without interruption.`,
          `A particular payment method will always be available.`,
          `A particular power bank will always be fully charged.`,
        ],
      },
      { type: 'p', text: `Service availability may be affected by maintenance, network problems, power outages, payment-provider issues, equipment availability, or circumstances beyond OKcharge's reasonable control.` },
    ],
  },
  {
    title: `15. Limitation of Liability`,
    blocks: [
      { type: 'p', text: `OKcharge is not responsible for indirect, incidental, or consequential losses arising from the use or inability to use the service, except where liability cannot legally be excluded.` },
      { type: 'p', text: `Customers are responsible for using rented power banks safely and appropriately.` },
      { type: 'p', text: `OKcharge is not responsible for damage to a customer's device resulting from improper use, incompatible equipment, failure to follow instructions, or use of a damaged power bank after the customer has been advised not to use it.` },
      { type: 'p', text: `If a power bank appears damaged or defective, the customer should stop using it and contact OKcharge.` },
    ],
  },
  {
    title: `16. Customer Information and Privacy`,
    blocks: [
      { type: 'p', text: `OKcharge may collect information necessary to:` },
      {
        type: 'ul',
        items: [
          `Create and manage customer accounts.`,
          `Process payments.`,
          `Manage rentals.`,
          `Identify rental transactions.`,
          `Contact customers about rentals.`,
          `Recover unreturned equipment.`,
          `Detect fraud and abuse.`,
          `Provide customer support.`,
          `Maintain service records.`,
        ],
      },
      { type: 'p', text: `OKcharge does not require the customer's phone IMEI as part of the standard rental process.` },
      { type: 'p', text: `Payment-card information is processed through our payment provider. OKcharge does not store full card numbers or CVV information.` },
      { type: 'p', text: `Personal information is handled in accordance with the OKcharge Privacy Policy.` },
    ],
  },
  {
    title: `17. Account Suspension or Termination`,
    blocks: [
      { type: 'p', text: `OKcharge may suspend or restrict an account where:` },
      {
        type: 'ul',
        items: [
          `A customer has an unpaid balance.`,
          `A power bank has not been returned.`,
          `A payment has failed repeatedly.`,
          `Fraudulent activity is suspected.`,
          `The customer has violated these Terms.`,
          `The service is being abused or used unlawfully.`,
        ],
      },
      { type: 'p', text: `Suspension does not remove any outstanding financial obligation owed to OKcharge.` },
    ],
  },
  {
    title: `18. Prohibited Activities`,
    blocks: [
      { type: 'p', text: `Customers must not use the OKcharge service for:` },
      {
        type: 'ul',
        items: [
          `Fraudulent transactions.`,
          `Illegal activities.`,
          `Deliberate equipment theft or destruction.`,
          `Attempts to bypass OKcharge's payment or rental controls.`,
          `Unauthorized access to the OKcharge system.`,
          `Activities designed to interfere with the operation of the service.`,
        ],
      },
      { type: 'p', text: `OKcharge may take appropriate action where prohibited activity is detected.` },
    ],
  },
  {
    title: `19. Third-Party Payment Services`,
    blocks: [
      { type: 'p', text: `Payments are processed through third-party payment providers.` },
      { type: 'p', text: `Customers may also be subject to the applicable terms and privacy policies of those payment providers.` },
      { type: 'p', text: `OKcharge is not responsible for failures caused solely by a third-party payment provider, bank, card network, telecommunications provider, or other external service.` },
    ],
  },
  {
    title: `20. Changes to These Terms`,
    blocks: [
      { type: 'p', text: `OKcharge may update these Terms & Conditions from time to time.` },
      { type: 'p', text: `When material changes are made, OKcharge may publish the updated Terms on its website.` },
      { type: 'p', text: `The “Last Updated” date at the top of this page will indicate when the Terms were most recently revised.` },
      { type: 'p', text: `Continued use of the OKcharge service after updated Terms have been published constitutes acceptance of the updated Terms, to the extent permitted by applicable law.` },
    ],
  },
  {
    title: `21. Governing Law`,
    blocks: [
      { type: 'p', text: `These Terms & Conditions shall be governed by and interpreted in accordance with the laws of the Federal Republic of Nigeria.` },
      { type: 'p', text: `Any dispute relating to the OKcharge service shall be handled in accordance with applicable Nigerian law.` },
    ],
  },
];

function renderBlock(block: Block, i: number) {
  if (block.type === 'p') return <p key={i}>{block.text}</p>;
  if (block.type === 'strong') return <p key={i} className="font-bold text-gray-800 text-base">{block.text}</p>;
  if (block.type === 'h3') return <h3 key={i} className="font-bold text-gray-800 pt-1">{block.text}</h3>;
  return (
    <ul key={i} className="list-disc pl-5 space-y-1">
      {block.items.map((item, j) => (<li key={j}>{item}</li>))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <a href="/" className="text-sm text-blue-600 font-bold">&larr; Back to Home</a>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">OKcharge Terms &amp; Conditions</h1>
        <p className="text-xs text-gray-400 mt-1">Last Updated: September 2026</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 text-gray-600 leading-relaxed text-sm">
        <div className="space-y-3">
          {INTRO.map((text, i) => (<p key={i}>{text}</p>))}
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-bold text-gray-800 text-base">{section.title}</h2>
            {section.blocks.map((block, i) => renderBlock(block, i))}
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="font-bold text-gray-800 text-base">22. Contact OKcharge</h2>
          <p>For questions, complaints, payment issues, rental problems, lost power banks, or other support matters:</p>
          <p className="font-bold text-gray-800">OKcharge<br />Akure, Ondo State, Nigeria</p>
          <p>Phone/WhatsApp: +234 703 238 5674</p>
          <p>Email: <a href="mailto:support@okcharge.ng" className="text-blue-600 font-bold">support@okcharge.ng</a></p>
        </section>
      </div>
    </main>
  );
}
