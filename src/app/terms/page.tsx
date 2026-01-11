import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MemoriQR Terms of Service - Terms and conditions for using our memorial services.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container-narrow py-16 md:py-24">
          <h1 className="text-4xl font-serif text-gray-900 mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last updated: January 2026
            </p>

            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using MemoriQR's services, you agree to be bound by these Terms 
              of Service. If you do not agree, please do not use our services.
            </p>

            <h2>2. Description of Services</h2>
            <p>
              MemoriQR provides digital memorial services, including:
            </p>
            <ul>
              <li>Physical NFC tags and laser-engraved QR code plates</li>
              <li>Hosted memorial web pages with photos, videos, and text</li>
              <li>Prepaid hosting for periods of 5, 10, or 25 years</li>
              <li>Optional renewal services after the prepaid period</li>
            </ul>

            <h2>3. Hosting Duration and Renewal</h2>
            <p>
              <strong>Prepaid Hosting:</strong> Your memorial hosting is prepaid for the selected 
              duration (5, 10, or 25 years) from the date of purchase.
            </p>
            <p>
              <strong>Renewal:</strong> After your prepaid period ends, you may renew for $24/year 
              or purchase additional years. We will send email reminders at 30 days, 7 days, and 
              1 day before expiry.
            </p>
            <p>
              <strong>Grace Period:</strong> After expiry, your memorial remains accessible with 
              a renewal banner for 30 days. After 30 days, the memorial goes offline but data is 
              retained for 90 days for possible restoration.
            </p>

            <h2>4. Content Ownership and Rights</h2>
            <p>
              <strong>Your Content:</strong> You retain all ownership rights to photos, videos, 
              and text you upload. By uploading, you grant MemoriQR a license to host and display 
              this content for the purpose of providing the memorial service.
            </p>
            <p>
              <strong>Representations:</strong> You represent that you have the right to upload 
              and share all content, and that it does not infringe on any third-party rights.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to upload or share content that:</p>
            <ul>
              <li>Is illegal, harmful, threatening, abusive, or harassing</li>
              <li>Contains hate speech, discrimination, or violence</li>
              <li>Is sexually explicit or pornographic</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or harmful code</li>
              <li>Violates any applicable laws</li>
            </ul>
            <p>
              We reserve the right to remove any content that violates these terms and to 
              terminate accounts for serious or repeated violations.
            </p>

            <h2>6. Physical Products</h2>
            <p>
              <strong>Quality:</strong> Our stainless steel plates are made from 316 marine-grade 
              steel and are designed for long-term outdoor use. NFC tags are rated for indoor use.
            </p>
            <p>
              <strong>Shipping:</strong> We ship within New Zealand and Australia. Delivery times 
              are estimates and may vary.
            </p>
            <p>
              <strong>Defects:</strong> If you receive a defective product, contact us within 30 
              days for a replacement.
            </p>

            <h2>7. Refunds</h2>
            <p>
              <strong>Before Shipping:</strong> Full refund available within 30 days if your 
              product has not shipped.
            </p>
            <p>
              <strong>After Shipping:</strong> Refunds for defective products only. Memorial 
              hosting fees are non-refundable once the memorial has been activated and published.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              MemoriQR provides its services "as is" without warranties of any kind. We are not 
              liable for:
            </p>
            <ul>
              <li>Data loss or service interruptions beyond our control</li>
              <li>Actions of third-party service providers</li>
              <li>Indirect, incidental, or consequential damages</li>
            </ul>
            <p>
              Our maximum liability is limited to the amount you paid for the affected service.
            </p>

            <h2>9. Memorial URLs</h2>
            <p>
              Once a memorial URL is assigned (e.g., memoriqr.co.nz/memorial/name-2026), it 
              remains permanent and cannot be changed. This ensures links on physical tags 
              always work.
            </p>

            <h2>10. Account Termination</h2>
            <p>
              We may terminate or suspend access to our services for violations of these terms. 
              You may close your account at any time by contacting us, though hosting fees are 
              non-refundable.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms are governed by the laws of New Zealand. Any disputes shall be 
              resolved in the courts of Auckland, New Zealand.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of our services 
              after changes constitutes acceptance of the new terms.
            </p>

            <h2>13. Contact</h2>
            <p>
              For questions about these terms, contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@memoriqr.co.nz<br />
              <strong>Address:</strong> Auckland, New Zealand
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
