'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { 
  ShoppingCart, 
  CreditCard, 
  Upload, 
  Truck, 
  QrCode, 
  Share2,
  Smartphone,
  Heart,
  Mail,
  CheckCircle,
  Shield
} from 'lucide-react'

const orderSteps = [
  {
    title: 'Choose Your Package',
    step: 'Step 1',
    description: 'Select your hosting duration (5, 10, or 25 years) and product type – NFC tag, QR plate, or both.',
    icon: ShoppingCart,
  },
  {
    title: 'Complete Payment',
    step: 'Step 2',
    description: 'Secure checkout via Stripe. All prices are one-time payments with no hidden fees or subscriptions.',
    icon: CreditCard,
  },
  {
    title: 'Receive Confirmation',
    step: 'Step 3',
    description: 'Get your order confirmation email with your unique activation code and memorial page link.',
    icon: Mail,
  },
  {
    title: 'Upload Your Memories',
    step: 'Step 4',
    description: 'Add photos, videos, and a heartfelt tribute message. Your memorial page goes live instantly.',
    icon: Upload,
  },
  {
    title: 'Receive Your Tag',
    step: 'Step 5',
    description: 'Your premium Metalphoto® QR plate or NFC tag arrives within 5-7 business days.',
    icon: Truck,
  },
  {
    title: 'Share & Remember',
    step: 'Step 6',
    description: 'Attach the tag to an urn, headstone, or keepsake. Share the link with family anywhere in the world – they can view the tribute instantly from any smartphone or computer.',
    icon: Share2,
  },
]

const productTypes = [
  {
    title: 'NFC Tag',
    description: 'Modern tap-to-view technology. Simply hold any smartphone near the tag to instantly open the memorial page. No app required.',
    icon: Smartphone,
    features: ['Instant tap access', 'Works with all modern smartphones', 'Compact & discreet', 'Fast 2-3 day delivery'],
    ideal: 'Ideal for tech-savvy families and modern urns',
  },
  {
    title: 'QR Plate',
    description: 'Premium Metalphoto® anodised aluminium plate with sub-surface printed QR code. 20+ year UV resistance, built for permanent outdoor use.',
    icon: QrCode,
    features: ['Weather-resistant', 'Sub-surface printed QR', 'Metalphoto® aluminium', 'Fits headstones & plaques'],
    ideal: 'Ideal for outdoor memorials and headstones',
  },
  {
    title: 'Both (NFC + QR)',
    description: 'The complete memorial solution. Get both technologies so visitors can tap or scan, whichever they prefer.',
    icon: Heart,
    features: ['Maximum compatibility', 'Future-proof technology', 'Best value bundle', 'Two ways to remember'],
    ideal: 'Ideal for families who want the complete package',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gray-800 text-white py-20 md:py-28">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1920&q=80")',
            }}
          />
          <div className="relative container-wide text-center">
            <h1 className="text-4xl md:text-5xl font-serif mb-6">
              How It Works
            </h1>
            <div className="w-16 h-1 bg-primary-500 mx-auto mb-6" />
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Create a lasting digital memorial in just a few simple steps. 
              Your loved one's story, accessible forever with a simple scan.
            </p>
          </div>
        </section>

        {/* Order Process Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                Order Your Memorial Tag
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Share memories with a beautifully crafted QR plate or NFC tag
              </p>
              <div className="w-16 h-1 bg-red-500 mx-auto mt-6" />
            </div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {orderSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-serif text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm font-semibold text-primary-600 mb-3">
                    {step.step}
                  </p>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <Link
                href="/order"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
              >
                Get Started – Order Now
              </Link>
            </div>
          </div>
        </section>

        {/* Product Types Section */}
        <section className="py-16 md:py-24 bg-memorial-cream">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                Choose Your Memorial Type
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Three options to suit every preference and budget
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {productTypes.map((product, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-6">
                    <product.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-serif text-gray-900 mb-3">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {product.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="h-4 w-4 text-memorial-sage flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-primary-600 font-medium italic">
                    {product.ideal}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hosting Duration Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                Prepaid Hosting Plans
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                One-time payment. No subscriptions. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* 5-Year */}
              <div className="border border-gray-200 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-serif text-gray-900 mb-2">5-Year Memorial</h3>
                <p className="text-gray-500 text-sm mb-4">Perfect for starting out</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">From $99</div>
                <p className="text-gray-500 text-sm mb-6">One-time payment</p>
                <ul className="text-left space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>20 photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>2 videos (5 min each)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>Custom memorial page</span>
                  </li>
                </ul>
              </div>

              {/* 10-Year - Featured */}
              <div className="border-2 border-primary-500 rounded-2xl p-8 text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-2">10-Year Memorial</h3>
                <p className="text-gray-500 text-sm mb-4">Best value for families</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">From $149</div>
                <p className="text-gray-500 text-sm mb-6">Less than $15/year</p>
                <ul className="text-left space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>40 photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>3 videos (10 min each)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>Custom memorial page</span>
                  </li>
                </ul>
              </div>

              {/* 25-Year */}
              <div className="border border-gray-200 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-serif text-gray-900 mb-2">25-Year Memorial</h3>
                <p className="text-gray-500 text-sm mb-4">Legacy for generations</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">From $199</div>
                <p className="text-gray-500 text-sm mb-6">Less than $8/year</p>
                <ul className="text-left space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>60 photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>5 videos (15 min each)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-memorial-sage" />
                    <span>Custom memorial page</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/order"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
              >
                View Full Pricing & Order
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container-wide text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Have Questions?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Check our frequently asked questions or get in touch with our Auckland-based team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#faq"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-colors"
              >
                View FAQs
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Why MemoriQR Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                The MemoriQR Difference
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Built for modern families who want control, convenience, and quality.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Instant Self-Service */}
              <div className="bg-memorial-cream rounded-2xl p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Instant Online Ordering
                </h3>
                <p className="text-gray-600">
                  No emails, no phone calls, no waiting. Order online in minutes and start uploading memories immediately. You're in control of your memorial page.
                </p>
              </div>

              {/* NFC Technology */}
              <div className="bg-memorial-cream rounded-2xl p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  NFC + QR Technology
                </h3>
                <p className="text-gray-600">
                  Not just QR codes. Our NFC tags let visitors simply tap their phone to view the memorial – no camera or app required. Future-proof technology.
                </p>
              </div>

              {/* Premium Materials */}
              <div className="bg-memorial-cream rounded-2xl p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Metalphoto® Technology
                </h3>
                <p className="text-gray-600">
                  Our QR plates use Metalphoto® anodised aluminium with sub-surface printing – sealed under an 8 micron protective layer with 20+ year UV resistance. Built to last outdoors for decades.
                </p>
              </div>

              {/* Transparent Pricing */}
              <div className="bg-memorial-cream rounded-2xl p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  One-Time Payment
                </h3>
                <p className="text-gray-600">
                  No subscriptions, no monthly fees, no surprises. Pay once for 5, 10, or 25 years of hosting. Pricing is clear and upfront.
                </p>
              </div>

              {/* Pets & People */}
              <div className="bg-memorial-cream rounded-2xl p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Pets & People
                </h3>
                <p className="text-gray-600">
                  Perfect for beloved pets or cherished family members. Our memorial pages are designed to honour any life worth remembering.
                </p>
              </div>

              {/* Local Service */}
              <div className="bg-memorial-cream rounded-2xl p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Auckland-Based Team
                </h3>
                <p className="text-gray-600">
                  We're a local NZ business. Auckland orders ship within days, and you can reach a real person if you need help. No overseas call centres.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/order"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
              >
                Create Your Memorial
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
