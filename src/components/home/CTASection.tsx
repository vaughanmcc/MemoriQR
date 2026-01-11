import Link from 'next/link'
import { Heart } from 'lucide-react'

export function CTASection() {
  return (
    <section className="section bg-primary-600 text-white">
      <div className="container-wide text-center">
        <Heart className="h-12 w-12 mx-auto mb-6 text-primary-200" />
        
        <h2 className="text-3xl md:text-4xl font-serif mb-4">
          Ready to Create a Lasting Memorial?
        </h2>
        
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Preserve the memories of your beloved pet or loved one with a 
          beautiful digital memorial that will last for years to come.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/order"
            className="btn bg-white text-primary-600 hover:bg-primary-50 text-base px-8 py-4"
          >
            Get Started Today
          </Link>
          <Link
            href="/activate"
            className="btn border-2 border-white/30 bg-transparent text-white hover:bg-white/10 text-base px-8 py-4"
          >
            I Have a Tag to Activate
          </Link>
        </div>
      </div>
    </section>
  )
}
