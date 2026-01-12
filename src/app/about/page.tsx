import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Heart, Users, MapPin, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about MemoriQR and our mission to help families preserve precious memories of their loved ones.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-memorial-cream">
        {/* Hero */}
        <section className="bg-white py-16 md:py-24">
          <div className="container-narrow text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
              Preserving Memories,
              <br />
              <span className="text-primary-600">One Tag at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              MemoriQR was born from a simple belief: the memories of those 
              we love deserve to be preserved, shared, and celebrated for 
              years to come.
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
                  MemoriQR to give families a beautiful, lasting way to remember 
                  and honor those they've lost.
                </p>
                <p className="text-gray-600 mb-4">
                  Our memorial tags combine premium physical craftsmanship with 
                  modern technology. A simple scan opens a world of photos, 
                  videos, and stories – keeping memories alive for future 
                  generations.
                </p>
                <p className="text-gray-600">
                  Based in Auckland, we understand the importance of local 
                  service, fast delivery, and genuine care during difficult times.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <Heart className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">5-25</div>
                    <div className="text-sm text-gray-500">Years Prepaid Hosting</div>
                  </div>
                  <div className="text-center p-4">
                    <Users className="h-8 w-8 text-memorial-sage mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">Local</div>
                    <div className="text-sm text-gray-500">Auckland-Based Team</div>
                  </div>
                  <div className="text-center p-4">
                    <MapPin className="h-8 w-8 text-memorial-gold mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">NZ & AU</div>
                    <div className="text-sm text-gray-500">Fast Shipping</div>
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
                  <MapPin className="h-8 w-8 text-memorial-gold" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  Proudly Local
                </h3>
                <p className="text-gray-600">
                  Based in Auckland, we offer fast NZ shipping and understand 
                  the unique needs of Kiwi families.
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
            </p>
            <Link href="/order" className="btn-primary">
              Get Started
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
