import Image from 'next/image'

export function UseCasesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Gravestone with QR Code */}
          <div className="relative group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-memorial-cream">
              <Image
                src="/images/gravestone-qr.jpg"
                alt="Gravestone with MemoriQR plate attached"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white text-lg font-medium">
                  A lasting tribute at the graveside
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Weatherproof Metalphoto® plates designed to last generations
                </p>
              </div>
            </div>
          </div>

          {/* Pet Memorial - Girl scanning NFC */}
          <div className="relative group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-memorial-cream">
              {/* Replace with real image: /images/pet-memorial-nfc.jpg */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-amber-300/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-amber-700 font-medium">Pet Memorial NFC Scan</p>
                  <p className="text-amber-600 text-sm mt-1">Image placeholder</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white text-lg font-medium">
                  Remembering beloved companions
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Tap to instantly relive precious memories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
