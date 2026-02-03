import { Metadata } from 'next'
import Link from 'next/link'
import { EmbedWrapper } from '@/components/layout/EmbedWrapper'
import { OrderForm } from '@/components/order/OrderForm'

export const metadata: Metadata = {
  title: 'Order Your Memorial Tag | MemoriQR Australia',
  description: 'Order premium QR memorial tags and NFC pet tags with Australian pricing. Create lasting digital memorials for beloved pets and family. Ships Australia-wide.',
  keywords: [
    'order pet memorial Australia',
    'buy QR pet tag',
    'NFC pet tag order',
    'pet memorial tag delivery Australia',
    'order memorial plaque',
    'pet remembrance gift Australia',
  ],
  alternates: {
    canonical: 'https://memoriqr.co.nz/australia/order',
    languages: {
      'en-AU': 'https://memoriqr.co.nz/australia/order',
      'en-NZ': 'https://memoriqr.co.nz/order',
    },
  },
  openGraph: {
    title: 'Order Your Memorial Tag | MemoriQR Australia',
    description: 'Order premium QR memorial tags with Australian pricing. Ships Australia-wide.',
    url: 'https://memoriqr.co.nz/australia/order',
    siteName: 'MemoriQR',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function AustraliaOrderPage() {
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
            
            {/* Australia notice */}
            <p className="text-sm text-gray-500 mt-4">
              🇦🇺 Prices displayed in AUD • Ships from New Zealand to all Australian states
            </p>
          </div>
          
          <OrderForm locale="au" />
        </div>
      </main>
    </EmbedWrapper>
  )
}
