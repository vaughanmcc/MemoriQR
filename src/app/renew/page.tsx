import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RenewalForm } from '@/components/renew/RenewalForm'

export const metadata: Metadata = {
  title: 'Renew Memorial Hosting',
  description: 'Extend your memorial hosting to keep your loved one\'s tribute online.',
}

export default function RenewPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-memorial-cream">
        <div className="container-narrow py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Renew Memorial Hosting
            </h1>
            <p className="text-lg text-gray-600">
              Keep your loved one's memorial online. Enter your memorial URL or order number to renew.
            </p>
          </div>
          
          <RenewalForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
