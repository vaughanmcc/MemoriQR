import { Metadata } from 'next'
import Link from 'next/link'
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
            MemoriQR Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last Updated: February 2026
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 mb-0">
                Looking for a quick overview?{' '}
                <Link href="/au/privacy-summary" className="text-blue-600 hover:text-blue-800 underline">
                  Read our Privacy Policy Summary →
                </Link>
              </p>
            </div>

            <p className="mb-8">
              MemoriQR creates lasting physical memorials - engraved metal plates and NFC tags - that 
              include access to digital photo galleries. This Privacy Policy explains how we collect, 
              use, and protect your information when you purchase our memorial products and use the 
              included digital features.
            </p>

            <h2>1. Information We Collect</h2>
            <p>When you purchase MemoriQR memorial products, we collect:</p>
            
            <h3>Memorial Products &amp; Orders</h3>
            <ul>
              <li>Your name, email address, phone number, and shipping address</li>
              <li>Payment information (processed securely through Stripe - we never store your card details)</li>
              <li>Product specifications and engraving details for your memorial plate or tag</li>
              <li>Order history and purchase records</li>
            </ul>

            <h3>Digital Memorial Content</h3>
            <ul>
              <li>Photos, videos, names, dates, and memorial text you choose to upload to your digital gallery</li>
              <li>Profile frame selections and display preferences</li>
              <li>Memorial page customization choices</li>
            </ul>

            <h3>Technical Information</h3>
            <ul>
              <li>Device type, browser information, and IP address</li>
              <li>Page views and interactions with your digital memorial</li>
              <li>Access logs for memorial pages</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            
            <h3>Product Fulfillment &amp; Service Delivery</h3>
            <ul>
              <li>Manufacturing and engraving your physical memorial products</li>
              <li>Shipping your orders to the correct address</li>
              <li>Activating and hosting your digital memorial gallery for the prepaid hosting period</li>
              <li>Processing payments and managing your account</li>
            </ul>

            <h3>Communications</h3>
            <ul>
              <li>Sending order confirmations and shipping notifications</li>
              <li>Providing activation instructions for your memorial products</li>
              <li>Sending hosting renewal reminders before your prepaid period expires</li>
              <li>Responding to your customer service inquiries</li>
            </ul>

            <h3>Service Improvement</h3>
            <ul>
              <li>Understanding how customers use our memorial products and digital features</li>
              <li>Improving product quality and user experience</li>
              <li>Developing new memorial product options</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We respect your privacy and do not sell your personal information. We share 
              information only when necessary:
            </p>

            <h3>Manufacturing &amp; Fulfillment Partners</h3>
            <ul>
              <li>Engraving details and specifications are shared with our manufacturing partners to produce your memorial plates</li>
              <li>Shipping addresses are shared with delivery services to fulfill your order</li>
            </ul>

            <h3>Service Providers</h3>
            <ul>
              <li><strong>Stripe:</strong> Payment processing (they handle all card information securely)</li>
              <li><strong>Supabase:</strong> Secure hosting of your digital memorial content</li>
              <li><strong>Email service providers:</strong> For order confirmations and important account notifications</li>
            </ul>

            <h3>Legal Requirements</h3>
            <ul>
              <li>When required by law, court order, or to protect our legal rights</li>
              <li>To prevent fraud or protect the safety of our customers</li>
            </ul>

            <h2>4. Digital Memorial Privacy</h2>
            <p>Your digital memorial gallery is private:</p>
            <ul>
              <li>Accessible only via the unique QR code on your physical memorial product or direct link</li>
              <li>Not indexed by search engines</li>
              <li>Not listed publicly on our website</li>
              <li>Only viewable by people you choose to share the physical memorial or link with</li>
            </ul>
            <p>
              You control who can access your memorial by controlling access to the physical product 
              (plate or tag) that contains the QR code or NFC chip.
            </p>

            <h2>5. Data Storage and Security</h2>

            <h3>Physical Product Information</h3>
            <ul>
              <li>Order and engraving details are stored securely in our encrypted database</li>
              <li>Payment information is handled entirely by Stripe (PCI-DSS compliant) - we never store card details</li>
            </ul>

            <h3>Digital Memorial Content</h3>
            <ul>
              <li>Photos and memorial content are stored on Supabase&apos;s secure cloud storage</li>
              <li>Videos may be hosted on YouTube (unlisted, not searchable) if you choose that option</li>
              <li>All data transmission uses HTTPS encryption</li>
              <li>Access to memorial pages requires the unique link from your physical product</li>
            </ul>

            <h2>6. Data Retention</h2>

            <h3>Active Memorials</h3>
            <ul>
              <li>We retain your memorial content for the full duration of your prepaid hosting period</li>
              <li>Your physical memorial product (plate or tag) remains functional indefinitely</li>
            </ul>

            <h3>After Hosting Expiry</h3>
            <ul>
              <li><strong>90-day grace period:</strong> Your memorial remains viewable, with renewal reminders sent</li>
              <li><strong>After grace period:</strong> Memorial is unpublished but data retained for 30 days</li>
              <li>You may request a data export before final deletion</li>
              <li>Renewal available at any time during grace period to restore full access</li>
            </ul>

            <h3>Order Records</h3>
            <ul>
              <li>Purchase history and customer information retained for 7 years for tax and accounting purposes</li>
            </ul>

            <h2>7. Your Privacy Rights</h2>
            <p>
              Under Australia&apos;s Privacy Act 1988 (including the Australian Privacy Principles) and 
              GDPR (for European visitors), you have the right to:
            </p>

            <h3>Access &amp; Correction</h3>
            <ul>
              <li>View all personal information we hold about you</li>
              <li>Correct any inaccurate or incomplete information</li>
              <li>Receive a copy of your memorial content</li>
            </ul>

            <h3>Data Portability &amp; Deletion</h3>
            <ul>
              <li>Export your memorial photos and content in a portable format</li>
              <li>Request deletion of your personal information (subject to legal retention requirements)</li>
              <li>Download all memorial content before your hosting expires</li>
            </ul>

            <h3>Communication Preferences</h3>
            <ul>
              <li>Opt out of renewal reminder emails (you&apos;ll still receive critical account notices)</li>
              <li>Unsubscribe from marketing communications</li>
              <li>Update your contact preferences at any time</li>
            </ul>

            <h2>8. Partner Program Privacy</h2>
            <p>If you are a MemoriQR partner (veterinarian, funeral home, pet crematorium, etc.):</p>

            <h3>Information Collected</h3>
            <ul>
              <li>Business details, contact information, and banking details for commission payments</li>
              <li>Sales data from activation codes and referral codes you distribute</li>
              <li>Commission earnings and payout history</li>
            </ul>

            <h3>Partner Communications</h3>
            <ul>
              <li>Notifications when your codes are redeemed</li>
              <li>Commission statements and payment confirmations</li>
              <li>Updates to partner terms and program information</li>
            </ul>
            <p>You can manage notification preferences in your partner portal settings.</p>

            <h2>9. Cookies and Tracking</h2>

            <h3>Essential Cookies</h3>
            <ul>
              <li>Required for website functionality, order processing, and memorial access</li>
              <li>Cannot be disabled without affecting service functionality</li>
            </ul>

            <h3>Analytics Cookies</h3>
            <ul>
              <li>Google Analytics to understand how visitors use our website</li>
              <li>Helps us improve product offerings and user experience</li>
              <li>You can opt out via browser settings or Google Analytics opt-out tools</li>
            </ul>

            <h3>No Advertising Tracking</h3>
            <ul>
              <li>We do not use cookies for advertising or sell data to third parties</li>
              <li>No cross-site tracking or behavioral advertising</li>
            </ul>

            <h2>10. Children&apos;s Privacy</h2>
            <p>Our memorial products may commemorate children, but our services are not directed to children.</p>
            <ul>
              <li>We do not knowingly collect personal information from anyone under 16</li>
              <li>Memorial content about children is managed by parents, guardians, or adult family members</li>
              <li>If we discover we have collected information from a child under 16, we will delete it promptly</li>
            </ul>

            <h2>11. International Data Transfers</h2>

            <h3>Primary Operations</h3>
            <ul>
              <li>MemoriQR operates from Australia</li>
              <li>Our infrastructure (Supabase, Stripe) may process data in various locations including the United States and Europe</li>
            </ul>

            <h3>Data Protection</h3>
            <ul>
              <li>All service providers maintain appropriate security standards</li>
              <li>International transfers comply with Australian Privacy Principles and applicable privacy laws including GDPR</li>
            </ul>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy to reflect changes in our practices or legal requirements.
            </p>

            <h3>Notice of Changes</h3>
            <ul>
              <li>Material changes will be communicated via email to active customers</li>
              <li>Updated policy posted on our website with revision date</li>
              <li>Continued use of our products after changes constitutes acceptance</li>
            </ul>

            <h2>13. Memorial Content Ownership</h2>

            <h3>You Retain Ownership</h3>
            <ul>
              <li>You own all photos, videos, and content you upload to your memorial</li>
              <li>MemoriQR hosts your content as a service during your prepaid hosting period</li>
              <li>You may download your content at any time</li>
            </ul>

            <h3>Our Limited License</h3>
            <ul>
              <li>You grant us permission to display your content on the memorial page</li>
              <li>This license is limited to providing the memorial service you purchased</li>
              <li>We do not use your memorial content for any other purpose</li>
            </ul>

            <h2>14. Contact Us &amp; Data Requests</h2>

            <h3>Privacy Questions</h3>
            <p>
              <strong>Email:</strong> privacy@memoriqr.co.nz<br />
              <strong>Response time:</strong> Within 5 business days
            </p>

            <h3>Data Access Requests</h3>
            <ul>
              <li>Email privacy@memoriqr.co.nz with your order number or memorial link</li>
              <li>We will verify your identity before providing access to personal information</li>
              <li>Requests processed within 20 business days</li>
            </ul>

            <h3>Mailing Address</h3>
            <p>
              MemoriQR<br />
              Australia
            </p>

            <h3>Right to Complain</h3>
            <ul>
              <li><strong>Australian residents:</strong> <a href="https://www.oaic.gov.au" target="_blank" rel="noopener">Office of the Australian Information Commissioner (oaic.gov.au)</a></li>
              <li><strong>EU residents:</strong> Your local data protection authority</li>
            </ul>

            <h2>15. Business Transfers</h2>
            <p>If MemoriQR is acquired, merged, or sold:</p>
            <ul>
              <li>Your information may be transferred to the new entity</li>
              <li>You will be notified via email before any transfer</li>
              <li>The new owner must honor this Privacy Policy</li>
              <li>Your memorial content and hosting period will continue uninterrupted</li>
            </ul>

            <hr className="my-8" />

            <p className="text-gray-600">
              This Privacy Policy is effective as of February 2026.
            </p>
            <p>
              Your privacy matters to us. We are committed to protecting your information while 
              delivering beautiful, lasting memorial products that honor your loved ones.
            </p>
            <p>
              For questions about this policy or your privacy rights, please contact{' '}
              <a href="mailto:privacy@memoriqr.co.nz">privacy@memoriqr.co.nz</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
