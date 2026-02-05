import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service (Australia)',
  description: 'MemoriQR Terms of Service for Australian customers.',
}

export default function AUTermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container-narrow py-16 md:py-24">
          <h1 className="text-4xl font-serif text-gray-900 mb-8">
            Terms of Service (Australia)
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last updated: February 2026
            </p>

            <p className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              These terms apply to customers in Australia. For New Zealand customers, 
              please see our <a href="/terms">New Zealand Terms of Service</a>.
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
              <strong>Renewal:</strong> After your prepaid period ends, you may renew for A$29/year 
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
              and text you upload. By uploading, you grant MemoriQR a licence to host and display 
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
              <li>Violates any applicable Australian laws</li>
            </ul>
            <p>
              We reserve the right to remove any content that violates these terms and to 
              terminate accounts for serious or repeated violations.
            </p>

            <h2>6. Physical Products</h2>
            <p>
              <strong>Custom Products:</strong> Each MemoriQR product is custom-engraved with a 
              unique code immediately upon order. Products cannot be cancelled, returned, or 
              reused once created.
            </p>
            <p>
              <strong>Quality:</strong> Our QR plates are made from Metalphoto® anodised aluminium 
              with sub-surface printing, providing 20+ years of UV resistance and an 8 micron 
              protective anodic layer. They are designed for permanent outdoor use. 
              NFC tags are rated for indoor use.
            </p>
            <p>
              <strong>Shipping:</strong> We ship to Australia from New Zealand. Delivery times 
              are estimates and may vary. International shipping typically takes 5-10 business days.
            </p>

            <h2 id="refunds">7. Refunds, Replacements and Consumer Guarantees</h2>
            <p>
              <strong>Australian Consumer Law:</strong> Our goods and services come with guarantees 
              that cannot be excluded under the Australian Consumer Law (ACL). You are entitled to 
              a replacement or refund for a major failure and compensation for any other reasonably 
              foreseeable loss or damage. You are also entitled to have the goods repaired or 
              replaced if the goods fail to be of acceptable quality and the failure does not 
              amount to a major failure.
            </p>
            <p>
              <strong>Custom Products:</strong> Due to the custom nature of our products (each item 
              is engraved with a unique code immediately upon order), change of mind refunds are 
              not available. This does not affect your consumer guarantee rights.
            </p>
            <p>
              <strong>Free Replacement - Defects:</strong> If your product arrives damaged or 
              doesn't function as intended (QR won't scan, NFC won't read), we'll send a free 
              replacement at no cost. Contact us within a reasonable time of delivery with photos 
              of the defective product.
            </p>
            <p>
              <strong>Free Replacement - Lost Shipments:</strong> If your order is lost in 
              transit and tracking confirms non-delivery, we'll send a free replacement.
            </p>
            <p>
              <strong>Hosting Renewals:</strong> Renewal payments are non-refundable once processed, 
              except where required by law.
            </p>
            <p>
              <strong>Consumer Complaints:</strong> If you have a complaint about our products or 
              services, please contact us first. If we cannot resolve your complaint, you may 
              contact the <a href="https://www.accc.gov.au" target="_blank" rel="noopener">
              Australian Competition &amp; Consumer Commission (ACCC)</a> or your state/territory 
              consumer protection agency.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the extent permitted by law, MemoriQR provides its services "as is". Where 
              liability cannot be excluded under the Australian Consumer Law, our liability is 
              limited to:
            </p>
            <ul>
              <li>Replacement of the goods or supply of equivalent goods</li>
              <li>Repair of the goods</li>
              <li>Payment of the cost of replacing or repairing the goods</li>
            </ul>
            <p>
              We are not liable for indirect, incidental, or consequential damages except where 
              such liability cannot be excluded by law.
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
              non-refundable except where required by law.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              For Australian customers, these terms are governed by the laws of New South Wales, 
              Australia, and you submit to the non-exclusive jurisdiction of the courts of 
              New South Wales. Nothing in these terms excludes, restricts, or modifies any 
              consumer rights under the Australian Consumer Law.
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
              <strong>Business Location:</strong> Auckland, New Zealand<br />
              <strong>ABN:</strong> Not applicable (NZ business)
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
