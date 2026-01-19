import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TIER_LIMITS } from '@/lib/pricing'
import type { HostingDuration } from '@/types/database'

interface MemorialRecord {
  id: string
  photos: any[]
  videos?: any[]
  hosting_duration: HostingDuration
  memorial_slug: string
}

// POST - Add photos to memorial
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token') as string
    const photoFiles = formData.getAll('photos') as File[]

    if (!token) {
      return NextResponse.json({ error: 'Edit token is required' }, { status: 400 })
    }

    if (photoFiles.length === 0) {
      return NextResponse.json({ error: 'No photos provided' }, { status: 400 })
    }

    // Validate file sizes (max 10MB per photo)
    const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = photoFiles.filter(f => f.size > MAX_PHOTO_SIZE)
    if (oversizedFiles.length > 0) {
      return NextResponse.json({ 
        error: `${oversizedFiles.length} photo(s) exceed the 10MB size limit. Please resize and try again.` 
      }, { status: 400 })
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
    const invalidFiles = photoFiles.filter(f => !validTypes.includes(f.type))
    if (invalidFiles.length > 0) {
      return NextResponse.json({ 
        error: `Invalid file type. Please upload images only (JPG, PNG, GIF, WEBP).` 
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify token and get memorial
    const { data, error: lookupError } = await supabase
      .from('memorial_records')
      .select('id, photos, hosting_duration, memorial_slug')
      .eq('edit_token', token)
      .single()

    const memorial = data as MemorialRecord | null

    if (lookupError || !memorial) {
      return NextResponse.json({ error: 'Invalid edit token' }, { status: 403 })
    }

    // Check photo limit
    const currentPhotos = (memorial.photos || []) as any[]
    const limit = TIER_LIMITS[memorial.hosting_duration as keyof typeof TIER_LIMITS]?.photos || 20
    const availableSlots = limit - currentPhotos.length

    if (availableSlots <= 0) {
      return NextResponse.json({ 
        error: `Photo limit reached. Your plan allows ${limit} photos and you already have ${currentPhotos.length}.` 
      }, { status: 400 })
    }

    // Check if trying to upload more than available slots
    if (photoFiles.length > availableSlots) {
      return NextResponse.json({ 
        error: `You can only add ${availableSlots} more photo${availableSlots === 1 ? '' : 's'}. You tried to upload ${photoFiles.length}. Your plan allows ${limit} photos total.` 
      }, { status: 400 })
    }

    const filesToUpload = photoFiles.slice(0, availableSlots)
    const memorialPrefix = `memorial-${memorial.id}`
    const newPhotos = []

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${memorialPrefix}/photo-${Date.now()}-${i}.${fileExt}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadError) {
        console.error(`Failed to upload photo:`, uploadError)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('memorial-photos')
        .getPublicUrl(fileName)

      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url: publicUrl,
        publicId: fileName,
        width: 800,
        height: 600,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        order: currentPhotos.length + i,
        isProfile: false,
      })
    }

    // Update memorial with new photos
    const updatedPhotos = [...currentPhotos, ...newPhotos]
    const { error: updateError } = await supabase
      .from('memorial_records')
      .update({ 
        photos: updatedPhotos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memorial.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save photos' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      memorial_id: memorial.id,
      activity_type: 'photos_added',
      details: { count: newPhotos.length },
    })

    return NextResponse.json({
      success: true,
      photos: updatedPhotos,
      added: newPhotos.length,
    })
  } catch (error) {
    console.error('Add photos error:', error)
    return NextResponse.json({ error: 'Failed to add photos' }, { status: 500 })
  }
}

// DELETE - Remove a photo from memorial
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, photoId } = body

    if (!token || !photoId) {
      return NextResponse.json({ error: 'Token and photoId are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify token and get memorial
    const { data, error: lookupError } = await supabase
      .from('memorial_records')
      .select('id, photos')
      .eq('edit_token', token)
      .single()

    const memorial = data as { id: string; photos: any[] } | null

    if (lookupError || !memorial) {
      return NextResponse.json({ error: 'Invalid edit token' }, { status: 403 })
    }

    const currentPhotos = (memorial.photos || []) as any[]
    const photoToDelete = currentPhotos.find((p: any) => p.id === photoId)

    if (!photoToDelete) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Prevent deleting last photo
    if (currentPhotos.length <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last photo' }, { status: 400 })
    }

    // Delete from storage
    if (photoToDelete.publicId) {
      await supabase.storage
        .from('memorial-photos')
        .remove([photoToDelete.publicId])
    }

    // Update memorial without this photo
    const updatedPhotos = currentPhotos
      .filter((p: any) => p.id !== photoId)
      .map((p: any, index: number) => ({ ...p, order: index }))

    // Ensure there's still a profile photo
    const hasProfile = updatedPhotos.some((p: any) => p.isProfile)
    if (!hasProfile && updatedPhotos.length > 0) {
      updatedPhotos[0].isProfile = true
    }

    const { error: updateError } = await supabase
      .from('memorial_records')
      .update({ 
        photos: updatedPhotos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memorial.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update memorial' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      memorial_id: memorial.id,
      activity_type: 'photo_deleted',
      details: { photoId },
    })

    return NextResponse.json({
      success: true,
      photos: updatedPhotos,
    })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}

// PATCH - Set profile photo
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, photoId } = body

    if (!token || !photoId) {
      return NextResponse.json({ error: 'Token and photoId are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify token and get memorial
    const { data, error: lookupError } = await supabase
      .from('memorial_records')
      .select('id, photos')
      .eq('edit_token', token)
      .single()

    const memorial = data as { id: string; photos: any[] } | null

    if (lookupError || !memorial) {
      return NextResponse.json({ error: 'Invalid edit token' }, { status: 403 })
    }

    const currentPhotos = (memorial.photos || []) as any[]
    
    // Update isProfile flag
    const updatedPhotos = currentPhotos.map((p: any) => ({
      ...p,
      isProfile: p.id === photoId,
    }))

    const { error: updateError } = await supabase
      .from('memorial_records')
      .update({ 
        photos: updatedPhotos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memorial.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update memorial' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      photos: updatedPhotos,
    })
  } catch (error) {
    console.error('Set profile photo error:', error)
    return NextResponse.json({ error: 'Failed to set profile photo' }, { status: 500 })
  }
}
