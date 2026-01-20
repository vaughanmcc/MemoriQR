import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { HostingDuration } from '@/types/database'

interface MemorialRecord {
  id: string
  videos_json: any[]
  hosting_duration: HostingDuration
}

// POST - Register uploaded video after successful direct upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, session, path, fileName } = body

    if (!token) {
      return NextResponse.json({ error: 'Edit token is required' }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Session expired. Please refresh the page and verify your email again.' }, { status: 401 })
    }

    if (!path) {
      return NextResponse.json({ error: 'Video path is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify edit token and get memorial
    const { data, error: lookupError } = await supabase
      .from('memorial_records')
      .select('id, videos_json, hosting_duration')
      .eq('edit_token', token)
      .single()

    const memorial = data as MemorialRecord | null

    if (lookupError || !memorial) {
      return NextResponse.json({ error: 'Invalid edit token. Please use the original edit link from your email.' }, { status: 403 })
    }

    // Verify session token is valid and not expired
    const { data: sessionData, error: sessionError } = await supabase
      .from('edit_verification_codes')
      .select('*')
      .eq('memorial_id', memorial.id)
      .eq('code', `SESSION:${session}`)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Session expired. Please refresh the page and verify your email again.' }, { status: 401 })
    }

    // Verify the file exists in storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('memorial-videos')
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      })

    if (fileError || !fileData || fileData.length === 0) {
      return NextResponse.json({ error: 'Video file not found. Upload may have failed.' }, { status: 400 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('memorial-videos')
      .getPublicUrl(path)

    // Create video record
    const currentVideos = (memorial.videos_json || []) as any[]
    const newVideo = {
      id: `video-${Date.now()}`,
      type: 'upload',
      youtubeId: null,
      url: publicUrl,
      publicId: path,
      title: fileName?.replace(/\.[^/.]+$/, '') || 'Uploaded Video',
      order: currentVideos.length,
    }

    // Update memorial with new video
    const updatedVideos = [...currentVideos, newVideo]
    const { error: updateError } = await supabase
      .from('memorial_records')
      .update({ 
        videos_json: updatedVideos,
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
      details: { type: 'upload' },
    })

    return NextResponse.json({
      success: true,
      videos: updatedVideos,
    })
  } catch (error) {
    console.error('Register video error:', error)
    return NextResponse.json({ error: 'Failed to register video' }, { status: 500 })
  }
}
