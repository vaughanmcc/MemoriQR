'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { MemorialPhoto } from '@/types'

interface PhotoGalleryProps {
  photos: MemorialPhoto[]
  frame?: { border: string; shadow: string }
  theme?: { bg: string; accent: string; text: string; secondary: string }
}

export function PhotoGallery({ photos, frame, theme }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }

  return (
    <>
      {/* Grid with simple recessed frames */}
      <div className="photo-grid">
        {photos.slice(1).map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index + 1)}
            className="memorial-gallery-item aspect-square group cursor-pointer"
            aria-label={`View ${photo.caption || 'photo'} in fullscreen`}
          >
            <Image
              src={photo.url}
              alt={photo.caption || 'Memorial photo'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-50"
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white z-50"
            aria-label="Previous"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[currentIndex].url}
              alt={photos[currentIndex].caption || 'Memorial photo'}
              width={photos[currentIndex].width || 800}
              height={photos[currentIndex].height || 600}
              className="max-h-[80vh] w-auto object-contain"
            />
            {photos[currentIndex].caption && (
              <p className="text-white text-center mt-4">
                {photos[currentIndex].caption}
              </p>
            )}
          </div>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white z-50"
            aria-label="Next"
          >
            <ChevronRight className="h-10 w-10" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
