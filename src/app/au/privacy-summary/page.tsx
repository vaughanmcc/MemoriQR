import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy Summary (Australia)',
  description: 'Quick overview of how MemoriQR handles your personal information for Australian customers.',
}

export default function AUPrivacySummaryPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container-narrow py-16 md:py-24">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">
            Privacy Policy Summary
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Quick overview of how we handle your information
          </p>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last Updated: February 2026
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-blue-800 mb-0">
                This is a simplified summary. For the complete Privacy Policy, please read our{' '}
                <Link href="/au/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  full Privacy Policy
                </Link>.
              </p>
            </div>

            <h2>What We Are</h2>
            <p>
              MemoriQR creates physical memorial products (engraved metal plates and NFC tags) 
              with included digital photo gallery hosting.
            </p>

            <h2>What We Collect</h2>
            
            <h3>For Your Order</h3>
            <ul>
              <li>Name, email, phone, shipping address</li>
              <li>Payment info (handled securely by Stripe)</li>
              <li>Engraving details for your memorial plate</li>
            </ul>

            <h3>For Your Digital Gallery</h3>
            <ul>
              <li>Photos, videos, and memorial text you upload</li>
              <li>Names, dates, and display preferences</li>
            </ul>

            <h2>How We Use It</h2>
            
            <h3>Making Your Memorial</h3>
            <ul>
              <li>Manufacturing your engraved plate or NFC tag</li>
              <li>Shipping to your address</li>
              <li>Hosting your digital photo gallery</li>
            </ul>

            <h3>Keeping You Informed</h3>
            <ul>
              <li>Order confirmations and shipping updates</li>
              <li>Hosting renewal reminders (before your prepaid period expires)</li>
              <li>Customer service responses</li>
            </ul>

            <h2>Who We Share With</h2>
            <ul>
              <li><strong>Manufacturing Partners</strong> - To engrave your memorial plate</li>
              <li><strong>Stripe</strong> - For secure payment processing (we never see your card details)</li>
              <li><strong>Supabase</strong> - To host your digital memorial content securely</li>
            </ul>
            <p className="text-lg font-semibold text-gray-900">
              We DO NOT sell your information to anyone.
            </p>

            <h2>Your Digital Memorial Is Private</h2>
            <ul>
              <li>Only accessible via QR code on your physical product or direct link</li>
              <li>Not searchable on Google or other search engines</li>
              <li>Not listed publicly anywhere</li>
              <li>Only people you share it with can view it</li>
            </ul>

            <h2>How Long We Keep It</h2>
            <ul>
              <li><strong>During Hosting Period</strong> - Full access to your memorial</li>
              <li><strong>After Expiry</strong> - 90-day grace period with renewal reminders</li>
              <li><strong>After Grace Period</strong> - 30 days to download, then deleted</li>
            </ul>
            <p>Order records kept for 7 years (tax/accounting requirements)</p>

            <h2>Your Rights</h2>
            <p>You Can:</p>
            <ul>
              <li>✓ See what information we have about you</li>
              <li>✓ Correct any errors in your information</li>
              <li>✓ Download your memorial photos and content</li>
              <li>✓ Request deletion of your data</li>
              <li>✓ Opt out of renewal reminders (you&apos;ll still get critical notices)</li>
            </ul>

            <h2>Data Security</h2>
            <ul>
              <li>All data encrypted in secure databases</li>
              <li>HTTPS encryption for all website communication</li>
              <li>Payment info handled by Stripe (PCI-DSS compliant)</li>
              <li>Photos stored on Supabase secure cloud storage</li>
            </ul>

            <h2>Important Notes</h2>
            
            <h3>Privacy by Design</h3>
            <p>Your memorial is private unless you share the physical product or link</p>

            <h3>Physical Product Lasts Forever</h3>
            <p>Your engraved plate or NFC tag doesn&apos;t expire - only the digital hosting has a prepaid period</p>

            <h3>Easy to Renew</h3>
            <p>Extend your digital gallery hosting anytime - even during the 90-day grace period</p>

            <h3>Content Ownership</h3>
            <p>You own all the photos and content - we just host it for you</p>

            <h2>Cookies</h2>
            <ul>
              <li><strong>Essential Cookies</strong> - Required for the website to work</li>
              <li><strong>Analytics</strong> - Help us improve (Google Analytics - you can opt out)</li>
              <li><strong>No Advertising</strong> - We don&apos;t track you for ads or sell data</li>
            </ul>

            <h2>Children</h2>
            <ul>
              <li>Our products may memorialize children</li>
              <li>But services are managed by adults (parents/guardians)</li>
              <li>We don&apos;t collect information from anyone under 16</li>
            </ul>

            <h2>Questions or Requests?</h2>
            <p>
              Email: <a href="mailto:privacy@memoriqr.co.nz">privacy@memoriqr.co.nz</a><br />
              We respond within 5 business days
            </p>
            <p>
              <strong>To Access Your Data:</strong><br />
              Email us with your order number or memorial link. 
              We&apos;ll verify your identity and respond within 20 business days.
            </p>

            <h2>Complaints</h2>
            <p>
              <strong>Australian residents:</strong> Office of the Australian Information Commissioner 
              (<a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>)
            </p>
            <p>
              <strong>EU residents:</strong> Your local data protection authority
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center">
                <Link href="/au/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Read the Full Privacy Policy →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
