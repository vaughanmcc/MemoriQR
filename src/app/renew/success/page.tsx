import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { Check, Calendar, ExternalLink, Infinity } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Renewal Successful',
  description: 'Your memorial hosting has been extended.',
}

interface Props {
  searchParams: { session_id?: string }
}

export default async function RenewalSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect('/renew')
  }

  // Retrieve the Stripe session
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    notFound()
  }

  if (session.payment_status !== 'paid') {
    redirect('/renew?error=payment_failed')
  }

  const memorialId = session.metadata?.memorial_id
  const memorialSlug = session.metadata?.memorial_slug
  const extensionType = session.metadata?.extension_type

  // Get updated memorial info
  const supabase = createAdminClient()
  const { data: memorial } = await supabase
    .from('memorial_records')
    .select('deceased_name, memorial_slug, hosting_expires_at, hosting_duration')
    .eq('id', memorialId)
    .single()

  if (!memorial) {
    notFound()
  }

  const newExpiryDate = memorial.hosting_expires_at
    ? new Date(memorial.hosting_expires_at).toLocaleDateString('en-NZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const extensionLabel = {
    '1_year': '1 Year',
    '5_year': '5 Years',
    '10_year': '10 Years',
  }[extensionType || '1_year']

  return (
    <>
      <Header />
      <main className="min-h-screen bg-memorial-cream">
        <div className="container-narrow py-12 md:py-20">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              {/* Success icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-serif text-gray-900 mb-2">
                Renewal Successful!
              </h1>
              <p className="text-gray-600 mb-8">
                Thank you for extending the memorial for <strong>{memorial.deceased_name}</strong>.
              </p>

              {/* Renewal details */}
              <div className="bg-memorial-cream rounded-lg p-6 mb-8 text-left">
                <h2 className="font-medium text-gray-900 mb-4">Extension Details</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Extension:</span>
                    <span className="font-medium text-gray-900">{extensionLabel}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">New Expiry:</span>
                    {memorial.hosting_duration === 999 ? (
                      <span className="font-medium text-green-600 flex items-center gap-1">
                        <Infinity className="h-4 w-4" />
                        Never
                      </span>
                    ) : (
                      <span className="font-medium text-gray-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {newExpiryDate}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="font-medium text-gray-900">
                      ${((session.amount_total || 0) / 100).toFixed(2)} NZD
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href={`/memorial/${memorial.memorial_slug}`}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  View Memorial
                  <ExternalLink className="h-4 w-4" />
                </Link>
                
                <Link
                  href="/"
                  className="btn-outline w-full"
                >
                  Return Home
                </Link>
              </div>

              {/* Receipt info */}
              <p className="text-sm text-gray-500 mt-8">
                A confirmation email has been sent to your email address with your receipt.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
