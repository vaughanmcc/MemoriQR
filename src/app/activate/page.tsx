import { Metadata } from 'next'
import { EmbedWrapper } from '@/components/layout/EmbedWrapper'
import { ActivateForm } from '@/components/activate/ActivateForm'

export const metadata: Metadata = {
  title: 'Activate Your Memorial Tag',
  description: 'Enter your activation code to set up your memorial page.',
}

export default function ActivatePage() {
  return (
    <EmbedWrapper>
      <main className="min-h-screen bg-memorial-cream">
        <div className="container-narrow py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Activate Your Memorial
            </h1>
            <p className="text-lg text-gray-600">
              Enter the activation code from your email or the card that came with your tag.
            </p>
          </div>
          
          <ActivateForm />
        </div>
      </main>
    </EmbedWrapper>
  )
}
