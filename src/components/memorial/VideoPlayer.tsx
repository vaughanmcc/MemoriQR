'use client'

import { MemorialVideo } from '@/types'

interface VideoPlayerProps {
  video: MemorialVideo
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  // Handle uploaded videos (stored in Supabase Storage)
  if (video.type === 'upload' && video.url) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          src={video.url}
          title={video.title || 'Memorial video'}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  // Handle YouTube videos
  if (video.youtubeId) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
          title={video.title || 'Memorial video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  // Fallback for invalid video data
  return (
    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Video unavailable</p>
    </div>
  )
}
