import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Refund & Returns Policy (Australia)',
  description: 'MemoriQR Refund & Returns Policy for Australian customers - Your rights under Australian Consumer Law.',
}

export default function AURefundsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container-narrow py-16 md:py-24">
          <h1 className="text-4xl font-serif text-gray-900 mb-8">
            MemoriQR Refund &amp; Returns Policy (Australia)
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last Updated: February 2026
            </p>

            <p className="mb-8">
              MemoriQR creates custom-engraved memorial products (metal plates and NFC tags) with 
              included digital photo gallery hosting. This policy explains your rights regarding 
              refunds and returns under Australian Consumer Law.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-amber-900 mt-0 mb-2">Overview</h3>
              <p className="text-amber-800 mb-0">
                Our refund policy balances your consumer rights with the custom nature of our 
                engraved memorial products. Once we begin manufacturing your personalized memorial 
                plate or tag, we cannot resell it to another customer.
              </p>
            </div>

            <h2 id="consumer-rights">1. Your Consumer Rights (Australia)</h2>
            <p>Under Australian Consumer Law (ACL), you have rights if products:</p>
            <ul>
              <li>Have a major failure (significant problem)</li>
              <li>Are faulty or defective</li>
              <li>Don&apos;t match the description</li>
              <li>Are not fit for purpose</li>
              <li>Are not of acceptable quality</li>
              <li>Don&apos;t match the sample or demonstration model</li>
            </ul>

            <h3>Consumer Guarantees</h3>
            <p>These guarantees automatically apply and cannot be excluded for personal purchases under $100,000.</p>

            <h3>Major vs Minor Failures</h3>
            <ul>
              <li><strong>Major failure:</strong> Entitles you to refund or replacement</li>
              <li><strong>Minor failure:</strong> We can choose to repair, replace, or refund</li>
            </ul>

            <h2 id="cancellation">2. Cancellation Before Manufacturing</h2>
            
            <h3>Online Orders (Before Engraving Begins)</h3>
            <p>You may cancel for a full refund if:</p>
            <ul>
              <li>Your order has been placed but engraving has not yet started</li>
              <li>Typically within 24 hours of order placement (business days)</li>
              <li>Digital hosting has not been activated</li>
            </ul>

            <p><strong>To Cancel:</strong></p>
            <ul>
              <li>Email: support@memoriqr.com.au with your order number</li>
              <li>Subject: &quot;Cancellation Request - Order [NUMBER]&quot;</li>
              <li>We will confirm if manufacturing has begun</li>
            </ul>

            <p><strong>Full refund includes:</strong></p>
            <ul>
              <li>✓ Product cost</li>
              <li>✓ Shipping fees</li>
              <li>✓ Digital hosting fees</li>
            </ul>
            <p>Refund processed within 5-10 business days to your original payment method.</p>

            <h3>Retail Activation Codes (Purchased Through Partners)</h3>
            <p>If you purchased an activation code from a partner (veterinarian, funeral home, pet store):</p>
            <ul>
              <li>Contact the partner directly for their refund policy on the physical product</li>
              <li>If you haven&apos;t activated the digital memorial, the code can typically be refunded or exchanged</li>
              <li>Once activated, the digital hosting is considered used</li>
            </ul>

            <h2 id="after-manufacturing">3. After Manufacturing Begins</h2>
            
            <h3>No Refunds for Change of Mind</h3>
            <p>Once engraving begins on your custom memorial plate, we cannot offer refunds for:</p>
            <ul>
              <li>Change of mind</li>
              <li>Incorrect information you provided (name spelling, dates, etc.)</li>
              <li>Deciding you don&apos;t want the product</li>
              <li>Choosing a different memorial style</li>
            </ul>

            <p><strong>Why:</strong> Your memorial plate is custom-engraved with your specific details and cannot be resold.</p>
            <p><em>Note: This does not affect your rights for faulty products or consumer guarantee failures.</em></p>

            <h2 id="faulty-products">4. Faulty or Defective Products</h2>
            <p>We stand behind the quality of our products. You are entitled to a remedy if:</p>

            <h3>Major Failures</h3>
            <ul>
              <li>Product is significantly unfit for purpose</li>
              <li>Product is significantly different from description</li>
              <li>Product is unsafe</li>
              <li>Would not have purchased if you knew of the problem</li>
            </ul>

            <p><strong>Examples:</strong></p>
            <ul>
              <li>Engraving is completely illegible</li>
              <li>NFC tag doesn&apos;t function at all</li>
              <li>Plate arrives severely damaged or broken</li>
              <li>Wrong product entirely (you ordered person memorial, received pet)</li>
            </ul>

            <h3>Minor Failures</h3>
            <ul>
              <li>Engraving has minor imperfections but is readable</li>
              <li>Small cosmetic damage that doesn&apos;t affect function</li>
              <li>NFC works but requires multiple attempts</li>
            </ul>

            <h3>Wrong Product Delivered</h3>
            <ul>
              <li>Incorrect name, dates, or text engraved (our error)</li>
              <li>Wrong product type sent</li>
              <li>Wrong size or style</li>
            </ul>

            <h3>Damaged in Shipping</h3>
            <ul>
              <li>Product arrives broken or significantly damaged</li>
              <li>Packaging indicates damage during transit</li>
            </ul>

            <h3>Remedies Available</h3>
            
            <p><strong>For Major Failures:</strong></p>
            <p>You can choose:</p>
            <ol>
              <li>Full refund (includes shipping costs)</li>
              <li>Replacement product (free shipping)</li>
            </ol>

            <p><strong>For Minor Failures:</strong></p>
            <p>We can choose to:</p>
            <ol>
              <li>Repair the product</li>
              <li>Replace the product</li>
              <li>Provide a refund</li>
            </ol>

            <p><strong>Additional Compensation:</strong> If failure causes additional losses (reasonably foreseeable), you may be entitled to compensation.</p>

            <h3>How to Claim</h3>
            <p><strong>Within Reasonable Time of Delivery:</strong></p>
            <ol>
              <li>Email: support@memoriqr.com.au</li>
              <li>Include:
                <ul>
                  <li>Order number</li>
                  <li>Photos clearly showing the defect or issue</li>
                  <li>Description of the problem</li>
                  <li>How the failure affects use</li>
                </ul>
              </li>
              <li>We&apos;ll respond within 2 business days with next steps</li>
            </ol>

            <p><strong>What&apos;s Reasonable?</strong></p>
            <ul>
              <li>For obvious defects: Within 30 days</li>
              <li>For hidden defects: When discovered, if within expected product lifetime</li>
              <li>ACL guarantees apply for the length of time products are expected to last</li>
            </ul>

            <h2 id="digital-hosting">5. Digital Memorial Hosting</h2>
            
            <h3>No Refunds After Activation</h3>
            <p>Once you activate your digital memorial and upload content:</p>
            <ul>
              <li>Digital hosting is considered used and non-refundable</li>
              <li>You&apos;ve received access to the service you purchased</li>
            </ul>

            <p><strong>Exceptions:</strong></p>
            <ul>
              <li>Major technical issues preventing memorial access (we&apos;ll fix or refund)</li>
              <li>Memorial features not working as described (we&apos;ll fix or provide partial refund)</li>
              <li>Service does not meet consumer guarantees</li>
            </ul>

            <h3>Unused Hosting Credits</h3>
            <p>If you purchased hosting but never activated your memorial:</p>
            <ul>
              <li>Contact us within 90 days of purchase</li>
              <li>We may offer a partial refund (minus activation code generation costs)</li>
              <li>Or transfer to a different memorial</li>
            </ul>

            <h2 id="shipping-costs">6. Shipping Costs</h2>
            
            <h3>Original Shipping</h3>
            <ul>
              <li>Refunded if product has a major failure or we made an error</li>
              <li>Not refunded for change of mind (if cancellation allowed pre-manufacturing)</li>
            </ul>

            <h3>Return Shipping (for faulty products)</h3>
            <ul>
              <li>For major failure: We pay return shipping OR you keep faulty product</li>
              <li>For minor failure: You may need to pay return shipping (unless unreasonable)</li>
              <li>We&apos;ll provide clear instructions</li>
            </ul>

            <h3>Replacement Shipping</h3>
            <ul>
              <li>Free shipping for replacement products due to defects or our errors</li>
            </ul>

            <h2 id="special-circumstances">7. Special Circumstances</h2>
            
            <h3>Wrong Engraving Due to Our Error</h3>
            <p>If we engrave incorrect information that you didn&apos;t provide:</p>
            <ul>
              <li>This is a major failure</li>
              <li>Full replacement at no cost OR full refund</li>
              <li>Expedited manufacturing and shipping</li>
              <li>Original product does not need to be returned</li>
              <li>You may keep or dispose of the incorrect product</li>
            </ul>

            <h3>Wrong Engraving Due to Customer Error</h3>
            <p>If you provided incorrect information (typo in name, wrong dates):</p>
            <ul>
              <li>Not a failure under consumer guarantees (product made to your specifications)</li>
              <li>We can manufacture a replacement at a discounted rate (50% off product cost)</li>
              <li>Or you may purchase a new product at full price</li>
              <li>No refund available</li>
            </ul>

            <h3>Memorial Content Issues</h3>
            <p><strong>Photos won&apos;t upload / Technical problems:</strong></p>
            <ul>
              <li>We&apos;ll provide technical support to resolve</li>
              <li>If unresolvable due to our platform fault, this is a service failure</li>
              <li>Remedy: Fix the issue, or refund digital hosting fees</li>
            </ul>

            <p><strong>Changed your mind about photos/content:</strong></p>
            <ul>
              <li>You can edit your memorial at any time during your hosting period</li>
              <li>No refund for digital hosting (service is available as purchased)</li>
            </ul>

            <h2 id="partner-program">8. Partner Program (Wholesale Customers)</h2>
            <p><strong>For Veterinarians, Funeral Homes, Pet Stores, etc.</strong></p>

            <h3>Activation Codes</h3>
            <ul>
              <li>Non-refundable once purchased (they are your inventory)</li>
              <li>Can be reassigned to different customers</li>
              <li>No expiry date (codes remain valid indefinitely)</li>
            </ul>

            <h3>Defective Products</h3>
            <ul>
              <li>Consumer guarantee rights apply to end customers</li>
              <li>Contact us directly for warranty claims on behalf of your customers</li>
              <li>We&apos;ll replace faulty products provided to your customers</li>
            </ul>

            <h2 id="hosting-renewal">9. Hosting Renewal</h2>
            
            <h3>Renewal Purchases</h3>
            <ul>
              <li>Non-refundable once processed and hosting period extended</li>
              <li>You have access to the service you paid for</li>
            </ul>

            <p><strong>Exceptions:</strong></p>
            <ul>
              <li>Charged in error: Full refund within 14 days</li>
              <li>Technical issues prevent renewed access: Full refund</li>
              <li>Service does not meet description: Partial or full refund</li>
            </ul>

            <h2 id="processing-refunds">10. Processing Refunds</h2>
            
            <h3>Timeline</h3>
            <ul>
              <li>Approved refunds processed within 5-10 business days</li>
              <li>Refunds issued to original payment method</li>
              <li>Bank processing may take additional 3-5 business days</li>
            </ul>

            <h3>Partial Refunds</h3>
            <ul>
              <li>May apply for minor failures you choose to keep</li>
              <li>Or compensation for reduced value</li>
              <li>Amount clearly communicated before processing</li>
            </ul>

            <h3>Store Credit Option</h3>
            <ul>
              <li>Available if you prefer</li>
              <li>Same value as refund amount</li>
              <li>No expiry on credit</li>
            </ul>

            <h2 id="return-process">11. Return Process (For Faulty Products)</h2>
            
            <h3>When Return Required</h3>
            <ol>
              <li>Contact us first - don&apos;t return without authorization</li>
              <li>We&apos;ll assess if return is necessary (photos may be sufficient)</li>
              <li>For major failures, we pay return shipping OR you keep product</li>
              <li>If return needed, we provide instructions and prepaid label (for major failures)</li>
              <li>Pack product securely in original packaging if possible</li>
              <li>We&apos;ll inspect and process refund/replacement within 5 business days of receipt</li>
            </ol>

            <h3>Not Required to Return</h3>
            <ul>
              <li>Major failures: You can usually keep the faulty product</li>
              <li>If cost of return exceeds product value</li>
              <li>If replacement already sent</li>
            </ul>

            <h2 id="exclusions">12. Exclusions &amp; Limitations</h2>
            
            <h3>Consumer Guarantees Do NOT Apply To:</h3>

            <p><strong>Change of Mind</strong></p>
            <ul>
              <li>After manufacturing begins on custom engraved products (not a consumer guarantee issue)</li>
              <li>After digital memorial is activated and you&apos;ve used the service</li>
            </ul>

            <p><strong>Normal Wear and Tear</strong></p>
            <ul>
              <li>Metal plates developing patina over time (normal for outdoor use)</li>
              <li>Minor surface scratches from regular handling</li>
              <li>Weathering appropriate to memorial&apos;s age and use</li>
            </ul>

            <p><strong>Damage You Caused</strong></p>
            <ul>
              <li>Dropping or physically damaging the memorial</li>
              <li>Exposure to harsh chemicals or extreme conditions beyond normal outdoor use</li>
              <li>Modifying or altering the product</li>
              <li>Not following care instructions</li>
            </ul>

            <p><strong>Misuse</strong></p>
            <ul>
              <li>Using product in a way it wasn&apos;t designed for</li>
              <li>Installing in extreme conditions without appropriate protection</li>
            </ul>

            <p><strong>Issues Outside Our Control</strong></p>
            <ul>
              <li>Third-party services (YouTube, Cloudinary) experiencing temporary downtime</li>
              <li>Your device or internet connection issues</li>
              <li>QR code/NFC not working due to device being incompatible (we&apos;ll help troubleshoot)</li>
            </ul>

            <h2 id="quality-guarantee">13. Quality Guarantee</h2>
            
            <h3>Our Promise</h3>
            <ul>
              <li>Metal plates: 25+ years outdoor durability</li>
              <li>NFC tags: Functional for the life of your hosting period</li>
              <li>QR codes: Remain scannable for the life of the product</li>
              <li>Digital hosting: 99%+ uptime</li>
            </ul>

            <h3>Expected Lifetime</h3>
            <p>Under ACL, products must last for a reasonable time based on:</p>
            <ul>
              <li>Price paid</li>
              <li>Nature of the product</li>
              <li>Statements made about durability</li>
            </ul>
            <p>For our memorial plates: We expect 25+ years. If failure occurs within this period, you have consumer guarantee rights.</p>

            <h2 id="dispute-resolution">14. Dispute Resolution</h2>
            <p>We&apos;ll Always Try to Resolve Issues Directly</p>

            <h3>Step 1: Contact Support</h3>
            <ul>
              <li>Email: support@memoriqr.com.au</li>
              <li>We aim to resolve most issues within 2-5 business days</li>
            </ul>

            <h3>Step 2: Escalation</h3>
            <ul>
              <li>If not satisfied, request escalation to management</li>
              <li>We&apos;ll review and provide a decision within 10 business days</li>
            </ul>

            <h3>Step 3: External Dispute Resolution</h3>
            <p>If we cannot resolve your issue:</p>

            <p><strong>ACCC (Australian Competition &amp; Consumer Commission)</strong></p>
            <ul>
              <li>For consumer guarantee or ACL issues</li>
              <li>Website: accc.gov.au</li>
              <li>Phone: 1300 302 502</li>
            </ul>

            <p><strong>Fair Trading/Consumer Affairs (State/Territory)</strong></p>
            <ul>
              <li>NSW Fair Trading: fairtrading.nsw.gov.au</li>
              <li>Consumer Affairs Victoria: consumer.vic.gov.au</li>
              <li>Office of Fair Trading (QLD): qld.gov.au/fairtrading</li>
              <li>Consumer and Business Services (SA): cbs.sa.gov.au</li>
              <li>Consumer Protection (WA): consumerprotection.wa.gov.au</li>
              <li>Consumer Affairs (TAS): consumer.tas.gov.au</li>
              <li>Access Canberra (ACT): accesscanberra.act.gov.au</li>
              <li>NT Consumer Affairs: consumeraffairs.nt.gov.au</li>
            </ul>

            <p><strong>Small Claims Court/Tribunal</strong></p>
            <ul>
              <li>For claims generally under $10,000-$25,000 (varies by state)</li>
              <li>Low cost, less formal than court</li>
            </ul>

            <h2 id="contact">15. Contact Us</h2>
            
            <h3>For Refund or Return Requests</h3>
            <ul>
              <li>Email: support@memoriqr.com.au</li>
              <li>Response time: Within 2 business days</li>
            </ul>

            <h3>Include in Your Message</h3>
            <ul>
              <li>Order number</li>
              <li>Description of issue</li>
              <li>Photos (if applicable)</li>
              <li>Whether you consider it a major or minor failure</li>
              <li>Your preferred resolution</li>
            </ul>

            <h2 id="gift-purchases">16. Gift Purchases</h2>
            <p>If Product Was a Gift:</p>
            <ul>
              <li>Recipient has the same consumer guarantee rights</li>
              <li>For change of mind returns (if allowed), contact the purchaser</li>
              <li>Refunds issued to original purchaser</li>
              <li>We can issue store credit to recipient if preferred</li>
            </ul>

            <h2 id="business-use">17. Business Use</h2>
            <p>If you purchased for business/trade use:</p>
            <ul>
              <li>Some consumer guarantees may not apply</li>
              <li>Different terms may be negotiated</li>
              <li>Contact us to discuss business terms</li>
              <li>ACL still provides certain protections for small businesses</li>
            </ul>

            <h2 id="warranty">18. Warranty Against Defects</h2>
            <p>In addition to consumer guarantees:</p>

            <h3>Our Voluntary Warranty</h3>
            <ul>
              <li>12 months from purchase against manufacturing defects</li>
              <li>NFC functionality for life of hosting period</li>
              <li>Plate durability for 25 years</li>
            </ul>
            <p>This warranty is in addition to your ACL rights, not instead of them.</p>

            <h2 id="misleading-representations">19. Misleading Representations</h2>
            <p><strong>We Cannot Say:</strong></p>
            <ul>
              <li>✗ &quot;No refunds&quot; (for consumer guarantee failures)</li>
              <li>✗ &quot;All sales final&quot; (doesn&apos;t override ACL)</li>
              <li>✗ &quot;We&apos;re not responsible for manufacturing defects&quot;</li>
              <li>✗ Any other statement that limits your ACL rights</li>
            </ul>
            <p>If you see such statements anywhere, they do not override your statutory rights under Australian Consumer Law.</p>

            <hr className="my-8" />

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
              <h3 className="text-lg font-semibold text-green-900 mt-0 mb-4">Summary</h3>
              <ul className="text-green-800 mb-0">
                <li>✓ Cancel before manufacturing = full refund</li>
                <li>✓ Major failure = your choice of refund or replacement</li>
                <li>✓ Minor failure = we choose remedy (repair, replace, or refund)</li>
                <li>✓ Our engraving error = major failure (free replacement or refund)</li>
                <li>✓ Your information error = discounted replacement available</li>
                <li>✓ Change of mind after manufacturing = no consumer guarantee right</li>
                <li>✓ Digital hosting activated = service used (no refund unless failure)</li>
                <li>✓ We pay return shipping for major failures</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-8">
              <p className="text-red-800 font-semibold mb-0">
                IMPORTANT: NOTHING IN THIS POLICY EXCLUDES, RESTRICTS OR MODIFIES YOUR RIGHTS UNDER AUSTRALIAN CONSUMER LAW
              </p>
            </div>

            <p>Your rights under Australian Consumer Law cannot be excluded and cannot be limited by this policy.</p>

            <p className="text-gray-500 mt-8">
              Questions? Email{' '}
              <a href="mailto:support@memoriqr.com.au" className="text-blue-600 hover:text-blue-800">
                support@memoriqr.com.au
              </a>
            </p>

            <p className="text-gray-600 italic">
              We&apos;re committed to honoring your consumer rights while creating beautiful, lasting memorials.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                See also:{' '}
                <Link href="/au/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>
                {' '}&bull;{' '}
                <Link href="/au/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
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
