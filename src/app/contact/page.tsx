import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ContactForm } from '@/components/contact/ContactForm'
import { Mail, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the MemoriQR team. We\'re here to help with any questions about our memorial services.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-memorial-cream">
        <div className="container-wide py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-gray-600">
                Have a question or need assistance? We're here to help.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact info */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-xl font-serif text-gray-900 mb-6">
                    Contact Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Email</h3>
                        <a 
                          href="mailto:info@memoriqr.co.nz"
                          className="text-primary-600 hover:underline"
                        >
                          info@memoriqr.co.nz
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Location</h3>
                        <p className="text-gray-600">Auckland, New Zealand</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Response Time</h3>
                        <p className="text-gray-600">
                          We aim to respond within 24 hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ callout */}
                <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                  <h3 className="font-medium text-primary-900 mb-2">
                    Looking for quick answers?
                  </h3>
                  <p className="text-primary-700 text-sm mb-4">
                    Check our FAQ section for answers to common questions about 
                    orders, shipping, and memorials.
                  </p>
                  <a 
                    href="/#faq"
                    className="text-primary-600 font-medium hover:underline text-sm"
                  >
                    View FAQs →
                  </a>
                </div>
              </div>

              {/* Contact form */}
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
