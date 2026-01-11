import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Mail, Package, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your MemoriQR order has been confirmed.',
}

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-memorial-cream">
        <div className="container-narrow py-16 md:py-24">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
            {/* Success icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Thank You for Your Order!
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              Your memorial has been created. We'll send you an email with 
              instructions to upload photos and customize your memorial page.
            </p>

            {/* Next steps */}
            <div className="bg-memorial-cream rounded-xl p-6 md:p-8 mb-8 text-left">
              <h2 className="text-xl font-serif text-gray-900 mb-6 text-center">
                What Happens Next?
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Check your email</h3>
                    <p className="text-gray-600">
                      We've sent your order confirmation and activation link. 
                      Check your inbox (and spam folder) for an email from MemoriQR.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload your memories</h3>
                    <p className="text-gray-600">
                      Click the activation link in your email to add photos, 
                      videos, and a heartfelt message to your memorial page.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Receive your tag</h3>
                    <p className="text-gray-600">
                      Your memorial tag will be shipped to you shortly. 
                      NFC tags ship in 2-3 days, QR plates in 7-10 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                Return Home
              </Link>
              <Link href="/contact" className="btn-outline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
