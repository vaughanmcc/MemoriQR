import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TIER_LIMITS } from '@/lib/pricing'
import { getYouTubeId } from '@/lib/utils'
import type { HostingDuration } from '@/types/database'

interface MemorialRecord {
  id: string
  videos: any[]
  hosting_duration: HostingDuration
}

// POST - Add video to memorial
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    const supabase = createAdminClient()
    let token: string
    let videoUrl: string | null = null
    let videoFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData()
      token = formData.get('token') as string
      videoFile = formData.get('video') as File | null
    } else {
      // JSON (YouTube URL)
      const body = await request.json()
      token = body.token
      videoUrl = body.url
    }

    if (!token) {
      return NextResponse.json({ error: 'Edit token is required' }, { status: 400 })
    }

    if (!videoUrl && !videoFile) {
      return NextResponse.json({ error: 'Video URL or file is required' }, { status: 400 })
    }

    // Verify token and get memorial
    const { data, error: lookupError } = await supabase
      .from('memorial_records')
      .select('id, videos, hosting_duration')
      .eq('edit_token', token)
      .single()

    const memorial = data as MemorialRecord | null

    if (lookupError || !memorial) {
      return NextResponse.json({ error: 'Invalid edit token' }, { status: 403 })
    }

    // Check video limit
    const currentVideos = (memorial.videos || []) as any[]
    const limit = TIER_LIMITS[memorial.hosting_duration]?.videos || 2

    if (currentVideos.length >= limit) {
      return NextResponse.json({ 
        error: `Video limit reached (${limit} videos). Upgrade your plan for more.` 
      }, { status: 400 })
    }

    let newVideo: any

    if (videoUrl) {
      // YouTube video
      const youtubeId = getYouTubeId(videoUrl)
      if (!youtubeId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
      }

      newVideo = {
        id: `video-${Date.now()}`,
        type: 'youtube',
        youtubeId,
        url: null,
        title: '',
        order: currentVideos.length,
      }
    } else if (videoFile) {
      // Upload video file
      const memorialPrefix = `memorial-${memorial.id}`
      const fileExt = videoFile.name.split('.').pop() || 'mp4'
      const fileName = `${memorialPrefix}/video-${Date.now()}.${fileExt}`

      const arrayBuffer = await videoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('memorial-videos')
        .upload(fileName, buffer, {
          contentType: videoFile.type,
          upsert: true,
        })

      if (uploadError) {
        console.error('Failed to upload video:', uploadError)
        return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('memorial-videos')
        .getPublicUrl(fileName)

      newVideo = {
        id: `video-${Date.now()}`,
        type: 'upload',
        youtubeId: null,
        url: publicUrl,
        publicId: fileName,
        title: videoFile.name.replace(/\.[^/.]+$/, ''),
        order: currentVideos.length,
      }
    }

    // Update memorial with new video
    const updatedVideos = [...currentVideos, newVideo]
    const { error: updateError } = await supabase
      .from('memorial_records')
      .update({ 
        videos: updatedVideos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memorial.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save video' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      memorial_id: memorial.id,
      activity_type: 'video_added',
      details: { type: newVideo.type },
    })

    return NextResponse.json({
      success: true,
      videos: updatedVideos,
    })
  } catch (error) {
    console.error('Add video error:', error)
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 })
  }
}

// DELETE - Remove a video from memorial
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, videoId } = body

    if (!token || !videoId) {
      return NextResponse.json({ error: 'Token and videoId are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify token and get memorial
    const { data, error: lookupError } = await supabase
      .from('memorial_records')
      .select('id, videos')
      .eq('edit_token', token)
      .single()

    const memorial = data as { id: string; videos: any[] } | null

    if (lookupError || !memorial) {
      return NextResponse.json({ error: 'Invalid edit token' }, { status: 403 })
    }

    const currentVideos = (memorial.videos || []) as any[]
    const videoToDelete = currentVideos.find((v: any) => v.id === videoId)

    if (!videoToDelete) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Delete from storage if it's an uploaded file
    if (videoToDelete.publicId) {
      await supabase.storage
        .from('memorial-videos')
        .remove([videoToDelete.publicId])
    }

    // Update memorial without this video
    const updatedVideos = currentVideos
      .filter((v: any) => v.id !== videoId)
      .map((v: any, index: number) => ({ ...v, order: index }))

    const { error: updateError } = await supabase
      .from('memorial_records')
      .update({ 
        videos: updatedVideos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memorial.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update memorial' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      memorial_id: memorial.id,
      activity_type: 'video_deleted',
      details: { videoId },
    })

    return NextResponse.json({
      success: true,
      videos: updatedVideos,
    })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
