import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Heart, Users, MapPin, Award, Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | MemoriQR Australia',
  description: 'Learn about MemoriQR and our mission to help Australian families preserve precious memories of their loved ones. Premium QR memorial tags shipped Australia-wide.',
  keywords: [
    'about MemoriQR',
    'pet memorial company Australia',
    'memorial tag manufacturer',
    'QR pet tag Australia',
    'who makes MemoriQR',
  ],
  alternates: {
    canonical: 'https://memoriqr.co.nz/australia/about',
    languages: {
      'en-AU': 'https://memoriqr.co.nz/australia/about',
      'en-NZ': 'https://memoriqr.co.nz/about',
    },
  },
  openGraph: {
    title: 'About Us | MemoriQR Australia',
    description: 'Learn about MemoriQR and our mission to help Australian families preserve precious memories.',
    url: 'https://memoriqr.co.nz/australia/about',
    siteName: 'MemoriQR',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function AustraliaAboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-memorial-cream">
        {/* Hero */}
        <section className="bg-white py-16 md:py-24">
          <div className="container-narrow text-center">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm mb-6">
              🇦🇺 Serving Australia
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
              Premium Memorial Products,
              <br />
              <span className="text-primary-600">Crafted with Care</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              MemoriQR creates weatherproof memorial tags and QR plates 
              built to last for decades – each linked to a digital gallery 
              to share photos, videos, and stories.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-600 mb-4">
                  Losing a beloved pet or family member is never easy. We created 
                  MemoriQR to give families a beautiful, lasting physical tribute 
                  to those they've lost.
                </p>
                <p className="text-gray-600 mb-4">
                  Our Metalphoto® plates are built to withstand the harshest 
                  outdoor conditions – UV-resistant for 20+ years, rated to 
                  300°C+. Combined with NFC technology and a digital 
                  photo gallery, they offer a complete memorial solution.
                </p>
                <p className="text-gray-600">
                  Based in Auckland, New Zealand, we proudly serve families 
                  across Australia and New Zealand with fast international 
                  shipping and genuine care during difficult times.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <Heart className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">5-10</div>
                    <div className="text-sm text-gray-500">Years Prepaid Hosting</div>
                  </div>
                  <div className="text-center p-4">
                    <Truck className="h-8 w-8 text-memorial-sage mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">7-10</div>
                    <div className="text-sm text-gray-500">Days to Australia</div>
                  </div>
                  <div className="text-center p-4">
                    <MapPin className="h-8 w-8 text-memorial-gold mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">All States</div>
                    <div className="text-sm text-gray-500">Australia-Wide Delivery</div>
                  </div>
                  <div className="text-center p-4">
                    <Award className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">20+</div>
                    <div className="text-sm text-gray-500">Year UV Resistance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <h2 className="text-3xl font-serif text-gray-900 text-center mb-12">
              What We Stand For
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Compassion First
                </h3>
                <p className="text-gray-600">
                  We understand grief. Every interaction is handled with 
                  empathy, patience, and care.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-memorial-sage/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-memorial-sage" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Quality Materials
                </h3>
                <p className="text-gray-600">
                  Our Metalphoto® anodised aluminium plates feature sub-surface 
                  printing sealed under an 8 micron protective layer, providing 
                  20+ years of UV resistance. They withstand temperatures over 
                  300°C and meet military-grade specifications – built to last outdoors for decades.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-memorial-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-memorial-gold" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Serving Australia
                </h3>
                <p className="text-gray-600">
                  We ship to Sydney, Melbourne, Brisbane, Perth, Adelaide, 
                  and all Australian states and territories. Expect your 
                  memorial tag within 7-10 business days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container-narrow text-center">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">
              Ready to Create a Memorial?
            </h2>
            <p className="text-gray-600 mb-8">
              Honor the memory of your loved one with a beautiful, lasting tribute.
              Prices in AUD, shipped directly to your door across Australia.
            </p>
            <Link href="/australia/order" className="btn-primary">
              Get Started
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
