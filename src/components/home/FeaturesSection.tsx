import { 
  Smartphone, 
  Shield, 
  Cloud, 
  Image, 
  Video, 
  Globe,
  Zap,
  Lock
} from 'lucide-react'

const features = [
  {
    icon: Smartphone,
    title: 'NFC Tap Technology',
    description: 'Simply tap your phone to instantly view the memorial. No app required – works with all modern smartphones.',
  },
  {
    icon: Shield,
    title: 'Marine-Grade Steel',
    description: '316 stainless steel plates are laser-engraved and built to withstand any weather for decades.',
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Hosting',
    description: 'Your memories are safely stored with enterprise-grade security and daily backups.',
  },
  {
    icon: Image,
    title: 'Unlimited Photos',
    description: 'Upload as many photos as you like. We automatically optimize them for fast loading.',
  },
  {
    icon: Video,
    title: 'Video Support',
    description: 'Add up to 2 videos to bring memories to life. YouTube integration means unlimited streaming.',
  },
  {
    icon: Globe,
    title: 'Share Anywhere',
    description: 'Each memorial has a unique URL you can share with family and friends around the world.',
  },
  {
    icon: Zap,
    title: 'Fast NZ Delivery',
    description: 'Local Auckland production means NFC tags ship in 2-3 days, plates in 7-10 days.',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your memorial is only visible to those who have the link. No public listings or search indexing.',
  },
]

export function FeaturesSection() {
  return (
    <section className="section bg-white">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600">
            Premium materials, thoughtful design, and reliable hosting – 
            we've thought of everything so you can focus on what matters.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mb-5">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
