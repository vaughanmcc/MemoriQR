import Image from 'next/image'

export function UseCasesSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-primary-600 font-medium text-sm uppercase tracking-wider mb-2">
            For People & Pets
          </p>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900">
            Honour Every Life, Every Memory
          </h2>
        </div>

        {/* Image cards - constrained width */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Gravestone with QR Code */}
          <div className="relative group cursor-pointer">
            <div className="relative aspect-[3/2] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <Image
                src="/images/gravestone-qr.jpg"
                alt="Gravestone with MemoriQR plate attached"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium">
                  Cemetery Memorials
                </p>
                <p className="text-white/70 text-sm">
                  Weatherproof plates built to last
                </p>
              </div>
            </div>
          </div>

          {/* Pet Memorial */}
          <div className="relative group cursor-pointer">
            <div className="relative aspect-[3/2] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <Image
                src="/images/pet-memorial-nfc.jpg"
                alt="Person scanning NFC tag at pet memorial"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium">
                  Pet Memorials
                </p>
                <p className="text-white/70 text-sm">
                  Tap to relive precious moments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cemetery disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-6 max-w-2xl mx-auto">
          Please check with your cemetery before purchasing – policies on memorial attachments vary by location.
        </p>
      </div>
    </section>
  )
}
