import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Auckland',
    pet: 'Max (Golden Retriever)',
    quote: 'Having Max\'s memorial on a tag attached to his urn means we can share his story with anyone who visits. The quality of the plate is beautiful.',
    rating: 5,
  },
  {
    name: 'James & Emma K.',
    location: 'Wellington',
    pet: 'Luna (Cat)',
    quote: 'We were amazed at how easy it was to set up. Now our kids can tap the tag and see photos of Luna whenever they miss her. It\'s become a lovely way to remember her.',
    rating: 5,
  },
  {
    name: 'Dr. Lisa Chen',
    location: 'Northland Vet Clinic',
    pet: 'Partner',
    quote: 'We recommend MemoriQR to all our clients. The quality is outstanding and the local service means we can offer same-week delivery to grieving families.',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="section bg-memorial-cream">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            Loved by Families Across NZ
          </h2>
          <p className="text-lg text-gray-600">
            Join hundreds of families who have created lasting tributes to their beloved companions.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary-100" />
              
              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>
              
              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 relative z-10">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Author */}
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
                <p className="text-sm text-primary-600 mt-1">{testimonial.pet}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
