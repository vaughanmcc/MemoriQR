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
              <Image
                src="/images/pet-memorial-nfc.jpg"
                alt="Person scanning NFC tag at pet memorial"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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
