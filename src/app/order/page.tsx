import { Metadata } from 'next'
import Link from 'next/link'
import { EmbedWrapper } from '@/components/layout/EmbedWrapper'
import { OrderForm } from '@/components/order/OrderForm'

export const metadata: Metadata = {
  title: 'Order Your Memorial Tag',
  description: 'Order premium NFC memorial tags and Metalphoto® QR plates. Weatherproof, UV-resistant memorial products with digital photo gallery.',
  keywords: [
    'order memorial tag', 'buy QR plate', 'memorial plaque order',
    'pet memorial tag NZ', 'headstone QR code', 'crematorium memorial',
  ],
}

export default function OrderPage() {
  return (
    <EmbedWrapper>
      <main className="min-h-screen bg-memorial-cream">
        <div className="container-wide py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Order Your Memorial Tag
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your memorial tag package. Includes weatherproof NFC tag 
              or QR plate, plus a digital photo gallery to share memories.
            </p>
            
            {/* Activation Code CTA */}
            <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-emerald-800 font-medium">Already have an activation code?</p>
                  <Link 
                    href="/activate" 
                    className="text-emerald-600 font-bold hover:text-emerald-700 text-lg inline-flex items-center gap-1"
                  >
                    Activate your memorial here 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <OrderForm />
        </div>
      </main>
    </EmbedWrapper>
  )
}
