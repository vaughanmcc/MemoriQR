import Link from 'next/link'
import { Heart, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden memorial-gradient">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>
      
      <div className="container-wide py-20 md:py-32 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Now serving New Zealand & Australia</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 leading-tight">
            Create a Lasting Memorial
            <br />
            <span className="text-primary-600">That Lives Forever</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Transform memories of your beloved pet or loved one into a beautiful 
            digital memorial. Scan our premium NFC tags or QR plates to share 
            photos, videos, and stories – anywhere, anytime.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/order" className="btn-primary text-base px-8 py-4">
              Create Memorial
            </Link>
            <Link href="/#how-it-works" className="btn-outline text-base px-8 py-4">
              See How It Works
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-memorial-gold" />
              <span>5-25 Year Hosting</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-memorial-gold" />
              <span>Unlimited Photos & Videos</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-memorial-gold" />
              <span>Metalphoto® Plates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
