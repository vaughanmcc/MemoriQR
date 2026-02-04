import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MemoriQR Privacy Policy - How we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container-narrow py-16 md:py-24">
          <h1 className="text-4xl font-serif text-gray-900 mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last updated: January 2026
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              When you use MemoriQR, we collect information that you provide directly to us:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, and shipping address</li>
              <li><strong>Memorial Content:</strong> Photos, videos, names, dates, and memorial text you upload</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we never store card details)</li>
              <li><strong>Usage Data:</strong> Page views, device information, and interaction with memorials</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and host your memorial pages</li>
              <li>Process your orders and payments</li>
              <li>Send order confirmations and renewal reminders</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We share information only with:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Stripe (payments), Supabase (data and media hosting), SendGrid (email)</li>
              <li><strong>Suppliers:</strong> For order fulfillment (e.g., engraving details for plate production)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2>4. Memorial Privacy</h2>
            <p>
              Memorial pages are private by default. They are only accessible to people who have 
              the direct link or scan the physical tag. Memorials are not indexed by search engines 
              and are not listed publicly on our website.
            </p>

            <h2>5. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. Photos and videos are hosted 
              on Supabase Storage, with optional YouTube embedding for videos. All other data is stored in our secure database.
              We use HTTPS encryption for all data transmission.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your memorial data for the duration of your hosting period plus a 90-day 
              grace period after expiry. After this, you may request a data export before deletion.
            </p>

            <h2>7. Your Rights</h2>
            <p>Under the NZ Privacy Act 2020 and GDPR (for EU visitors), you have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>

            <h2>8. Cookies</h2>
            <p>
              We use essential cookies for website functionality and analytics cookies (Google Analytics) 
              to understand how visitors use our site. You can disable cookies in your browser settings.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 16. We do not knowingly collect 
              information from children.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant 
              changes by email or through our website.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@memoriqr.co.nz<br />
              <strong>Address:</strong> Auckland, New Zealand
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
