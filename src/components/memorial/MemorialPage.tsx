import Image from 'next/image'
import { Heart, Calendar, Eye, Share2 } from 'lucide-react'
import { Memorial } from '@/types/database'
import { MemorialPhoto, MemorialVideo } from '@/types'
import { formatDate, formatDateRange, getYouTubeThumbnail } from '@/lib/utils'
import { PhotoGallery } from './PhotoGallery'
import { VideoPlayer } from './VideoPlayer'
import { ShareButton } from './ShareButton'

interface MemorialPageProps {
  memorial: Memorial
}

export function MemorialPage({ memorial }: MemorialPageProps) {
  const photos = (memorial.photos_json as MemorialPhoto[]) || []
  const videos = (memorial.videos_json as MemorialVideo[]) || []
  const dateRange = formatDateRange(memorial.birth_date, memorial.death_date)

  return (
    <div className="min-h-screen memorial-gradient">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 no-print">
        <div className="container-narrow py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">MemoriQR</span>
          </a>
          <ShareButton slug={memorial.memorial_slug} name={memorial.deceased_name} />
        </div>
      </header>

      {/* Main content */}
      <main className="container-narrow py-12 md:py-20 memorial-page">
        {/* Hero section */}
        <div className="text-center mb-12">
          {/* Main photo */}
          {photos.length > 0 && (
            <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-8 relative">
              <Image
                src={photos[0].url}
                alt={memorial.deceased_name}
                fill
                className="object-cover rounded-full border-4 border-white shadow-lg"
                priority
              />
            </div>
          )}

          {/* Name and dates */}
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-3">
            {memorial.deceased_name}
          </h1>
          
          {dateRange && (
            <p className="text-xl text-gray-500 mb-4 flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5" />
              {dateRange}
            </p>
          )}

          {memorial.species && memorial.deceased_type === 'pet' && (
            <p className="text-lg text-memorial-sage">
              Beloved {memorial.species}
            </p>
          )}
        </div>

        {/* Memorial text */}
        {memorial.memorial_text && (
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 mb-12">
            <div className="memorial-text prose prose-lg max-w-none">
              {memorial.memorial_text.split('\n').map((paragraph, i) => (
                paragraph.trim() && <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Photo gallery */}
        {photos.length > 1 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">
              Photo Gallery
            </h2>
            <PhotoGallery photos={photos} />
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">
              Videos
            </h2>
            <div className="space-y-6">
              {videos.map((video) => (
                <VideoPlayer key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-200">
          <p className="flex items-center justify-center gap-2 mb-2">
            <Eye className="h-4 w-4" />
            <span>Viewed {memorial.views_count.toLocaleString()} times</span>
          </p>
          <p>
            Created with{' '}
            <a href="/" className="text-primary-600 hover:underline">
              MemoriQR
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
