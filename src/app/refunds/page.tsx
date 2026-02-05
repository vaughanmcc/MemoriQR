import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Refund & Returns Policy',
  description: 'MemoriQR Refund & Returns Policy - Your rights under New Zealand Consumer Guarantees Act 1993.',
}

export default function RefundsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container-narrow py-16 md:py-24">
          <h1 className="text-4xl font-serif text-gray-900 mb-8">
            MemoriQR Refund &amp; Returns Policy (New Zealand)
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-8">
              Last Updated: February 2026
            </p>

            <p className="mb-8">
              MemoriQR creates custom-engraved memorial products (metal plates and NFC tags) with 
              included digital photo gallery hosting. This policy explains your rights regarding 
              refunds and returns under New Zealand&apos;s Consumer Guarantees Act 1993.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-amber-900 mt-0 mb-2">Overview</h3>
              <p className="text-amber-800 mb-0">
                Our refund policy balances your consumer rights with the custom nature of our 
                engraved memorial products. Once we begin manufacturing your personalized memorial 
                plate or tag, we cannot resell it to another customer.
              </p>
            </div>

            <h2 id="consumer-rights">1. Your Consumer Rights (New Zealand)</h2>
            <p>Under the Consumer Guarantees Act 1993, you have rights if products:</p>
            <ul>
              <li>Are faulty or defective</li>
              <li>Don&apos;t match the description</li>
              <li>Are not fit for purpose</li>
              <li>Are not of acceptable quality</li>
            </ul>
            <p>These rights cannot be excluded for personal purchases.</p>

            <h3>Fair Trading Act 1993</h3>
            <p>You are also protected against misleading or deceptive conduct under the Fair Trading Act.</p>

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
              <li>Email: support@memoriqr.co.nz with your order number</li>
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

            <h2 id="faulty-products">4. Faulty or Defective Products</h2>
            <p>We stand behind the quality of our products. You are entitled to a remedy if:</p>

            <h3>Manufacturing Defects</h3>
            <ul>
              <li>Engraving is illegible or poorly executed</li>
              <li>Plate has significant scratches, dents, or damage</li>
              <li>NFC tag doesn&apos;t function properly</li>
              <li>QR code doesn&apos;t scan correctly</li>
            </ul>

            <h3>Wrong Product Delivered</h3>
            <ul>
              <li>Incorrect name, dates, or text engraved</li>
              <li>Wrong product type sent (e.g., you ordered a plate but received a tag)</li>
              <li>Wrong size or style</li>
            </ul>

            <h3>Damaged in Shipping</h3>
            <ul>
              <li>Product arrives broken or significantly damaged</li>
              <li>Packaging indicates damage during transit</li>
            </ul>

            <h3>Remedies Available</h3>
            <p>Depending on the severity of the issue:</p>

            <p><strong>1. Replacement Product (Most Common)</strong></p>
            <ul>
              <li>We&apos;ll manufacture a new memorial with correct specifications</li>
              <li>Free shipping for replacement</li>
              <li>Original faulty product may need to be returned</li>
            </ul>

            <p><strong>2. Repair or Correction</strong></p>
            <ul>
              <li>If issue can be fixed without full replacement</li>
              <li>We&apos;ll cover all costs</li>
            </ul>

            <p><strong>3. Partial Refund</strong></p>
            <ul>
              <li>For minor defects you choose to keep</li>
              <li>Amount reflects the reduced value</li>
            </ul>

            <p><strong>4. Full Refund</strong></p>
            <ul>
              <li>If product is significantly not as described</li>
              <li>If replacement is not possible</li>
              <li>Includes original shipping costs</li>
            </ul>

            <h3>How to Claim</h3>
            <p><strong>Within 30 Days of Delivery:</strong></p>
            <ol>
              <li>Email: support@memoriqr.co.nz</li>
              <li>Include:
                <ul>
                  <li>Order number</li>
                  <li>Photos clearly showing the defect or issue</li>
                  <li>Description of the problem</li>
                </ul>
              </li>
              <li>We&apos;ll respond within 2 business days with next steps</li>
            </ol>

            <p><strong>After 30 Days:</strong></p>
            <ul>
              <li>You still have rights under the Consumer Guarantees Act</li>
              <li>Contact us to discuss the issue</li>
              <li>Reasonable durability expectations apply</li>
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
              <li>Technical issues preventing memorial access (we&apos;ll fix or refund)</li>
              <li>Memorial features not working as described (we&apos;ll fix or provide partial refund)</li>
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
              <li>Refunded if product is faulty or we made an error</li>
              <li>Not refunded for change of mind (if cancellation allowed)</li>
            </ul>

            <h3>Return Shipping (for faulty products)</h3>
            <ul>
              <li>We provide a prepaid return label</li>
              <li>Or reimburse your reasonable return shipping costs</li>
            </ul>

            <h3>Replacement Shipping</h3>
            <ul>
              <li>Free shipping for replacement products due to defects or our errors</li>
            </ul>

            <h2 id="special-circumstances">7. Special Circumstances</h2>
            
            <h3>Wrong Engraving Due to Our Error</h3>
            <p>If we engrave incorrect information that you didn&apos;t provide:</p>
            <ul>
              <li>Full replacement at no cost</li>
              <li>Expedited manufacturing and shipping</li>
              <li>Original product does not need to be returned</li>
              <li>You may keep or dispose of the incorrect product</li>
            </ul>

            <h3>Wrong Engraving Due to Customer Error</h3>
            <p>If you provided incorrect information (typo in name, wrong dates):</p>
            <ul>
              <li>We can manufacture a replacement at a discounted rate (50% off product cost)</li>
              <li>Or you may purchase a new product at full price</li>
              <li>No refund available as manufacturing was per your specifications</li>
            </ul>

            <h3>Memorial Content Issues</h3>
            <p><strong>Photos won&apos;t upload / Technical problems:</strong></p>
            <ul>
              <li>We&apos;ll provide technical support to resolve</li>
              <li>If unresolvable due to our platform, full refund of digital hosting fees</li>
            </ul>

            <p><strong>Changed your mind about photos/content:</strong></p>
            <ul>
              <li>You can edit your memorial at any time during your hosting period</li>
              <li>No refund for digital hosting</li>
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
              <li>Same consumer guarantee rights apply</li>
              <li>Contact us directly for warranty claims on behalf of your customers</li>
              <li>We&apos;ll replace faulty products provided to your customers</li>
            </ul>

            <h2 id="hosting-renewal">9. Hosting Renewal</h2>
            
            <h3>Renewal Purchases</h3>
            <ul>
              <li>Non-refundable once processed</li>
              <li>Hosting period is immediately extended</li>
              <li>You have access to the service you paid for</li>
            </ul>

            <p><strong>Exceptions:</strong></p>
            <ul>
              <li>If charged in error, full refund within 14 days</li>
              <li>If technical issues prevent renewed access, full refund</li>
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
              <li>May apply if product is partially used or issue is minor</li>
              <li>Amount clearly communicated before processing</li>
            </ul>

            <h2 id="return-process">11. Return Process (For Faulty Products)</h2>
            
            <h3>When Return Required</h3>
            <ol>
              <li>Contact us first - don&apos;t return without authorization</li>
              <li>We&apos;ll assess if return is necessary (photos may be sufficient)</li>
              <li>If return needed, we provide instructions and prepaid label</li>
              <li>Pack product securely in original packaging if possible</li>
              <li>We&apos;ll inspect and process refund/replacement within 5 business days of receipt</li>
            </ol>

            <h3>Not Required to Return</h3>
            <ul>
              <li>If product is significantly defective (we may ask you to destroy it)</li>
              <li>If cost of return exceeds product value</li>
              <li>If replacement already sent</li>
            </ul>

            <h2 id="exclusions">12. Exclusions &amp; Limitations</h2>
            
            <h3>We Cannot Offer Refunds For:</h3>

            <p><strong>Change of Mind</strong></p>
            <ul>
              <li>After manufacturing begins on custom engraved products</li>
              <li>After digital memorial is activated and content uploaded</li>
            </ul>

            <p><strong>Normal Wear and Tear</strong></p>
            <ul>
              <li>Metal plates developing patina over time (this is normal for outdoor use)</li>
              <li>Minor surface scratches from handling</li>
              <li>Weathering appropriate to the memorial&apos;s age and location</li>
            </ul>

            <p><strong>Damage You Caused</strong></p>
            <ul>
              <li>Dropping or physically damaging the memorial</li>
              <li>Exposure to harsh chemicals or extreme conditions beyond normal use</li>
              <li>Modifying or altering the product</li>
            </ul>

            <p><strong>Issues Outside Our Control</strong></p>
            <ul>
              <li>Third-party services (YouTube, Cloudinary) experiencing downtime</li>
              <li>Your device or internet connection issues</li>
              <li>QR code/NFC not working due to device compatibility (we&apos;ll help troubleshoot)</li>
            </ul>

            <h2 id="quality-guarantee">13. Quality Guarantee</h2>
            
            <h3>Our Promise</h3>
            <ul>
              <li>Metal plates guaranteed for 25+ years outdoor durability</li>
              <li>NFC tags guaranteed functional for the life of your hosting period</li>
              <li>QR codes remain scannable for the life of the product</li>
              <li>Digital hosting uptime of 99%+</li>
            </ul>
            <p>If we fail to meet these standards, we&apos;ll provide a remedy under the Consumer Guarantees Act.</p>

            <h2 id="dispute-resolution">14. Dispute Resolution</h2>
            <p>We&apos;ll Always Try to Resolve Issues Directly</p>

            <h3>Step 1: Contact Support</h3>
            <ul>
              <li>Email: support@memoriqr.co.nz</li>
              <li>We aim to resolve most issues within 2-5 business days</li>
            </ul>

            <h3>Step 2: Escalation</h3>
            <ul>
              <li>If not satisfied, request escalation to management</li>
              <li>We&apos;ll review and provide a decision within 10 business days</li>
            </ul>

            <h3>Step 3: External Dispute Resolution</h3>
            <p>If we cannot resolve your issue:</p>

            <p><strong>Disputes Tribunal</strong></p>
            <ul>
              <li>For claims under $30,000</li>
              <li>Low-cost, informal process</li>
              <li>Website: disputestribunal.govt.nz</li>
            </ul>

            <p><strong>Commerce Commission</strong></p>
            <ul>
              <li>For Fair Trading Act or Consumer Guarantees Act breaches</li>
              <li>Website: comcom.govt.nz</li>
            </ul>

            <p><strong>Consumer Protection</strong></p>
            <ul>
              <li>Consumer NZ: consumer.org.nz</li>
              <li>Citizens Advice Bureau: cab.org.nz</li>
            </ul>

            <h2 id="contact">15. Contact Us</h2>
            
            <h3>For Refund or Return Requests</h3>
            <ul>
              <li>Email: support@memoriqr.co.nz</li>
              <li>Response time: Within 2 business days</li>
            </ul>

            <h3>Include in Your Message</h3>
            <ul>
              <li>Order number</li>
              <li>Description of issue</li>
              <li>Photos (if applicable)</li>
              <li>Your preferred resolution</li>
            </ul>

            <h2 id="gift-purchases">16. Gift Purchases</h2>
            <p>If Product Was a Gift:</p>
            <ul>
              <li>Recipient can request replacement for faulty products</li>
              <li>Refunds issued to original purchaser</li>
              <li>We can issue store credit to recipient if preferred</li>
            </ul>

            <h2 id="business-use">17. Business Use</h2>
            <p>If you purchased for business/trade use:</p>
            <ul>
              <li>Consumer Guarantees Act may not apply (business guarantees still apply)</li>
              <li>Refund policy may be negotiated differently</li>
              <li>Contact us to discuss business terms</li>
            </ul>

            <hr className="my-8" />

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
              <h3 className="text-lg font-semibold text-green-900 mt-0 mb-4">Summary</h3>
              <ul className="text-green-800 mb-0">
                <li>✓ Cancel before manufacturing = full refund</li>
                <li>✓ Faulty product = replacement, repair, or refund</li>
                <li>✓ Our engraving error = free replacement</li>
                <li>✓ Your information error = discounted replacement option</li>
                <li>✓ Change of mind after manufacturing = no refund</li>
                <li>✓ Digital hosting activated = no refund</li>
                <li>✓ We cover return shipping for faulty products</li>
              </ul>
            </div>

            <p>Your rights under New Zealand consumer law cannot be excluded for personal purchases.</p>

            <p className="text-gray-500 mt-8">
              Questions? Email{' '}
              <a href="mailto:support@memoriqr.co.nz" className="text-blue-600 hover:text-blue-800">
                support@memoriqr.co.nz
              </a>
            </p>

            <p className="text-gray-600 italic">
              We&apos;re here to help ensure your memorial honors your loved one perfectly.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                See also:{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>
                {' '}&bull;{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
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
