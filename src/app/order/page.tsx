import { Metadata } from 'next'
import { EmbedWrapper } from '@/components/layout/EmbedWrapper'
import { OrderForm } from '@/components/order/OrderForm'

export const metadata: Metadata = {
  title: 'Create Your Memorial',
  description: 'Choose your memorial package and create a lasting tribute for your loved one.',
}

export default function OrderPage() {
  return (
    <EmbedWrapper>
      <main className="min-h-screen bg-memorial-cream">
        <div className="container-wide py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Create Your Memorial
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your hosting duration and product type to get started. 
              You'll be able to upload photos and customize the memorial after checkout.
            </p>
          </div>
          
          <OrderForm />
        </div>
      </main>
    </EmbedWrapper>
  )
}
