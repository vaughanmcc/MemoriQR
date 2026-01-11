'use client'

import { MemorialVideo } from '@/types'

interface VideoPlayerProps {
  video: MemorialVideo
}

export function VideoPlayer({ video }: VideoPlayerProps) {
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
