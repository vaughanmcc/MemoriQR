import { Heart, Shield, Truck, Clock } from 'lucide-react'

const features = [
  {
    title: 'Made with Love in NZ',
    description: 'Every memorial tag is crafted locally in Auckland with premium materials that last.',
    icon: Heart,
  },
  {
    title: 'Secure & Private',
    description: 'Your memories are safely hosted on secure servers. Control who sees the memorial.',
    icon: Shield,
  },
  {
    title: 'Fast Delivery',
    description: 'Auckland orders ship within 2-3 business days. NZ-wide delivery in under a week.',
    icon: Truck,
  },
  {
    title: 'Long-term Hosting',
    description: 'Choose 5, 10, or 25 years of hosting. One-time payment, no subscriptions.',
    icon: Clock,
  },
]

export function TestimonialsSection() {
  return (
    <section className="section bg-memorial-cream">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            Why Choose MemoriQR?
          </h2>
          <p className="text-lg text-gray-600">
            A locally-made, heartfelt way to preserve and share precious memories.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm text-center"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-6">
                <feature.icon className="h-7 w-7" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-serif text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
