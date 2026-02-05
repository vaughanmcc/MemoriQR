import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy (Australia)',
  description: 'MemoriQR Privacy Policy for Australian customers - How we handle your personal information under Australian law.',
}

export default function AUPrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container-narrow py-16 md:py-24">
          <h1 className="text-4xl font-serif text-gray-900 mb-8">
            Privacy Policy (Australia)
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last updated: February 2026
            </p>

            <p className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              This privacy policy applies to Australian customers and complies with the 
              Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs). For New Zealand 
              customers, please see our <a href="/privacy">New Zealand Privacy Policy</a>.
            </p>

            <h2>1. About This Policy</h2>
            <p>
              MemoriQR is committed to protecting your privacy. This policy explains how we 
              collect, use, disclose, and handle your personal information in accordance with 
              the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
            </p>
            <p>
              MemoriQR is a New Zealand-based business. When you use our services, your 
              personal information may be transferred to and stored in New Zealand, which has 
              comparable privacy protections under the Privacy Act 2020 (NZ).
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect personal information that you provide directly to us:
            </p>
            <ul>
              <li><strong>Identity Information:</strong> Name, email address, phone number</li>
              <li><strong>Contact Information:</strong> Shipping and billing address</li>
              <li><strong>Memorial Content:</strong> Photos, videos, names, dates, and memorial text you upload</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we never store card details)</li>
              <li><strong>Usage Data:</strong> Page views, device information, IP address, and interaction with memorials</li>
            </ul>
            <p>
              We collect this information when you place an order, create a memorial, contact us, 
              or use our website.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>
            <ul>
              <li>To create and host your memorial pages</li>
              <li>To process and fulfil your orders</li>
              <li>To send order confirmations and renewal reminders</li>
              <li>To provide customer support and respond to enquiries</li>
              <li>To improve our services and website</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>
              We will only use your personal information for the primary purpose for which it 
              was collected, or for a related secondary purpose you would reasonably expect.
            </p>

            <h2>4. Disclosure of Information</h2>
            <p>
              We do not sell your personal information. We may disclose your information to:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Stripe (payments - USA), Supabase (data and media hosting - USA), 
              email service providers</li>
              <li><strong>Suppliers:</strong> For order fulfillment (e.g., engraving details for plate production)</li>
              <li><strong>Legal Requirements:</strong> When required by Australian or New Zealand law, court order, 
              or to protect our legal rights</li>
            </ul>
            <p>
              <strong>Overseas Disclosure:</strong> Your personal information may be disclosed to 
              service providers in the United States (Stripe, Supabase) and New Zealand. We take 
              reasonable steps to ensure these parties comply with the APPs or are subject to 
              similar privacy protections.
            </p>

            <h2>5. Memorial Privacy</h2>
            <p>
              Memorial pages are private by default. They are only accessible to people who have 
              the direct link or scan the physical tag. Memorials are not indexed by search engines 
              and are not listed publicly on our website.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We take reasonable steps to protect your personal information from misuse, 
              interference, loss, unauthorised access, modification, or disclosure. Security 
              measures include:
            </p>
            <ul>
              <li>HTTPS encryption for all data transmission</li>
              <li>Encrypted data storage</li>
              <li>Secure payment processing through PCI-compliant Stripe</li>
              <li>Access controls and authentication</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services 
              and fulfil our legal obligations. Specifically:
            </p>
            <ul>
              <li>Memorial data: Duration of hosting period plus 90-day grace period</li>
              <li>Order records: 7 years for tax and legal compliance</li>
              <li>Communication records: 2 years after last contact</li>
            </ul>

            <h2>8. Your Rights</h2>
            <p>Under the Privacy Act 1988 (Cth), you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Complaint:</strong> Lodge a complaint if you believe we have breached your privacy</li>
            </ul>
            <p>
              To exercise these rights, contact us at privacy@memoriqr.co.nz. We will respond 
              to your request within a reasonable period (usually within 30 days).
            </p>

            <h2>9. Cookies and Analytics</h2>
            <p>
              We use essential cookies for website functionality and analytics cookies (Google Analytics) 
              to understand how visitors use our site. You can manage cookie settings in your browser.
              We do not use cookies to identify individuals or track you across other websites.
            </p>

            <h2>10. Direct Marketing</h2>
            <p>
              We may send you renewal reminders related to your memorial service. We will not 
              send you marketing communications without your consent. You can opt out of 
              communications at any time by contacting us or using the unsubscribe link in emails.
            </p>

            <h2>11. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 16. We do not knowingly collect 
              personal information from children without parental consent.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant 
              changes by email or through our website.
            </p>

            <h2>13. Complaints</h2>
            <p>
              If you believe we have breached your privacy, please contact us first. We will 
              investigate and respond within 30 days.
            </p>
            <p>
              If you are not satisfied with our response, you may lodge a complaint with the 
              <a href="https://www.oaic.gov.au" target="_blank" rel="noopener"> Office of the 
              Australian Information Commissioner (OAIC)</a>:
            </p>
            <ul>
              <li>Website: www.oaic.gov.au</li>
              <li>Phone: 1300 363 992</li>
              <li>Email: enquiries@oaic.gov.au</li>
            </ul>

            <h2>14. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@memoriqr.co.nz<br />
              <strong>Business Location:</strong> Auckland, New Zealand
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
