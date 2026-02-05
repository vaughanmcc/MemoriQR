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
            MemoriQR Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last Updated: February 2026
            </p>

            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using MemoriQR&apos;s services (including our website, partner portal, 
              and digital memorial services), you agree to be bound by these Terms of Service 
              and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
            <p>
              These terms constitute a legally binding agreement between you and MemoriQR 
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a business registered in Auckland, New Zealand.
            </p>

            <h2>2. Description of Services</h2>
            <p>MemoriQR provides digital memorial services, including:</p>
            <ul>
              <li>Physical NFC tags and laser-engraved QR code Metalphoto® plates</li>
              <li>Hosted memorial web pages with photo galleries, videos, and text tributes</li>
              <li>Prepaid hosting for periods of 5, 10, or 25 years</li>
              <li>Optional annual renewal services after the prepaid period</li>
              <li>Partner wholesale and referral programs for businesses</li>
            </ul>

            <h2 id="refunds">3. Custom Products and No Returns</h2>
            
            <h3>3.1 Custom Nature of Products</h3>
            <p>
              Each MemoriQR product is custom-engraved with a unique memorial code immediately 
              upon order confirmation. This unique code links directly to your memorial&apos;s permanent 
              URL and cannot be transferred or reused. Due to this custom manufacturing process:
            </p>
            <ul>
              <li>Orders cannot be cancelled once payment is confirmed</li>
              <li>Products cannot be returned or refunded</li>
              <li>Products cannot be reused for a different memorial</li>
            </ul>

            <h3>3.2 Quality Guarantee</h3>
            <p>
              Our QR plates are manufactured from Metalphoto® anodised aluminium with sub-surface 
              printing, providing:
            </p>
            <ul>
              <li>20+ years of UV resistance</li>
              <li>8-micron protective anodic layer</li>
              <li>Permanent outdoor durability</li>
            </ul>
            <p>NFC tags are rated for indoor use and general wear conditions.</p>

            <h3>3.3 Free Replacement - Defects</h3>
            <p>
              If your product arrives damaged or doesn&apos;t function as intended (QR code won&apos;t scan, 
              NFC won&apos;t read), we&apos;ll send a free replacement at no cost. You must:
            </p>
            <ul>
              <li>Contact us within 30 days of delivery</li>
              <li>Provide photos of the defective product</li>
              <li>Describe the specific defect or malfunction</li>
            </ul>
            <p>We will issue a replacement with the same memorial code at no charge.</p>

            <h3>3.4 Free Replacement - Lost Shipments</h3>
            <p>
              If your order is lost in transit and tracking confirms non-delivery, we&apos;ll send 
              a free replacement at no cost.
            </p>

            <h3>3.5 Consumer Guarantees Act</h3>
            <p>
              Nothing in these terms limits your rights under the New Zealand Consumer Guarantees 
              Act 1993. Our products come with guarantees that cannot be excluded under the Act. 
              You are entitled to a replacement or refund for a major failure and compensation 
              for any other reasonably foreseeable loss or damage. You are also entitled to have 
              the goods repaired or replaced if the goods fail to be of acceptable quality and 
              the failure does not amount to a major failure.
            </p>

            <h2>4. Hosting Duration and Renewal</h2>

            <h3>4.1 Prepaid Hosting Period</h3>
            <p>
              Your memorial hosting is prepaid for the selected duration (5, 10, or 25 years) 
              from the date of purchase. The hosting period begins when your memorial is activated 
              and published, not from the product purchase date.
            </p>

            <h3>4.2 Expiry Notifications</h3>
            <p>We will send email reminders to the contact email address on file at:</p>
            <ul>
              <li>90 days before expiry</li>
              <li>30 days before expiry</li>
              <li>7 days before expiry</li>
              <li>1 day before expiry</li>
            </ul>
            <p>
              It is your responsibility to ensure your contact email address is current and that 
              you monitor it for renewal notifications.
            </p>

            <h3>4.3 Grace Period</h3>
            <p>After your prepaid period expires:</p>
            <ul>
              <li>Your memorial remains accessible to the public</li>
              <li>A renewal banner appears on the memorial page</li>
              <li>The grace period lasts 30 days from the expiry date</li>
              <li>During this time, you can renew at the standard annual rate</li>
            </ul>

            <h3>4.4 Memorial Suspension</h3>
            <p>If not renewed within 30 days after expiry:</p>
            <ul>
              <li>The memorial is taken offline and becomes inaccessible to the public</li>
              <li>Your memorial data is retained in our secure backup systems</li>
              <li>Data retention continues for 90 days after the grace period ends</li>
              <li>You can restore your memorial during this 90-day period by paying all outstanding fees</li>
            </ul>

            <h3>4.5 Permanent Deletion</h3>
            <p>
              If a memorial remains unpaid for 120 days after the original expiry date (30-day 
              grace period + 90-day retention period), we reserve the right to permanently delete 
              all memorial content, including:
            </p>
            <ul>
              <li>All uploaded photos and videos</li>
              <li>All text content and tributes</li>
              <li>Memorial configuration and settings</li>
              <li>All associated data</li>
            </ul>
            <p>Once permanently deleted, memorial content cannot be recovered.</p>

            <h3>4.6 Renewal Rates</h3>
            <p>
              Annual renewal is available at $24 NZD per year. You may also purchase additional 
              multi-year periods at renewal time. All renewal payments are non-refundable once processed.
            </p>

            <h3>4.7 Third-Party Renewals</h3>
            <p>
              Anyone with access to the memorial URL may renew the hosting on behalf of the original 
              purchaser. We do not verify the identity of the person making the renewal payment. 
              Once a renewal payment is processed, it cannot be refunded.
            </p>

            <h3>4.8 Email Delivery</h3>
            <p>We are not responsible for renewal notifications that are not received due to:</p>
            <ul>
              <li>Incorrect or outdated email addresses</li>
              <li>Email filtering or spam blocking</li>
              <li>Email service provider outages</li>
              <li>User failure to monitor email</li>
            </ul>
            <p>
              It is your responsibility to proactively check your memorial&apos;s expiry date and renew in advance.
            </p>

            <h2>5. Memorial URLs and Permanence</h2>

            <h3>5.1 Permanent URLs</h3>
            <p>
              Once a memorial URL is assigned (e.g., memoriqr.co.nz/memorial/name-2026), it remains 
              permanent and cannot be changed. This ensures that physical tags and plates always 
              link to the correct memorial.
            </p>

            <h3>5.2 Slug Assignment</h3>
            <p>
              Memorial URLs are generated automatically based on the deceased&apos;s name and the year 
              of activation. If a URL is already taken, we append a sequential number (e.g., 
              name-2026-2, name-2026-3).
            </p>

            <h3>5.3 URL Ownership</h3>
            <p>
              You do not own the memorial URL. MemoriQR retains all rights to the domain structure 
              and URL paths. However, once assigned, we will not reassign your specific memorial 
              URL to another customer, even after deletion.
            </p>

            <h2>6. Content Ownership and License</h2>

            <h3>6.1 Your Content Ownership</h3>
            <p>
              You retain all ownership rights to photos, videos, and text (&quot;Your Content&quot;) that 
              you upload to create a memorial. We claim no ownership over Your Content.
            </p>

            <h3>6.2 License Grant to MemoriQR</h3>
            <p>By uploading Your Content, you grant MemoriQR a worldwide, non-exclusive, royalty-free license to:</p>
            <ul>
              <li>Host and store Your Content on our servers and third-party hosting services</li>
              <li>Display Your Content on the memorial web page</li>
              <li>Reproduce Your Content for backup and disaster recovery purposes</li>
              <li>Process Your Content for technical delivery (resizing images, transcoding video, etc.)</li>
            </ul>
            <p>
              This license continues for as long as your hosting is active and during any retention 
              periods outlined in Section 4.
            </p>

            <h3>6.3 Marketing Use (With Permission Only)</h3>
            <p>
              We will never use Your Content in our marketing materials without your express written 
              permission. If we wish to feature your memorial as an example, we will contact you 
              separately to request consent.
            </p>

            <h3>6.4 Content Representations</h3>
            <p>By uploading Your Content, you represent and warrant that:</p>
            <ul>
              <li>You own or have the necessary rights to upload and share all Content</li>
              <li>Your Content does not infringe any third-party intellectual property rights</li>
              <li>You have obtained consent from any living individuals whose images appear in Your Content (or their legal guardians if minors)</li>
              <li>Your Content does not violate any applicable laws</li>
              <li>Your Content complies with Section 7 (Acceptable Use)</li>
            </ul>

            <h3>6.5 Content of Deceased Persons</h3>
            <p>
              You represent that you have the legal right to create a memorial for the deceased 
              person and to use their name, image, and likeness for this purpose. In the case of 
              disputes over memorial content, see Section 11 (Dispute Resolution).
            </p>

            <h2>7. Acceptable Use</h2>

            <h3>7.1 Prohibited Content</h3>
            <p>You agree not to upload or share content that:</p>
            <ul>
              <li>Is illegal, harmful, threatening, abusive, harassing, or defamatory</li>
              <li>Contains hate speech, discrimination, or incites violence against any person or group</li>
              <li>Is sexually explicit, pornographic, or exploitative</li>
              <li>Depicts or promotes child abuse or exploitation in any form</li>
              <li>Infringes on intellectual property rights (copyrighted images, music, etc.)</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Violates any applicable New Zealand or international laws</li>
              <li>Impersonates any person or entity</li>
              <li>Contains spam, advertising, or commercial solicitations</li>
            </ul>

            <h3>7.2 Content Moderation</h3>
            <p>We reserve the right to:</p>
            <ul>
              <li>Review any memorial content at any time</li>
              <li>Remove content that violates these terms</li>
              <li>Suspend or terminate memorials for serious or repeated violations</li>
              <li>Report illegal content to appropriate authorities</li>
            </ul>
            <p>We aim to respond to content reports within 5 business days.</p>

            <h3>7.3 User Reports</h3>
            <p>
              If you believe a memorial contains content that violates these terms, please contact 
              us at legal@memoriqr.co.nz with:
            </p>
            <ul>
              <li>The memorial URL</li>
              <li>Description of the violation</li>
              <li>Supporting evidence (screenshots, etc.)</li>
            </ul>

            <h3>7.4 Appeal Process</h3>
            <p>
              If your content is removed, you may appeal by contacting legal@memoriqr.co.nz within 
              14 days. We will review your appeal and respond within 10 business days.
            </p>

            <h2>8. Memorial Editing and Verification</h2>

            <h3>8.1 Initial Creation</h3>
            <p>
              When you create a memorial, you provide an email address for future access. This email 
              becomes the &quot;memorial owner email&quot; and is used for verification.
            </p>

            <h3>8.2 Editing Access</h3>
            <p>To edit an existing memorial, you must:</p>
            <ul>
              <li>Request a verification code via the memorial edit page</li>
              <li>Enter the code sent to the memorial owner email</li>
              <li>Complete edits within your authenticated session</li>
            </ul>

            <h3>8.3 Verification Code Security</h3>
            <p>Verification codes are:</p>
            <ul>
              <li>Valid for 15 minutes</li>
              <li>Single-use only</li>
              <li>Sent only to the registered memorial owner email</li>
            </ul>
            <p>
              You are responsible for keeping your email account secure. We are not liable for 
              unauthorized edits if someone gains access to your email account.
            </p>

            <h3>8.4 Email Changes</h3>
            <p>To change the memorial owner email, you must:</p>
            <ul>
              <li>Have access to the current email address</li>
              <li>Request the change through the edit interface</li>
              <li>Verify both the old and new email addresses</li>
            </ul>

            <h3>8.5 Lost Email Access</h3>
            <p>If you lose access to the memorial owner email, contact support@memoriqr.co.nz with:</p>
            <ul>
              <li>Proof of purchase (order number, receipt, credit card statement)</li>
              <li>Government-issued ID matching the purchaser name</li>
              <li>Details about the memorial (deceased name, memorial URL, approximate purchase date)</li>
            </ul>
            <p>
              We will manually verify your identity before granting access. This process may take 
              5-10 business days.
            </p>

            <h3>8.6 Contested Edits</h3>
            <p>
              In cases where multiple parties claim the right to edit a memorial, we reserve the right to:
            </p>
            <ul>
              <li>Freeze editing until the dispute is resolved</li>
              <li>Request legal documentation (death certificate, will, executor appointment, court order)</li>
              <li>Defer to the original purchaser&apos;s wishes unless overridden by legal authority</li>
            </ul>
            <p>See Section 11 for full dispute resolution procedures.</p>

            <h2>9. Memorial Ownership and Transfer</h2>

            <h3>9.1 Purchaser Rights</h3>
            <p>
              The person or entity who purchases a MemoriQR product has the initial right to create 
              and control the associated memorial.
            </p>

            <h3>9.2 Transfer of Control</h3>
            <p>Memorial control may be transferred to another party through:</p>
            <ul>
              <li>Written authorization from the original purchaser, OR</li>
              <li>Legal documentation such as: death certificate of original purchaser, will or estate 
                documents, court order, executor/administrator appointment</li>
            </ul>

            <h3>9.3 Transfer Process</h3>
            <p>To request a memorial transfer, contact support@memoriqr.co.nz with:</p>
            <ul>
              <li>Current memorial owner&apos;s authorization OR legal documentation</li>
              <li>New owner&apos;s email address</li>
              <li>Government-issued ID for both parties</li>
            </ul>

            <h3>9.4 Business Closures</h3>
            <p>
              If a business that purchased a memorial ceases operations, control may be transferred 
              to immediate family members of the deceased upon provision of:
            </p>
            <ul>
              <li>Proof of business closure</li>
              <li>Death certificate</li>
              <li>Evidence of family relationship</li>
              <li>Government-issued ID</li>
            </ul>

            <h2>10. Third-Party Services</h2>

            <h3>10.1 Hosting Infrastructure</h3>
            <p>MemoriQR relies on third-party service providers to deliver our services:</p>
            <ul>
              <li>Supabase (database hosting)</li>
              <li>Vercel (web hosting)</li>
              <li>Cloudinary (image and video hosting)</li>
              <li>Stripe (payment processing)</li>
              <li>YouTube (video embedding for unlisted videos)</li>
              <li>Gmail/Pipedream (email delivery)</li>
            </ul>

            <h3>10.2 Service Availability</h3>
            <p>While we strive for 99.9% uptime, we cannot guarantee uninterrupted service due to:</p>
            <ul>
              <li>Third-party service provider outages</li>
              <li>Scheduled maintenance</li>
              <li>DDoS attacks or security incidents</li>
              <li>Force majeure events (see Section 21)</li>
            </ul>

            <h3>10.3 Data Location</h3>
            <p>Your Content may be stored on servers located outside of New Zealand, including but not limited to:</p>
            <ul>
              <li>United States (Supabase, Vercel, Cloudinary)</li>
              <li>European Union (Cloudinary CDN)</li>
              <li>Australia (CDN edge locations)</li>
            </ul>
            <p>
              By using our services, you consent to international data transfers as described in our Privacy Policy.
            </p>

            <h3>10.4 Third-Party Terms</h3>
            <p>
              Your use of our services is also subject to the terms and privacy policies of our 
              third-party providers. We are not responsible for any changes to, or discontinuation of, 
              third-party services.
            </p>

            <h3>10.5 Service Migration</h3>
            <p>
              We reserve the right to migrate to alternative service providers if necessary. We will 
              make reasonable efforts to maintain service continuity during any migration.
            </p>

            <h2>11. Dispute Resolution</h2>

            <h3>11.1 Content Disputes</h3>
            <p>If multiple parties claim the right to control a memorial&apos;s content:</p>
            <ul>
              <li>We will freeze editing access to prevent further changes</li>
              <li>All parties must submit their claims to disputes@memoriqr.co.nz with supporting documentation</li>
              <li>We will review claims within 10 business days</li>
              <li>We may request additional documentation, including: death certificates, wills/estate documents, 
                executor appointments, court orders</li>
              <li>Our decision will be based on legal authority and original purchase records</li>
            </ul>

            <h3>11.2 Escalation</h3>
            <p>If parties cannot agree with our determination, they must resolve the dispute through:</p>
            <ul>
              <li>Mediation (preferred method - see 11.3)</li>
              <li>New Zealand courts (see 11.4)</li>
            </ul>

            <h3>11.3 Mediation</h3>
            <p>
              Before pursuing court action, parties agree to attempt mediation through a mutually 
              agreed mediator or the Resolution Institute of New Zealand. Each party will bear their 
              own mediation costs.
            </p>

            <h3>11.4 Jurisdiction</h3>
            <p>
              Any disputes that cannot be resolved through mediation shall be resolved in the courts 
              of Auckland, New Zealand, under New Zealand law.
            </p>

            <h3>11.5 Memorial Access During Disputes</h3>
            <p>During any dispute resolution process:</p>
            <ul>
              <li>The memorial remains accessible to the public</li>
              <li>Editing is frozen for all parties</li>
              <li>Hosting fees continue to apply</li>
              <li>Failure to pay hosting fees may result in suspension per Section 4</li>
            </ul>

            <h2>12. Partner Program Terms</h2>

            <h3>12.1 Partner Types and Eligibility</h3>
            <p>MemoriQR offers partnership opportunities to legitimate businesses including:</p>
            <ul>
              <li>Veterinary clinics</li>
              <li>Pet stores and groomers</li>
              <li>Pet crematoriums</li>
              <li>Animal shelters and rescues</li>
              <li>Breeders</li>
              <li>Funeral homes</li>
              <li>Cemeteries and memorial parks</li>
              <li>Hospice organizations</li>
              <li>Other memorial-related businesses (subject to approval)</li>
            </ul>

            <h3>12.2 Partnership Application</h3>
            <p>To become a partner:</p>
            <ul>
              <li>Submit an application via memoriqr.co.nz/partners</li>
              <li>Provide business registration documentation</li>
              <li>Wait for approval (typically 3-5 business days)</li>
              <li>Receive welcome email with partner portal access</li>
            </ul>

            <h3>12.3 Application Approval</h3>
            <p>We reserve the right to:</p>
            <ul>
              <li>Approve or reject any partnership application at our sole discretion</li>
              <li>Request additional documentation before approval</li>
              <li>Suspend or terminate partnerships for violations of these terms</li>
            </ul>

            <h3>12.4 Rejection and Appeals</h3>
            <p>If your application is rejected:</p>
            <ul>
              <li>You will receive an email with the reason for rejection</li>
              <li>You may appeal by providing additional information within 30 days</li>
              <li>Repeated applications after rejection may be declined without review</li>
            </ul>

            <h3>12.5 Partner Code Types</h3>
            <p>Partners may access two types of codes:</p>
            <p><strong>A) WHOLESALE ACTIVATION CODES</strong></p>
            <ul>
              <li>Format: MQR-5N-XXXXXX (5-year), MQR-10N-XXXXXX (10-year), MQR-25N-XXXXXX (25-year)</li>
              <li>Partner purchases codes at wholesale price</li>
              <li>Partner sells to customers at retail price</li>
              <li>Partner keeps the markup as profit</li>
              <li>No commission paid by MemoriQR</li>
            </ul>
            <p><strong>B) LEAD GENERATION REFERRAL CODES</strong></p>
            <ul>
              <li>Format: REF-XXXXX</li>
              <li>Customer applies code at checkout for a discount</li>
              <li>Partner receives commission when code is redeemed</li>
              <li>No upfront cost to partner</li>
              <li>Commission rates set by MemoriQR (typically 10-20% of order value)</li>
            </ul>

            <h3>12.6 Wholesale Code Terms</h3>
            <p>When purchasing wholesale activation codes:</p>
            <ul>
              <li>Payment is due immediately via invoice or credit card</li>
              <li>Codes are generated and assigned within 24 hours of payment</li>
              <li>Codes do not expire</li>
              <li>Codes cannot be refunded or returned once generated</li>
              <li>Unused codes remain in your partner account indefinitely</li>
              <li>You are responsible for tracking which codes you&apos;ve sold to customers</li>
            </ul>

            <h3>12.7 Referral Code Terms</h3>
            <p>When using referral codes:</p>
            <ul>
              <li>Codes are generated at no cost to you</li>
              <li>You may request additional codes through your partner portal</li>
              <li>Codes may have expiry dates set by MemoriQR</li>
              <li>Discount and commission percentages may vary by code batch</li>
              <li>We will notify you by email when your codes are redeemed (unless you opt out)</li>
            </ul>

            <h3>12.8 Commission Structure</h3>
            <p>For referral codes:</p>
            <ul>
              <li>Commission percentage is set when codes are generated</li>
              <li>Commission is calculated on the total order value (excluding shipping)</li>
              <li>Commission is tracked in your partner portal</li>
              <li>Commission is classified as &quot;pending&quot; until the customer activates their memorial</li>
              <li>Once activated, commission becomes &quot;approved&quot; and eligible for payout</li>
            </ul>

            <h3>12.9 Commission Payments</h3>
            <p>Commission payouts:</p>
            <ul>
              <li>Are processed monthly for approved commissions exceeding $50 NZD</li>
              <li>Require valid banking details on file</li>
              <li>Are paid via direct bank transfer within 14 days of month-end</li>
              <li>May be withheld if your partnership is suspended</li>
              <li>Are forfeited if your partnership is terminated for cause</li>
            </ul>

            <h3>12.10 Banking Details</h3>
            <p>You must provide accurate banking information:</p>
            <ul>
              <li>Bank account holder name (must match business name)</li>
              <li>Bank account number</li>
              <li>Bank name and branch</li>
            </ul>
            <p>We are not responsible for payment delays due to incorrect banking information.</p>

            <h3>12.11 Tax Obligations</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>Declaring all commission income to Inland Revenue</li>
              <li>Registering for GST if required</li>
              <li>Paying all applicable taxes</li>
              <li>Providing an IRD number if requested</li>
            </ul>

            <h3>12.12 Code Usage Restrictions</h3>
            <p>Partners agree to:</p>
            <ul>
              <li>Use codes only for legitimate memorial sales</li>
              <li>Not sell or transfer codes to other businesses</li>
              <li>Not post codes publicly online (except in direct customer communications)</li>
              <li>Not engage in fraudulent or deceptive practices</li>
              <li>Accurately represent MemoriQR products and services</li>
            </ul>

            <h3>12.13 Marketing and Branding</h3>
            <p>Partners may:</p>
            <ul>
              <li>Download approved marketing materials from the partner portal</li>
              <li>Use MemoriQR logos and branding in accordance with our brand guidelines</li>
              <li>Describe themselves as &quot;MemoriQR Authorized Partner&quot;</li>
            </ul>
            <p>Partners may not:</p>
            <ul>
              <li>Create their own MemoriQR marketing materials without approval</li>
              <li>Modify our logos or branding</li>
              <li>Make false claims about product features or pricing</li>
              <li>Imply exclusive partnership or special status without authorization</li>
            </ul>

            <h3>12.14 Partner Notifications</h3>
            <p>We will send email notifications for:</p>
            <ul>
              <li>Partnership approval/rejection</li>
              <li>Code generation (wholesale and referral)</li>
              <li>Referral code redemption (opt-out available)</li>
              <li>Commission approval</li>
              <li>Terms updates (discount %, commission %, shipping)</li>
              <li>Partnership suspension or termination</li>
              <li>Security changes (email or banking details)</li>
            </ul>
            <p>You may opt out of referral redemption notifications in your partner settings.</p>

            <h3>12.15 Partner Session Security</h3>
            <p>Partner portal sessions:</p>
            <ul>
              <li>Default to 1-hour timeout with automatic extension for active users</li>
              <li>May be extended to 24 hours via &quot;Trust this device&quot; option</li>
              <li>&quot;Trust this device&quot; should only be used on personal, secure computers</li>
              <li>You can revoke trusted device sessions in your partner settings</li>
            </ul>

            <h3>12.16 Partner Responsibilities</h3>
            <p>Partners must:</p>
            <ul>
              <li>Keep login credentials secure</li>
              <li>Notify us immediately of any security breaches</li>
              <li>Maintain current contact information</li>
              <li>Respond to customer inquiries about MemoriQR products</li>
              <li>Honor all promotional terms associated with referral codes</li>
            </ul>

            <h3>12.17 Partnership Suspension</h3>
            <p>We may suspend your partnership for:</p>
            <ul>
              <li>Violation of these terms</li>
              <li>Fraudulent activity</li>
              <li>Customer complaints</li>
              <li>Non-payment of outstanding invoices (for wholesale partners)</li>
              <li>Misuse of codes</li>
            </ul>
            <p>During suspension:</p>
            <ul>
              <li>Your partner portal access is revoked</li>
              <li>Your codes are deactivated</li>
              <li>Pending commissions are withheld</li>
              <li>You cannot generate new codes</li>
            </ul>

            <h3>12.18 Partnership Termination</h3>
            <p>We may terminate your partnership immediately for:</p>
            <ul>
              <li>Serious or repeated violations of these terms</li>
              <li>Illegal activity</li>
              <li>Damage to MemoriQR&apos;s reputation</li>
              <li>At our discretion with 30 days&apos; notice for any reason</li>
            </ul>
            <p>Upon termination:</p>
            <ul>
              <li>Unused wholesale codes are forfeited (no refund)</li>
              <li>Pending commissions are forfeited if termination is for cause</li>
              <li>Approved commissions will be paid out if termination is not for cause</li>
              <li>You must immediately cease representing yourself as a MemoriQR partner</li>
              <li>You must remove all MemoriQR branding from your materials</li>
            </ul>

            <h3>12.19 Data Retention</h3>
            <p>Partner data is retained according to our Privacy Policy:</p>
            <ul>
              <li>During active partnership: all data retained</li>
              <li>After termination: transactional data retained for 7 years (tax compliance)</li>
              <li>Marketing data deleted within 30 days of termination</li>
              <li>You may request early deletion except for legally required records</li>
            </ul>

            <h2>13. Shipping</h2>

            <h3>13.1 Shipping Regions</h3>
            <p>We currently ship to:</p>
            <ul>
              <li>All regions within New Zealand</li>
              <li>Australia (additional fees apply)</li>
            </ul>

            <h3>13.2 Shipping Times</h3>
            <p>Estimated delivery times from dispatch:</p>
            <ul>
              <li>New Zealand: 3-7 business days</li>
              <li>Australia: 7-14 business days</li>
            </ul>
            <p>These are estimates only. We are not responsible for courier delays.</p>

            <h3>13.3 Shipping Costs</h3>
            <p>Shipping costs are calculated at checkout based on:</p>
            <ul>
              <li>Destination country and region</li>
              <li>Product size and weight</li>
              <li>Current courier rates</li>
            </ul>
            <p>Some partner referral codes include free shipping.</p>

            <h3>13.4 Tracking</h3>
            <p>All orders include tracking information sent via email once dispatched.</p>

            <h3>13.5 Delivery Failures</h3>
            <p>If delivery fails due to:</p>
            <ul>
              <li>Incorrect address provided by customer: customer must pay redelivery fees</li>
              <li>Customer unavailable for signature: courier will attempt redelivery per their standard process</li>
              <li>Customer refuses delivery: no refund; product cannot be reused</li>
              <li>Courier error or lost parcel: we will send free replacement</li>
            </ul>

            <h3>13.6 Customs and Duties (Australia)</h3>
            <p>For Australian shipments:</p>
            <ul>
              <li>Customer is responsible for any import duties or taxes</li>
              <li>Customs delays are beyond our control</li>
              <li>Refused shipments due to customs fees are non-refundable</li>
            </ul>

            <h2>14. Pricing and Payment</h2>

            <h3>14.1 Pricing</h3>
            <p>All prices are displayed in:</p>
            <ul>
              <li>New Zealand Dollars (NZD) for New Zealand customers</li>
              <li>Australian Dollars (AUD) for Australian customers</li>
            </ul>
            <p>Prices are subject to change without notice, but you will be charged the price displayed at the time of purchase.</p>

            <h3>14.2 Payment Methods</h3>
            <p>We accept:</p>
            <ul>
              <li>Credit cards (Visa, Mastercard, American Express)</li>
              <li>Debit cards</li>
              <li>Digital wallets (Apple Pay, Google Pay)</li>
            </ul>
            <p>All payments are processed securely through Stripe.</p>

            <h3>14.3 Payment Authorization</h3>
            <p>By providing payment information, you authorize us to charge:</p>
            <ul>
              <li>The order total at time of purchase</li>
              <li>Any applicable renewal fees on expiry</li>
              <li>Any restoration fees if applicable</li>
            </ul>

            <h3>14.4 Failed Payments</h3>
            <p>If a payment fails:</p>
            <ul>
              <li>We will attempt to charge the card up to 3 times</li>
              <li>You will receive email notifications of failed attempts</li>
              <li>Continued failure may result in memorial suspension per Section 4</li>
            </ul>

            <h3>14.5 Currency Conversion</h3>
            <p>
              If your card is issued in a different currency, your bank will perform the conversion 
              and may charge foreign transaction fees. We have no control over these fees.
            </p>

            <h3>14.6 Refunds</h3>
            <p>Due to the custom nature of our products, we do not offer refunds except:</p>
            <ul>
              <li>As required by the Consumer Guarantees Act (Section 3.5)</li>
              <li>For double charges or billing errors (will be refunded within 5 business days)</li>
            </ul>

            <h2>15. Intellectual Property</h2>

            <h3>15.1 MemoriQR Trademarks</h3>
            <p>
              &quot;MemoriQR,&quot; our logo, and all related branding are trademarks owned by MemoriQR. 
              You may not use our trademarks without written permission, except:
            </p>
            <ul>
              <li>Partners using approved materials from the partner portal</li>
              <li>Fair use for descriptive purposes (e.g., &quot;I purchased from MemoriQR&quot;)</li>
            </ul>

            <h3>15.2 Website Content</h3>
            <p>
              All content on memoriqr.co.nz, including text, images, graphics, and code, is owned 
              by MemoriQR or our licensors and is protected by copyright and other intellectual 
              property laws.
            </p>

            <h3>15.3 License to Use Website</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access and use 
              our website for its intended purpose. You may not:
            </p>
            <ul>
              <li>Copy, modify, or distribute our website content</li>
              <li>Reverse engineer our platform</li>
              <li>Use automated tools to scrape our website</li>
              <li>Frame or mirror our website without permission</li>
            </ul>

            <h3>15.4 Memorial Page URLs</h3>
            <p>
              While you have a license to use your specific memorial page URL, MemoriQR retains 
              all rights to:
            </p>
            <ul>
              <li>The memoriqr.co.nz domain</li>
              <li>The URL structure and routing</li>
              <li>The memorial page design and layout</li>
              <li>Any MemoriQR branding on memorial pages</li>
            </ul>

            <h2>16. Privacy and Data Protection</h2>

            <h3>16.1 Privacy Policy</h3>
            <p>
              Our collection, use, and disclosure of personal information is governed by our 
              Privacy Policy, which is incorporated into these terms by reference.
            </p>

            <h3>16.2 Data Collection</h3>
            <p>We collect and process:</p>
            <ul>
              <li>Customer information (name, email, address, phone)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Memorial content (photos, videos, text)</li>
              <li>Partner business information and banking details</li>
              <li>Usage data (analytics, session logs)</li>
            </ul>

            <h3>16.3 Data Security</h3>
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>Encryption in transit (TLS/SSL)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Secure third-party service providers</li>
            </ul>
            <p>However, no system is 100% secure. We cannot guarantee absolute security.</p>

            <h3>16.4 Your Privacy Rights</h3>
            <p>Under the New Zealand Privacy Act 2020, you have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information (subject to limitations)</li>
              <li>Restrict processing in certain circumstances</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p>To exercise these rights, contact privacy@memoriqr.co.nz.</p>

            <h3>16.5 Data Retention</h3>
            <p>We retain data as follows:</p>
            <ul>
              <li>Active memorials: indefinitely while hosting is active</li>
              <li>Expired memorials: 120 days after expiry (see Section 4)</li>
              <li>Customer order data: 7 years (tax compliance)</li>
              <li>Partner transaction data: 7 years (tax compliance)</li>
              <li>Marketing data: until consent is withdrawn</li>
            </ul>

            <h3>16.6 Data of Deceased Persons</h3>
            <p>
              Memorial content relates to deceased individuals who cannot provide consent. By 
              creating a memorial, you represent that you have the legal right to share this 
              information and that doing so does not violate any applicable laws or the deceased&apos;s wishes.
            </p>

            <h3>16.7 Data Breach Notification</h3>
            <p>
              In the event of a data breach affecting your personal information, we will notify 
              you as required by the Privacy Act 2020, typically within 72 hours of becoming aware 
              of the breach.
            </p>

            <h2>17. Limitation of Liability</h2>

            <h3>17.1 Service Provided &quot;As Is&quot;</h3>
            <p>
              MemoriQR services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of 
              any kind, either express or implied, including but not limited to:
            </p>
            <ul>
              <li>Warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>

            <h3>17.2 No Liability for Data Loss</h3>
            <p>We are not liable for:</p>
            <ul>
              <li>Loss of memorial content due to user error</li>
              <li>Deletion of expired memorials per Section 4</li>
              <li>Data loss due to third-party service failures</li>
              <li>Corruption of uploaded content</li>
              <li>Accidental deletion by authorized users</li>
            </ul>
            <p>You are responsible for maintaining backup copies of Your Content.</p>

            <h3>17.3 Third-Party Actions</h3>
            <p>We are not liable for:</p>
            <ul>
              <li>Downtime or failures of third-party services (Cloudinary, Supabase, etc.)</li>
              <li>Actions of payment processors (Stripe)</li>
              <li>Courier delays or lost shipments (except as stated in Section 3.4)</li>
              <li>Email delivery failures</li>
              <li>Actions of partners or other users</li>
            </ul>

            <h3>17.4 Indirect Damages</h3>
            <p>To the maximum extent permitted by New Zealand law, we are not liable for:</p>
            <ul>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits or revenue</li>
              <li>Loss of business opportunities</li>
              <li>Emotional distress</li>
              <li>Punitive damages</li>
            </ul>

            <h3>17.5 Maximum Liability</h3>
            <p>
              Our total liability to you for any claims arising from these terms or our services 
              shall not exceed the amount you paid to MemoriQR in the 12 months preceding the claim.
            </p>

            <h3>17.6 Consumer Guarantees Act</h3>
            <p>
              Nothing in this section limits or excludes any liability that cannot be limited or 
              excluded under the Consumer Guarantees Act 1993 or other applicable New Zealand 
              consumer protection laws.
            </p>

            <h2>18. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless MemoriQR, its directors, officers, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses 
              (including reasonable legal fees) arising from:
            </p>
            <ul>
              <li>Your violation of these terms</li>
              <li>Your violation of any law or regulation</li>
              <li>Your infringement of any third-party rights (intellectual property, privacy, etc.)</li>
              <li>Your Content uploaded to our services</li>
              <li>Your use of partner codes or partnership privileges (if applicable)</li>
            </ul>
            <p>This indemnification obligation survives termination of these terms.</p>

            <h2>19. Account Termination</h2>

            <h3>19.1 Your Right to Terminate</h3>
            <p>
              You may request closure of your memorial or partner account at any time by contacting 
              support@memoriqr.co.nz.
            </p>
            <p>Upon closure:</p>
            <ul>
              <li>Hosting fees already paid are non-refundable</li>
              <li>Memorial content will be deleted immediately (no grace period)</li>
              <li>Partner accounts: see Section 12.18</li>
            </ul>

            <h3>19.2 Our Right to Terminate</h3>
            <p>We may suspend or terminate your access to our services:</p>
            <ul>
              <li>For violation of these terms</li>
              <li>For illegal activity</li>
              <li>For non-payment of fees</li>
              <li>To comply with legal requirements</li>
              <li>If we discontinue our services (with 90 days&apos; notice)</li>
            </ul>

            <h3>19.3 Effect of Termination</h3>
            <p>Upon termination:</p>
            <ul>
              <li>Your right to access memorial content ends immediately</li>
              <li>Outstanding hosting fees remain due</li>
              <li>Your Content may be deleted per our retention policies</li>
              <li>These terms continue to apply to past use of services</li>
            </ul>

            <h3>19.4 Business Closure</h3>
            <p>If MemoriQR permanently ceases operations, we will:</p>
            <ul>
              <li>Provide 90 days&apos; notice where possible</li>
              <li>Allow customers to download their memorial content</li>
              <li>Attempt to arrange service transfer to another provider</li>
              <li>Delete all customer data per our Privacy Policy if transfer is not possible</li>
            </ul>

            <h2>20. Changes to Terms</h2>

            <h3>20.1 Right to Modify</h3>
            <p>We reserve the right to modify these terms at any time. Changes may be made to:</p>
            <ul>
              <li>Reflect changes in our services</li>
              <li>Comply with legal requirements</li>
              <li>Improve clarity or address ambiguities</li>
              <li>Adjust pricing or payment terms</li>
            </ul>

            <h3>20.2 Notification of Changes</h3>
            <p>For material changes, we will:</p>
            <ul>
              <li>Post the updated terms on our website with the revision date</li>
              <li>Send email notification to registered customers</li>
              <li>Provide at least 30 days&apos; notice before material changes take effect</li>
            </ul>

            <h3>20.3 Acceptance of Changes</h3>
            <p>
              Continued use of our services after changes take effect constitutes acceptance of 
              the new terms. If you do not agree with the changes, you must stop using our services 
              before they take effect.
            </p>

            <h2>21. Force Majeure</h2>
            <p>
              We are not liable for any failure or delay in performing our obligations due to 
              circumstances beyond our reasonable control, including but not limited to:
            </p>
            <ul>
              <li>Natural disasters (earthquakes, floods, fires)</li>
              <li>Acts of war, terrorism, or civil unrest</li>
              <li>Government actions or regulations</li>
              <li>Pandemics or public health emergencies</li>
              <li>Internet or telecommunications failures</li>
              <li>Power outages</li>
              <li>Third-party service provider failures</li>
            </ul>
            <p>
              We will make reasonable efforts to resume service as soon as practicable and will 
              keep you informed of any extended disruptions.
            </p>

            <h2>22. Contact Information</h2>

            <h3>General Enquiries</h3>
            <p>
              Email: <a href="mailto:info@memoriqr.co.nz">info@memoriqr.co.nz</a>
            </p>

            <h3>Customer Support</h3>
            <p>
              Email: <a href="mailto:support@memoriqr.co.nz">support@memoriqr.co.nz</a>
            </p>

            <h3>Legal and Disputes</h3>
            <p>
              Email: <a href="mailto:legal@memoriqr.co.nz">legal@memoriqr.co.nz</a><br />
              Email: <a href="mailto:disputes@memoriqr.co.nz">disputes@memoriqr.co.nz</a>
            </p>

            <h3>Privacy Requests</h3>
            <p>
              Email: <a href="mailto:privacy@memoriqr.co.nz">privacy@memoriqr.co.nz</a>
            </p>

            <h3>Partner Program</h3>
            <p>
              Email: <a href="mailto:partners@memoriqr.co.nz">partners@memoriqr.co.nz</a>
            </p>

            <h3>Mailing Address</h3>
            <p>
              MemoriQR<br />
              Auckland, New Zealand
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p>
                These Terms of Service are effective as of February 2026.
              </p>
              <p>
                Thank you for choosing MemoriQR to help you create lasting memorials for your loved ones.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
