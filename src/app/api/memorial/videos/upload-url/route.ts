import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TIER_LIMITS } from '@/lib/pricing'
import type { HostingDuration } from '@/types/database'

interface MemorialRecord {
  id: string
  videos_json: any[]
  hosting_duration: HostingDuration
}

// POST - Get signed upload URL for direct browser upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, session, fileName, fileType, fileSize } = body

    if (!token) {
      return NextResponse.json({ error: 'Edit token is required' }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Session expired. Please refresh the page and verify your email again.' }, { status: 401 })
    }

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'File name and type are required' }, { status: 400 })
    }

    // Validate file size (max 50MB)
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
    if (fileSize && fileSize > MAX_VIDEO_SIZE) {
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(1)
      return NextResponse.json({ 
        error: `Video file is too large (${sizeMB}MB). Maximum upload size is 50MB.` 
      }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-m4v']
    if (!validTypes.includes(fileType)) {
      return NextResponse.json({ 
        error: `Invalid video format. Please upload MP4, MOV, or WEBM files.` 
      }, { status: 400 })
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

    // Check video limit
    const currentVideos = (memorial.videos_json || []) as any[]
    const limit = TIER_LIMITS[memorial.hosting_duration]?.videos || 2

    if (currentVideos.length >= limit) {
      return NextResponse.json({ 
        error: `Video limit reached. Your plan allows ${limit} video${limit === 1 ? '' : 's'} and you already have ${currentVideos.length}.` 
      }, { status: 400 })
    }

    // Generate unique file path
    const fileExt = fileName.split('.').pop() || 'mp4'
    const uniqueFileName = `memorial-${memorial.id}/video-${Date.now()}.${fileExt}`

    // Create signed upload URL (valid for 5 minutes)
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('memorial-videos')
      .createSignedUploadUrl(uniqueFileName)

    if (signedUrlError || !signedUrl) {
      console.error('Failed to create signed URL:', signedUrlError)
      return NextResponse.json({ error: 'Failed to prepare upload. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      uploadUrl: signedUrl.signedUrl,
      token: signedUrl.token,
      path: uniqueFileName,
      memorialId: memorial.id,
    })
  } catch (error) {
    console.error('Get upload URL error:', error)
    return NextResponse.json({ error: 'Failed to prepare upload' }, { status: 500 })
  }
}
