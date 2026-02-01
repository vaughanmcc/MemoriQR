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
          <div className="bg-white rounded-2xl shadow-md p-10 md:p-14 text-center border border-gray-100">
            {/* Success icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
              <CheckCircle className="h-12 w-12 text-green-700" />
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-5">
              Thank You for Your Order!
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Your memorial has been created. We'll send you an email with 
              instructions to upload photos and customize your memorial page.
            </p>

            {/* Next steps */}
            <div className="bg-memorial-cream rounded-xl p-8 md:p-10 mb-10 text-left border border-amber-100">
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-8 text-center">
                What Happens Next?
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Check your email</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      We've sent your order confirmation and activation link. 
                      Check your inbox (and spam folder) for an email from MemoriQR.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-primary-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Upload your memories</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Click the activation link in your email to add photos, 
                      videos, and a heartfelt message to your memorial page.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Receive your tag</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Your memorial tag will be shipped to you shortly. 
                      NFC tags ship in 2-3 days, QR plates in 7-10 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary text-lg px-6 py-3">
                Return Home
              </Link>
              <Link href="/contact" className="btn-outline text-lg px-6 py-3">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Order another memorial */}
          <div className="mt-8 bg-white rounded-2xl shadow-md p-10 text-center border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">
              Need Another Memorial?
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Honour another loved one with their own dedicated memorial page.
            </p>
            <Link href="/order" className="btn-primary text-lg px-6 py-3">
              Order Another Memorial
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
