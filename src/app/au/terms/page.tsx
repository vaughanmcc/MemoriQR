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

            {/* Section 1 */}
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using MemoriQR's services (including our website, partner 
              portal, and digital memorial services), you agree to be bound by these Terms 
              of Service and our <a href="/au/privacy">Privacy Policy</a>. If you do not agree to these terms, please 
              do not use our services.
            </p>
            <p>
              These terms constitute a legally binding agreement between you and MemoriQR 
              ("we," "us," or "our"), a business registered in Auckland, New Zealand, 
              operating in Australia.
            </p>

            {/* Section 2 */}
            <h2>2. Description of Services</h2>
            <p>MemoriQR provides digital memorial services, including:</p>
            <ol type="a">
              <li>Physical NFC tags and laser-engraved QR code Metalphoto® plates</li>
              <li>Hosted memorial web pages with photo galleries, videos, and text tributes</li>
              <li>Prepaid hosting for periods of 5, 10, or 25 years</li>
              <li>Optional annual renewal services after the prepaid period</li>
              <li>Partner wholesale and referral programs for businesses</li>
            </ol>

            {/* Section 3 */}
            <h2 id="refunds">3. Custom Products and No Returns</h2>
            
            <h3>3.1 Custom Nature of Products</h3>
            <p>
              Each MemoriQR product is custom-engraved with a unique memorial code 
              immediately upon order confirmation. This unique code links directly to your 
              memorial's permanent URL and cannot be transferred or reused. Due to this 
              custom manufacturing process:
            </p>
            <ol type="a">
              <li>Orders cannot be cancelled once payment is confirmed</li>
              <li>Products cannot be returned or refunded</li>
              <li>Products cannot be reused for a different memorial</li>
            </ol>

            <h3>3.2 Quality Guarantee</h3>
            <p>
              Our QR plates are manufactured from Metalphoto® anodised aluminium with 
              sub-surface printing, providing:
            </p>
            <ol type="a">
              <li>20+ years of UV resistance</li>
              <li>8-micron protective anodic layer</li>
              <li>Permanent outdoor durability</li>
            </ol>
            <p>NFC tags are rated for indoor use and general wear conditions.</p>

            <h3>3.3 Free Replacement - Defects</h3>
            <p>
              If your product arrives damaged or doesn't function as intended (QR code won't 
              scan, NFC won't read), we'll send a free replacement at no cost. You must:
            </p>
            <ol type="a">
              <li>Contact us within 30 days of delivery</li>
              <li>Provide photos of the defective product</li>
              <li>Describe the specific defect or malfunction</li>
            </ol>
            <p>We will issue a replacement with the same memorial code at no charge.</p>

            <h3>3.4 Free Replacement - Lost Shipments</h3>
            <p>
              If your order is lost in transit and tracking confirms non-delivery, we'll 
              send a free replacement at no cost.
            </p>

            <h3>3.5 Australian Consumer Law</h3>
            <p>
              Nothing in these terms limits your rights under the Australian Consumer Law 
              (ACL). Our products come with guarantees that cannot be excluded under the 
              ACL. For major failures with the service, you are entitled to:
            </p>
            <ol type="a">
              <li>Cancel your service contract with us; and</li>
              <li>Obtain a refund for the unused portion, or compensation for its reduced value</li>
            </ol>
            <p>
              You are also entitled to be compensated for any other reasonably foreseeable 
              loss or damage. If the failure does not amount to a major failure, you are 
              entitled to have problems rectified within a reasonable time and, if this is 
              not done, to cancel your contract and obtain a refund for the unused portion.
            </p>

            {/* Section 4 */}
            <h2>4. Hosting Duration and Renewal</h2>

            <h3>4.1 Prepaid Hosting Period</h3>
            <p>
              Your memorial hosting is prepaid for the selected duration (5, 10, or 25 
              years) from the date of purchase. The hosting period begins when your memorial 
              is activated and published, not from the product purchase date.
            </p>

            <h3>4.2 Expiry Notifications</h3>
            <p>We will send email reminders to the contact email address on file at:</p>
            <ol type="a">
              <li>90 days before expiry</li>
              <li>30 days before expiry</li>
              <li>7 days before expiry</li>
              <li>1 day before expiry</li>
            </ol>
            <p>
              It is your responsibility to ensure your contact email address is current and 
              that you monitor it for renewal notifications.
            </p>

            <h3>4.3 Grace Period</h3>
            <p>After your prepaid period expires:</p>
            <ol type="a">
              <li>Your memorial remains accessible to the public</li>
              <li>A renewal banner appears on the memorial page</li>
              <li>The grace period lasts 30 days from the expiry date</li>
              <li>During this time, you can renew at the standard annual rate</li>
            </ol>

            <h3>4.4 Memorial Suspension</h3>
            <p>If not renewed within 30 days after expiry:</p>
            <ol type="a">
              <li>The memorial is taken offline and becomes inaccessible to the public</li>
              <li>Your memorial data is retained in our secure backup systems</li>
              <li>Data retention continues for 90 days after the grace period ends</li>
              <li>You can restore your memorial during this 90-day period by paying all outstanding fees</li>
            </ol>

            <h3>4.5 Permanent Deletion</h3>
            <p>
              If a memorial remains unpaid for 120 days after the original expiry date (30-
              day grace period + 90-day retention period), we reserve the right to 
              permanently delete all memorial content, including:
            </p>
            <ol type="a">
              <li>All uploaded photos and videos</li>
              <li>All text content and tributes</li>
              <li>Memorial configuration and settings</li>
              <li>All associated data</li>
            </ol>
            <p>Once permanently deleted, memorial content cannot be recovered.</p>

            <h3>4.6 Renewal Rates</h3>
            <p>
              Annual renewal is available at $36 AUD per year. You may also purchase 
              additional multi-year periods at renewal time. All renewal payments are non-
              refundable once processed.
            </p>

            <h3>4.7 Third-Party Renewals</h3>
            <p>
              Anyone with access to the memorial URL may renew the hosting on behalf of the 
              original purchaser. We do not verify the identity of the person making the 
              renewal payment. Once a renewal payment is processed, it cannot be refunded.
            </p>

            <h3>4.8 Email Delivery</h3>
            <p>We are not responsible for renewal notifications that are not received due to:</p>
            <ol type="a">
              <li>Incorrect or outdated email addresses</li>
              <li>Email filtering or spam blocking</li>
              <li>Email service provider outages</li>
              <li>User failure to monitor email</li>
            </ol>
            <p>
              It is your responsibility to proactively check your memorial's expiry date and 
              renew in advance.
            </p>

            {/* Section 5 */}
            <h2>5. Memorial URLs and Permanence</h2>

            <h3>5.1 Permanent URLs</h3>
            <p>
              Once a memorial URL is assigned (e.g., memoriqr.co.nz/memorial/name-2026), it 
              remains permanent and cannot be changed. This ensures that physical tags and 
              plates always link to the correct memorial.
            </p>

            <h3>5.2 Slug Assignment</h3>
            <p>
              Memorial URLs are generated automatically based on the deceased's name and the 
              year of activation. If a URL is already taken, we append a sequential number 
              (e.g., name-2026-2, name-2026-3).
            </p>

            <h3>5.3 URL Ownership</h3>
            <p>
              You do not own the memorial URL. MemoriQR retains all rights to the domain 
              structure and URL paths. However, once assigned, we will not reassign your 
              specific memorial URL to another customer, even after deletion.
            </p>

            {/* Section 6 */}
            <h2>6. Content Ownership and License</h2>

            <h3>6.1 Your Content Ownership</h3>
            <p>
              You retain all ownership rights to photos, videos, and text ("Your Content") 
              that you upload to create a memorial. We claim no ownership over Your Content.
            </p>

            <h3>6.2 License Grant to MemoriQR</h3>
            <p>
              By uploading Your Content, you grant MemoriQR a worldwide, non-exclusive, 
              royalty-free license to:
            </p>
            <ol type="a">
              <li>Host and store Your Content on our servers and third-party hosting services</li>
              <li>Display Your Content on the memorial web page</li>
              <li>Reproduce Your Content for backup and disaster recovery purposes</li>
              <li>Process Your Content for technical delivery (resizing images, transcoding video, etc.)</li>
            </ol>
            <p>
              This license continues for as long as your hosting is active and during any 
              retention periods outlined in Section 4.
            </p>

            <h3>6.3 Marketing Use (With Permission Only)</h3>
            <p>
              We will never use Your Content in our marketing materials without your express 
              written permission. If we wish to feature your memorial as an example, we will 
              contact you separately to request consent.
            </p>

            <h3>6.4 Content Representations</h3>
            <p>By uploading Your Content, you represent and warrant that:</p>
            <ol type="a">
              <li>You own or have the necessary rights to upload and share all Content</li>
              <li>Your Content does not infringe any third-party intellectual property rights</li>
              <li>You have obtained consent from any living individuals whose images appear 
              in Your Content (or their legal guardians if minors)</li>
              <li>Your Content does not violate any applicable laws</li>
              <li>Your Content complies with Section 7 (Acceptable Use)</li>
            </ol>

            <h3>6.5 Content of Deceased Persons</h3>
            <p>
              You represent that you have the legal right to create a memorial for the 
              deceased person and to use their name, image, and likeness for this purpose. 
              In the case of disputes over memorial content, see Section 11 (Dispute 
              Resolution).
            </p>

            {/* Section 7 */}
            <h2>7. Acceptable Use</h2>

            <h3>7.1 Prohibited Content</h3>
            <p>You agree not to upload or share content that:</p>
            <ol type="a">
              <li>Is illegal, harmful, threatening, abusive, harassing, or defamatory</li>
              <li>Contains hate speech, discrimination, or incites violence against any person or group</li>
              <li>Is sexually explicit, pornographic, or exploitative</li>
              <li>Depicts or promotes child abuse or exploitation in any form</li>
              <li>Infringes on intellectual property rights (copyrighted images, music, etc.)</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Violates any applicable Australian or international laws</li>
              <li>Impersonates any person or entity</li>
              <li>Contains spam, advertising, or commercial solicitations</li>
            </ol>

            <h3>7.2 Content Moderation</h3>
            <p>We reserve the right to:</p>
            <ol type="a">
              <li>Review any memorial content at any time</li>
              <li>Remove content that violates these terms</li>
              <li>Suspend or terminate memorials for serious or repeated violations</li>
              <li>Report illegal content to appropriate authorities</li>
            </ol>
            <p>We aim to respond to content reports within 5 business days.</p>

            <h3>7.3 User Reports</h3>
            <p>
              If you believe a memorial contains content that violates these terms, please 
              contact us at legal@memoriqr.co.nz with:
            </p>
            <ol type="a">
              <li>The memorial URL</li>
              <li>Description of the violation</li>
              <li>Supporting evidence (screenshots, etc.)</li>
            </ol>

            <h3>7.4 Appeal Process</h3>
            <p>
              If your content is removed, you may appeal by contacting legal@memoriqr.co.nz 
              within 14 days. We will review your appeal and respond within 10 business 
              days.
            </p>

            {/* Section 8 */}
            <h2>8. Memorial Editing and Verification</h2>

            <h3>8.1 Initial Creation</h3>
            <p>
              When you create a memorial, you provide an email address for future access. 
              This email becomes the "memorial owner email" and is used for verification.
            </p>

            <h3>8.2 Editing Access</h3>
            <p>To edit an existing memorial, you must:</p>
            <ol type="a">
              <li>Request a verification code via the memorial edit page</li>
              <li>Enter the code sent to the memorial owner email</li>
              <li>Complete edits within your authenticated session</li>
            </ol>

            <h3>8.3 Verification Code Security</h3>
            <p>Verification codes are:</p>
            <ol type="a">
              <li>Valid for 15 minutes</li>
              <li>Single-use only</li>
              <li>Sent only to the registered memorial owner email</li>
            </ol>
            <p>
              You are responsible for keeping your email account secure. We are not liable 
              for unauthorized edits if someone gains access to your email account.
            </p>

            <h3>8.4 Email Changes</h3>
            <p>To change the memorial owner email, you must:</p>
            <ol type="a">
              <li>Have access to the current email address</li>
              <li>Request the change through the edit interface</li>
              <li>Verify both the old and new email addresses</li>
            </ol>

            <h3>8.5 Lost Email Access</h3>
            <p>
              If you lose access to the memorial owner email, contact support@memoriqr.co.nz 
              with:
            </p>
            <ol type="a">
              <li>Proof of purchase (order number, receipt, credit card statement)</li>
              <li>Government-issued ID matching the purchaser name</li>
              <li>Details about the memorial (deceased name, memorial URL, approximate creation date)</li>
            </ol>
            <p>
              We will manually verify your identity before granting access. This process may 
              take 5-10 business days.
            </p>

            <h3>8.6 Contested Edits</h3>
            <p>
              In cases where multiple parties claim the right to edit a memorial, we reserve 
              the right to:
            </p>
            <ol type="a">
              <li>Freeze editing until the dispute is resolved</li>
              <li>Request legal documentation (death certificate, will, executor appointment, court order)</li>
              <li>Defer to the original purchaser's wishes unless overridden by legal authority</li>
            </ol>
            <p>See Section 11 for full dispute resolution procedures.</p>

            {/* Section 9 */}
            <h2>9. Memorial Ownership and Transfer</h2>

            <h3>9.1 Purchaser Rights</h3>
            <p>
              The person or entity who purchases a MemoriQR product has the initial right to 
              create and control the associated memorial.
            </p>

            <h3>9.2 Transfer of Control</h3>
            <p>Memorial control may be transferred to another party through:</p>
            <ol type="a">
              <li>Written authorization from the original purchaser, OR</li>
              <li>Legal documentation such as:
                <ul>
                  <li>Death certificate of original purchaser plus proof of executor/administrator status</li>
                  <li>Court order</li>
                  <li>Power of attorney</li>
                </ul>
              </li>
            </ol>

            <h3>9.3 Transfer Process</h3>
            <p>To request a memorial transfer, contact support@memoriqr.co.nz with:</p>
            <ol type="a">
              <li>Current memorial owner's authorization OR legal documentation</li>
              <li>New owner's email address</li>
              <li>Government-issued ID for both parties</li>
            </ol>

            <h3>9.4 Business Closures</h3>
            <p>
              If a business that purchased a memorial ceases operations, control may be 
              transferred to immediate family members of the deceased upon provision of:
            </p>
            <ol type="a">
              <li>Proof of business closure (ASIC documentation if applicable)</li>
              <li>Death certificate</li>
              <li>Evidence of family relationship</li>
              <li>Government-issued ID</li>
            </ol>

            {/* Section 10 */}
            <h2>10. Third-Party Services</h2>

            <h3>10.1 Hosting Infrastructure</h3>
            <p>MemoriQR relies on third-party service providers to deliver our services:</p>
            <ol type="a">
              <li>Supabase (database hosting)</li>
              <li>Vercel (web hosting)</li>
              <li>Cloudinary (image and video hosting)</li>
              <li>Stripe (payment processing)</li>
              <li>YouTube (video embedding for unlisted videos)</li>
              <li>Gmail/Pipedream (email delivery)</li>
            </ol>

            <h3>10.2 Service Availability</h3>
            <p>While we strive for 99.9% uptime, we cannot guarantee uninterrupted service due to:</p>
            <ol type="a">
              <li>Third-party service provider outages</li>
              <li>Scheduled maintenance</li>
              <li>DDoS attacks or security incidents</li>
              <li>Force majeure events (see Section 21)</li>
            </ol>

            <h3>10.3 Data Location</h3>
            <p>
              Your Content may be stored on servers located outside of Australia, including 
              but not limited to:
            </p>
            <ol type="a">
              <li>United States (Supabase, Vercel, Cloudinary)</li>
              <li>European Union (Cloudinary CDN)</li>
              <li>New Zealand (CDN edge locations)</li>
            </ol>
            <p>
              By using our services, you consent to international data transfers as 
              described in our Privacy Policy. We comply with the Australian Privacy 
              Principles regarding overseas data transfers.
            </p>

            <h3>10.4 Third-Party Terms</h3>
            <p>
              Your use of our services is also subject to the terms and privacy policies of 
              our third-party providers. We are not responsible for any changes to, or 
              discontinuation of, third-party services.
            </p>

            <h3>10.5 Service Migration</h3>
            <p>
              We reserve the right to migrate to alternative service providers if necessary. 
              We will make reasonable efforts to maintain service continuity during any 
              migration.
            </p>

            {/* Section 11 */}
            <h2>11. Dispute Resolution</h2>

            <h3>11.1 Content Disputes</h3>
            <p>If multiple parties claim the right to control a memorial's content:</p>
            <ol type="a">
              <li>We will freeze editing access to prevent further changes</li>
              <li>All parties must submit their claims to disputes@memoriqr.co.nz with supporting documentation</li>
              <li>We will review claims within 10 business days</li>
              <li>We may request additional documentation, including:
                <ul>
                  <li>Death certificate</li>
                  <li>Evidence of family relationship</li>
                  <li>Will or estate documentation</li>
                  <li>Court orders</li>
                </ul>
              </li>
              <li>Our decision will be based on legal authority and original purchase records</li>
            </ol>

            <h3>11.2 Escalation</h3>
            <p>If parties cannot agree with our determination, they must resolve the dispute through:</p>
            <ol type="a">
              <li>Mediation (preferred method - see 11.3)</li>
              <li>Relevant Australian court jurisdiction (see 11.4)</li>
            </ol>

            <h3>11.3 Mediation</h3>
            <p>
              Before pursuing court action, parties agree to attempt mediation through a 
              mutually agreed mediator or a recognized Australian dispute resolution 
              service. Each party will bear their own mediation costs.
            </p>

            <h3>11.4 Jurisdiction</h3>
            <p>
              Any disputes that cannot be resolved through mediation shall be resolved under 
              Australian law. The specific jurisdiction depends on the total claim amount:
            </p>
            <ol type="a">
              <li>Claims under $10,000: Australian state/territory small claims tribunals or equivalent</li>
              <li>Claims over $10,000: Courts with appropriate jurisdiction in the state or territory where the claimant resides</li>
            </ol>

            <h3>11.5 Memorial Access During Disputes</h3>
            <p>During any dispute resolution process:</p>
            <ol type="a">
              <li>The memorial remains accessible to the public</li>
              <li>Editing is frozen for all parties</li>
              <li>Hosting fees continue to apply</li>
              <li>Failure to pay hosting fees may result in suspension per Section 4</li>
            </ol>

            {/* Section 12 */}
            <h2>12. Partner Program Terms</h2>

            <h3>12.1 Partner Types and Eligibility</h3>
            <p>MemoriQR offers partnership opportunities to legitimate businesses including:</p>
            <ol type="a">
              <li>Veterinary clinics</li>
              <li>Pet stores and groomers</li>
              <li>Pet crematoriums</li>
              <li>Animal shelters and rescues</li>
              <li>Breeders</li>
              <li>Funeral homes</li>
              <li>Cemeteries and memorial parks</li>
              <li>Hospice organizations</li>
              <li>Other memorial-related businesses (subject to approval)</li>
            </ol>
            <p>Australian businesses must provide ABN (Australian Business Number) upon application.</p>

            <h3>12.2 Partnership Application</h3>
            <p>To become a partner:</p>
            <ol type="a">
              <li>Submit an application via memoriqr.co.nz/partners</li>
              <li>Provide ABN and business registration documentation</li>
              <li>Wait for approval (typically 3-5 business days)</li>
              <li>Receive welcome email with partner portal access</li>
            </ol>

            <h3>12.3 Application Approval</h3>
            <p>We reserve the right to:</p>
            <ol type="a">
              <li>Approve or reject any partnership application at our sole discretion</li>
              <li>Request additional documentation before approval</li>
              <li>Suspend or terminate partnerships for violations of these terms</li>
            </ol>

            <h3>12.4 Rejection and Appeals</h3>
            <p>If your application is rejected:</p>
            <ol type="a">
              <li>You will receive an email with the reason for rejection</li>
              <li>You may appeal by providing additional information within 30 days</li>
              <li>Repeated applications after rejection may be declined without review</li>
            </ol>

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
            <ol type="a">
              <li>Payment is due immediately via invoice or credit card</li>
              <li>Codes are generated and assigned within 24 hours of payment</li>
              <li>Codes do not expire</li>
              <li>Codes cannot be refunded or returned once generated</li>
              <li>Unused codes remain in your partner account indefinitely</li>
              <li>You are responsible for tracking which codes you've sold to customers</li>
            </ol>
            <p>All wholesale prices are quoted in AUD for Australian partners.</p>

            <h3>12.7 Referral Code Terms</h3>
            <p>When using referral codes:</p>
            <ol type="a">
              <li>Codes are generated at no cost to you</li>
              <li>You may request additional codes through your partner portal</li>
              <li>Codes may have expiry dates set by MemoriQR</li>
              <li>Discount and commission percentages may vary by code batch</li>
              <li>We will notify you by email when your codes are redeemed (unless you opt out)</li>
            </ol>

            <h3>12.8 Commission Structure</h3>
            <p>For referral codes:</p>
            <ol type="a">
              <li>Commission percentage is set when codes are generated</li>
              <li>Commission is calculated on the total order value (excluding shipping)</li>
              <li>Commission is tracked in your partner portal</li>
              <li>Commission is classified as "pending" until the customer activates their memorial</li>
              <li>Once activated, commission becomes "approved" and eligible for payout</li>
            </ol>

            <h3>12.9 Commission Payments</h3>
            <p>Commission payouts:</p>
            <ol type="a">
              <li>Are processed monthly for approved commissions exceeding $75 AUD</li>
              <li>Require valid Australian bank account details on file</li>
              <li>Are paid via direct bank transfer within 14 days of month-end</li>
              <li>May be withheld if your partnership is suspended</li>
              <li>Are forfeited if your partnership is terminated for cause</li>
            </ol>

            <h3>12.10 Banking Details</h3>
            <p>You must provide accurate Australian banking information:</p>
            <ol type="a">
              <li>Bank account holder name (must match business name or ABN holder)</li>
              <li>BSB number</li>
              <li>Account number</li>
              <li>Bank name</li>
            </ol>
            <p>We are not responsible for payment delays due to incorrect banking information.</p>

            <h3>12.11 Tax Obligations</h3>
            <p>You are responsible for:</p>
            <ol type="a">
              <li>Declaring all commission income to the Australian Taxation Office (ATO)</li>
              <li>Registering for GST if your turnover exceeds the registration threshold</li>
              <li>Issuing tax invoices as required</li>
              <li>Paying all applicable taxes including GST</li>
              <li>Providing your ABN when requested</li>
            </ol>
            <p>
              MemoriQR is registered for GST in New Zealand. For Australian partners, we 
              will charge GST on wholesale code purchases where applicable under Australian 
              tax law.
            </p>

            <h3>12.12 Code Usage Restrictions</h3>
            <p>Partners agree to:</p>
            <ol type="a">
              <li>Use codes only for legitimate memorial sales</li>
              <li>Not sell or transfer codes to other businesses</li>
              <li>Not post codes publicly online (except in direct customer communications)</li>
              <li>Not engage in fraudulent or deceptive practices</li>
              <li>Accurately represent MemoriQR products and services</li>
              <li>Comply with Australian Consumer Law in all customer dealings</li>
            </ol>

            <h3>12.13 Marketing and Branding</h3>
            <p>Partners may:</p>
            <ol type="a">
              <li>Download approved marketing materials from the partner portal</li>
              <li>Use MemoriQR logos and branding in accordance with our brand guidelines</li>
              <li>Describe themselves as "MemoriQR Authorized Partner"</li>
            </ol>
            <p>Partners may not:</p>
            <ol type="a">
              <li>Create their own MemoriQR marketing materials without approval</li>
              <li>Modify our logos or branding</li>
              <li>Make false claims about product features or pricing (this violates the Australian Consumer Law)</li>
              <li>Imply exclusive partnership or special status without authorization</li>
            </ol>

            <h3>12.14 Partner Notifications</h3>
            <p>We will send email notifications for:</p>
            <ol type="a">
              <li>Partnership approval/rejection</li>
              <li>Code generation (wholesale and referral)</li>
              <li>Referral code redemption (opt-out available)</li>
              <li>Commission approval</li>
              <li>Terms updates (discount %, commission %, shipping)</li>
              <li>Partnership suspension or termination</li>
              <li>Security changes (email or banking details)</li>
            </ol>
            <p>You may opt out of referral redemption notifications in your partner settings.</p>

            <h3>12.15 Partner Session Security</h3>
            <p>Partner portal sessions:</p>
            <ol type="a">
              <li>Default to 1-hour timeout with automatic extension for active users</li>
              <li>May be extended to 24 hours via "Trust this device" option</li>
              <li>"Trust this device" should only be used on personal, secure computers</li>
              <li>You can revoke trusted device sessions in your partner settings</li>
            </ol>

            <h3>12.16 Partner Responsibilities</h3>
            <p>Partners must:</p>
            <ol type="a">
              <li>Keep login credentials secure</li>
              <li>Notify us immediately of any security breaches</li>
              <li>Maintain current contact information (including ABN)</li>
              <li>Respond to customer inquiries about MemoriQR products</li>
              <li>Honor all promotional terms associated with referral codes</li>
              <li>Comply with all Australian Consumer Law requirements</li>
            </ol>

            <h3>12.17 Partnership Suspension</h3>
            <p>We may suspend your partnership for:</p>
            <ol type="a">
              <li>Violation of these terms</li>
              <li>Fraudulent activity</li>
              <li>Customer complaints</li>
              <li>Non-payment of outstanding invoices (for wholesale partners)</li>
              <li>Misuse of codes</li>
              <li>Breach of Australian Consumer Law</li>
            </ol>
            <p>During suspension:</p>
            <ol type="a">
              <li>Your partner portal access is revoked</li>
              <li>Your codes are deactivated</li>
              <li>Pending commissions are withheld</li>
              <li>You cannot generate new codes</li>
            </ol>

            <h3>12.18 Partnership Termination</h3>
            <p>We may terminate your partnership immediately for:</p>
            <ol type="a">
              <li>Serious or repeated violations of these terms</li>
              <li>Illegal activity</li>
              <li>Damage to MemoriQR's reputation</li>
              <li>At our discretion with 30 days' notice for any reason</li>
            </ol>
            <p>Upon termination:</p>
            <ol type="a">
              <li>Unused wholesale codes are forfeited (no refund)</li>
              <li>Pending commissions are forfeited if termination is for cause</li>
              <li>Approved commissions will be paid out if termination is not for cause</li>
              <li>You must immediately cease representing yourself as a MemoriQR partner</li>
              <li>You must remove all MemoriQR branding from your materials</li>
            </ol>

            <h3>12.19 Data Retention</h3>
            <p>Partner data is retained according to our Privacy Policy and Australian Privacy Principles:</p>
            <ol type="a">
              <li>During active partnership: all data retained</li>
              <li>After termination: transactional data retained for 7 years (ATO compliance)</li>
              <li>Marketing data deleted within 30 days of termination</li>
              <li>You may request early deletion except for legally required records</li>
            </ol>

            {/* Section 13 */}
            <h2>13. Shipping</h2>

            <h3>13.1 Shipping to Australia</h3>
            <p>
              We ship to all Australian states and territories. Products are shipped from 
              New Zealand via international courier.
            </p>

            <h3>13.2 Shipping Times</h3>
            <p>Estimated delivery times from dispatch:</p>
            <ol type="a">
              <li>Major cities (Sydney, Melbourne, Brisbane, Perth, Adelaide): 7-10 business days</li>
              <li>Regional areas: 10-14 business days</li>
              <li>Remote areas: 14-21 business days</li>
            </ol>
            <p>These are estimates only. We are not responsible for courier delays.</p>

            <h3>13.3 Shipping Costs</h3>
            <p>Shipping costs are calculated at checkout based on:</p>
            <ol type="a">
              <li>Destination state and postcode</li>
              <li>Product size and weight</li>
              <li>Current international courier rates</li>
            </ol>
            <p>Some partner referral codes include free shipping.</p>

            <h3>13.4 Tracking</h3>
            <p>
              All orders include international tracking information sent via email once 
              dispatched.
            </p>

            <h3>13.5 Customs and Import Duties</h3>
            <p>For Australian shipments:</p>
            <ol type="a">
              <li>Most MemoriQR products fall under the Low Value Threshold and are not subject to customs duties or import taxes</li>
              <li>If duties are assessed, the customer is responsible for payment</li>
              <li>Customs processing may add 1-5 business days to delivery</li>
              <li>Refused shipments due to unpaid customs fees are non-refundable</li>
            </ol>

            <h3>13.6 Delivery Failures</h3>
            <p>If delivery fails due to:</p>
            <ol type="a">
              <li>Incorrect address provided by customer: customer must pay redelivery fees</li>
              <li>Customer unavailable for signature: courier will leave a card for pickup or redelivery</li>
              <li>Customer refuses delivery: no refund; product cannot be reused</li>
              <li>Courier error or lost parcel: we will send free replacement</li>
            </ol>

            {/* Section 14 */}
            <h2>14. Pricing and Payment</h2>

            <h3>14.1 Pricing</h3>
            <p>
              All prices for Australian customers are displayed in Australian Dollars (AUD) 
              and include GST where applicable under Australian tax law.
            </p>
            <p>
              Prices are subject to change without notice, but you will be charged the price 
              displayed at the time of purchase.
            </p>

            <h3>14.2 Payment Methods</h3>
            <p>We accept:</p>
            <ol type="a">
              <li>Credit cards (Visa, Mastercard, American Express)</li>
              <li>Debit cards</li>
              <li>Digital wallets (Apple Pay, Google Pay)</li>
            </ol>
            <p>All payments are processed securely through Stripe.</p>

            <h3>14.3 Payment Authorization</h3>
            <p>By providing payment information, you authorize us to charge:</p>
            <ol type="a">
              <li>The order total at time of purchase</li>
              <li>Any applicable renewal fees on expiry</li>
              <li>Any restoration fees if applicable</li>
            </ol>

            <h3>14.4 Failed Payments</h3>
            <p>If a payment fails:</p>
            <ol type="a">
              <li>We will attempt to charge the card up to 3 times</li>
              <li>You will receive email notifications of failed attempts</li>
              <li>Continued failure may result in memorial suspension per Section 4</li>
            </ol>

            <h3>14.5 Currency Conversion</h3>
            <p>
              All prices are in AUD for Australian customers. If your card is issued in a 
              different currency, your bank will perform the conversion and may charge 
              foreign transaction fees. We have no control over these fees.
            </p>

            <h3>14.6 Refunds</h3>
            <p>Due to the custom nature of our products, we do not offer refunds except:</p>
            <ol type="a">
              <li>As required by the Australian Consumer Law (Section 3.5)</li>
              <li>For double charges or billing errors (will be refunded within 5 business days)</li>
            </ol>

            {/* Section 15 */}
            <h2>15. Intellectual Property</h2>

            <h3>15.1 MemoriQR Trademarks</h3>
            <p>
              "MemoriQR," our logo, and all related branding are trademarks owned by 
              MemoriQR. You may not use our trademarks without written permission, except:
            </p>
            <ol type="a">
              <li>Partners using approved materials from the partner portal</li>
              <li>Fair use for descriptive purposes (e.g., "I purchased from MemoriQR")</li>
            </ol>

            <h3>15.2 Website Content</h3>
            <p>
              All content on memoriqr.co.nz, including text, images, graphics, and code, is 
              owned by MemoriQR or our licensors and is protected by copyright and other 
              intellectual property laws in Australia and internationally.
            </p>

            <h3>15.3 License to Use Website</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access and 
              use our website for its intended purpose. You may not:
            </p>
            <ol type="a">
              <li>Copy, modify, or distribute our website content</li>
              <li>Reverse engineer our platform</li>
              <li>Use automated tools to scrape our website</li>
              <li>Frame or mirror our website without permission</li>
            </ol>

            <h3>15.4 Memorial Page URLs</h3>
            <p>
              While you have a license to use your specific memorial page URL, MemoriQR 
              retains all rights to:
            </p>
            <ol type="a">
              <li>The memoriqr.co.nz domain</li>
              <li>The URL structure and routing</li>
              <li>The memorial page design and layout</li>
              <li>Any MemoriQR branding on memorial pages</li>
            </ol>

            {/* Section 16 */}
            <h2>16. Privacy and Data Protection</h2>

            <h3>16.1 Privacy Policy</h3>
            <p>
              Our collection, use, and disclosure of personal information is governed by our{' '}
              <a href="/au/privacy">Privacy Policy</a>, which is incorporated into these terms by reference. Our 
              Privacy Policy complies with the Australian Privacy Principles under the 
              Privacy Act 1988 (Cth).
            </p>

            <h3>16.2 Data Collection</h3>
            <p>We collect and process:</p>
            <ol type="a">
              <li>Customer information (name, email, address, phone)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Memorial content (photos, videos, text)</li>
              <li>Partner business information, ABN, and banking details</li>
              <li>Usage data (analytics, session logs)</li>
            </ol>

            <h3>16.3 Data Security</h3>
            <p>We implement industry-standard security measures including:</p>
            <ol type="a">
              <li>Encryption in transit (TLS/SSL)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Secure third-party service providers</li>
            </ol>
            <p>However, no system is 100% secure. We cannot guarantee absolute security.</p>

            <h3>16.4 Your Privacy Rights</h3>
            <p>Under the Australian Privacy Principles, you have the right to:</p>
            <ol type="a">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information (subject to limitations)</li>
              <li>Complain to the Office of the Australian Information Commissioner (OAIC)</li>
              <li>Withdraw consent for marketing communications</li>
            </ol>
            <p>To exercise these rights, contact privacy@memoriqr.co.nz.</p>

            <h3>16.5 Overseas Data Transfers</h3>
            <p>
              Your personal information may be stored and processed outside Australia, 
              including in the United States and European Union. We take reasonable steps to 
              ensure that overseas recipients comply with the Australian Privacy Principles.
            </p>

            <h3>16.6 Data Retention</h3>
            <p>We retain data as follows:</p>
            <ol type="a">
              <li>Active memorials: indefinitely while hosting is active</li>
              <li>Expired memorials: 120 days after expiry (see Section 4)</li>
              <li>Customer order data: 7 years (tax compliance)</li>
              <li>Partner transaction data: 7 years (ATO compliance)</li>
              <li>Marketing data: until consent is withdrawn</li>
            </ol>

            <h3>16.7 Data of Deceased Persons</h3>
            <p>
              Memorial content relates to deceased individuals. By creating a memorial, you 
              represent that you have the legal right to share this information and that 
              doing so does not violate any applicable laws or the deceased's wishes.
            </p>

            <h3>16.8 Data Breach Notification</h3>
            <p>
              In the event of a data breach affecting your personal information, we will 
              notify you and the OAIC as required by the Privacy Act 1988 (Cth), typically 
              within 72 hours of becoming aware of the breach.
            </p>

            {/* Section 17 */}
            <h2>17. Limitation of Liability</h2>

            <h3>17.1 Service Provided "As Is"</h3>
            <p>
              MemoriQR services are provided "as is" and "as available" without warranties 
              of any kind, either express or implied, including but not limited to:
            </p>
            <ol type="a">
              <li>Warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Uninterrupted or error-free operation</li>
            </ol>

            <h3>17.2 No Liability for Data Loss</h3>
            <p>We are not liable for:</p>
            <ol type="a">
              <li>Loss of memorial content due to user error</li>
              <li>Deletion of expired memorials per Section 4</li>
              <li>Data loss due to third-party service failures</li>
              <li>Corruption of uploaded content</li>
              <li>Accidental deletion by authorized users</li>
            </ol>
            <p>You are responsible for maintaining backup copies of Your Content.</p>

            <h3>17.3 Third-Party Actions</h3>
            <p>We are not liable for:</p>
            <ol type="a">
              <li>Downtime or failures of third-party services (Cloudinary, Supabase, etc.)</li>
              <li>Actions of payment processors (Stripe)</li>
              <li>Courier delays or lost shipments (except as stated in Section 3.4)</li>
              <li>Email delivery failures</li>
              <li>Actions of partners or other users</li>
            </ol>

            <h3>17.4 Indirect Damages</h3>
            <p>To the maximum extent permitted by Australian law, we are not liable for:</p>
            <ol type="a">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits or revenue</li>
              <li>Loss of business opportunities</li>
              <li>Emotional distress</li>
              <li>Punitive damages</li>
            </ol>

            <h3>17.5 Maximum Liability</h3>
            <p>
              Our total liability to you for any claims arising from these terms or our 
              services shall not exceed the amount you paid to MemoriQR in the 12 months 
              preceding the claim.
            </p>

            <h3>17.6 Australian Consumer Law</h3>
            <p>
              Nothing in this section limits or excludes any liability that cannot be 
              limited or excluded under the Australian Consumer Law or other applicable 
              Australian consumer protection laws. Where the Australian Consumer Law applies, 
              our liability is limited to the remedies permitted under that law.
            </p>

            {/* Section 18 */}
            <h2>18. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. We will notify you of material 
              changes by email or by posting a notice on our website. Continued use of our 
              services after changes constitutes acceptance of the new terms.
            </p>

            {/* Section 19 */}
            <h2>19. Governing Law</h2>
            <p>
              For Australian customers, these terms are governed by the laws of New South Wales, 
              Australia, and you submit to the non-exclusive jurisdiction of the courts of 
              New South Wales. Nothing in these terms excludes, restricts, or modifies any 
              consumer rights under the Australian Consumer Law.
            </p>

            {/* Section 20 */}
            <h2>20. Severability</h2>
            <p>
              If any provision of these terms is found to be unenforceable or invalid, that 
              provision will be limited or eliminated to the minimum extent necessary so that 
              these terms will otherwise remain in full force and effect.
            </p>

            {/* Section 21 */}
            <h2>21. Force Majeure</h2>
            <p>
              We are not liable for any failure or delay in performing our obligations where 
              such failure or delay results from circumstances beyond our reasonable control, 
              including but not limited to natural disasters, war, terrorism, riots, embargoes, 
              acts of civil or military authorities, fire, floods, accidents, pandemic, strikes, 
              or shortages of transportation, facilities, fuel, energy, labor, or materials.
            </p>

            {/* Section 22 */}
            <h2>22. Contact</h2>
            <p>For questions about these terms, contact us at:</p>
            <p>
              <strong>General Inquiries:</strong> support@memoriqr.co.nz<br />
              <strong>Legal:</strong> legal@memoriqr.co.nz<br />
              <strong>Privacy:</strong> privacy@memoriqr.co.nz<br />
              <strong>Disputes:</strong> disputes@memoriqr.co.nz<br />
              <strong>Business Location:</strong> Auckland, New Zealand<br />
              <strong>ABN:</strong> Not applicable (NZ business operating in Australia)
            </p>
            <p>
              For consumer complaints, you may also contact the{' '}
              <a href="https://www.accc.gov.au" target="_blank" rel="noopener noreferrer">
                Australian Competition &amp; Consumer Commission (ACCC)
              </a>{' '}
              or your state/territory consumer protection agency.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
