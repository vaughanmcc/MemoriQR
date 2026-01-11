import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MemorialUploadForm } from '@/components/activate/MemorialUploadForm'
import { Database } from '@/types/database'

type RetailActivationCode = Database['public']['Tables']['retail_activation_codes']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Memorial = Database['public']['Tables']['memorial_records']['Row']

interface Props {
  params: { code: string }
}

export const metadata: Metadata = {
  title: 'Set Up Your Memorial',
  description: 'Upload photos and customize your memorial page.',
}

export default async function ActivateCodePage({ params }: Props) {
  const supabase = createClient()
  const code = params.code.toUpperCase()

  // Try to find the memorial associated with this code
  // For online orders, check by order pattern
  // For retail, check activation codes table

  // First check retail codes
  const { data: retailCode } = await supabase
    .from('retail_activation_codes')
    .select('*')
    .eq('activation_code', code)
    .single() as { data: RetailActivationCode | null }

  if (retailCode) {
    if (retailCode.is_used) {
      return (
        <>
          <Header />
          <main className="min-h-screen bg-memorial-cream flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <h1 className="text-2xl font-serif text-gray-900 mb-4">
                Code Already Used
              </h1>
              <p className="text-gray-600 mb-6">
                This activation code has already been used to create a memorial.
                If you need help accessing your memorial, please contact support.
              </p>
              <a href="/contact" className="btn-primary">
                Contact Support
              </a>
            </div>
          </main>
          <Footer />
        </>
      )
    }

    return (
      <>
        <Header />
        <main className="min-h-screen bg-memorial-cream py-12 md:py-20">
          <div className="container-wide">
            <MemorialUploadForm
              activationType="retail"
              activationCode={code}
              productType={retailCode.product_type}
              hostingDuration={retailCode.hosting_duration}
              partnerId={retailCode.partner_id ?? undefined}
            />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Check for online order (memorial already created, just needs content)
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', `MQR-${code}`)
    .eq('order_status', 'paid')
    .single() as { data: Order | null }

  if (order && order.memorial_id) {
    // Fetch the memorial separately
    const { data: memorial } = await supabase
      .from('memorial_records')
      .select('*')
      .eq('id', order.memorial_id)
      .single() as { data: Memorial | null }

    if (memorial) {
      if (memorial.is_published) {
        return (
          <>
            <Header />
            <main className="min-h-screen bg-memorial-cream flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <h1 className="text-2xl font-serif text-gray-900 mb-4">
                  Memorial Already Active
                </h1>
                <p className="text-gray-600 mb-6">
                  This memorial has already been set up and published.
                </p>
                <a 
                  href={`/memorial/${memorial.memorial_slug}`}
                  className="btn-primary"
                >
                  View Memorial
                </a>
              </div>
            </main>
            <Footer />
          </>
        )
      }

      return (
        <>
          <Header />
          <main className="min-h-screen bg-memorial-cream py-12 md:py-20">
            <div className="container-wide">
              <MemorialUploadForm
                activationType="online"
                memorialId={memorial.id}
                memorialSlug={memorial.memorial_slug}
                deceasedName={memorial.deceased_name}
                deceasedType={memorial.deceased_type}
                productType={memorial.product_type}
                hostingDuration={memorial.hosting_duration}
              />
            </div>
          </main>
          <Footer />
        </>
      )
    }
  }

  notFound()
}
