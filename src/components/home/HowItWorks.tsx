import { ShoppingCart, Upload, Smartphone, Heart } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Choose Your Memorial',
    description: 'Select your hosting duration (5, 10, or 25 years) and product type – NFC tag, QR plate, or both.',
    icon: ShoppingCart,
  },
  {
    number: '02',
    title: 'Receive Your Tag',
    description: 'We\'ll ship your premium stainless steel plate or NFC tag directly to your door within days.',
    icon: Heart,
  },
  {
    number: '03',
    title: 'Upload Memories',
    description: 'Add photos, videos, and a heartfelt message to create a beautiful memorial page.',
    icon: Upload,
  },
  {
    number: '04',
    title: 'Share & Remember',
    description: 'Scan the tag anytime to visit the memorial. Share the link with family and friends.',
    icon: Smartphone,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section bg-white">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Creating a lasting digital memorial is simple. Here's how to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gray-200" />
              )}
              
              <div className="relative bg-memorial-cream rounded-2xl p-8 text-center">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-semibold text-lg mb-6">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <step.icon className="h-10 w-10 text-memorial-sage" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-serif text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
