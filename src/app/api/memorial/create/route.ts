import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateSlug, getYouTubeId, sanitizeText } from '@/lib/utils'
import { calculateExpiryDate, DEFAULT_PRICING } from '@/lib/pricing'
import type { HostingDuration, ProductType } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const activationType = formData.get('activationType') as string
    const activationCode = formData.get('activationCode') as string | null
    const existingMemorialId = formData.get('memorialId') as string | null
    const partnerId = formData.get('partnerId') as string | null
    
    const deceasedName = sanitizeText(formData.get('deceasedName') as string)
    const deceasedType = formData.get('deceasedType') as 'pet' | 'human'
    const species = formData.get('species') as string | null
    const birthDate = formData.get('birthDate') as string | null
    const deathDate = formData.get('deathDate') as string | null
    const memorialText = sanitizeText(formData.get('memorialText') as string || '')
    const hostingDuration = parseInt(formData.get('hostingDuration') as string) as HostingDuration
    const productType = formData.get('productType') as ProductType
    const profilePhotoIndex = parseInt(formData.get('profilePhotoIndex') as string || '0')
    const theme = formData.get('theme') as string || 'classic'
    const frame = formData.get('frame') as string || 'classic-gold'
    const contactEmail = formData.get('contactEmail') as string | null
    
    const photoFiles = formData.getAll('photos') as File[]

    if (!deceasedName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (photoFiles.length === 0) {
      return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Generate a unique memorial prefix for file organization
    const memorialPrefix = `memorial-${Date.now()}`

    // Upload photos to Supabase Storage
    const photos = []
    for (let index = 0; index < photoFiles.length; index++) {
      const file = photoFiles[index]
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${memorialPrefix}/photo-${index}.${fileExt}`
      
      // Convert File to ArrayBuffer then to Buffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadError) {
        console.error(`Failed to upload photo ${index}:`, uploadError)
        // Fall back to placeholder if upload fails
        photos.push({
          id: `photo-${Date.now()}-${index}`,
          url: '/placeholder-photo.svg',
          publicId: fileName,
          width: 800,
          height: 600,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          order: index,
          isProfile: index === profilePhotoIndex,
        })
        continue
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memorial-photos')
        .getPublicUrl(fileName)

      photos.push({
        id: `photo-${Date.now()}-${index}`,
        url: publicUrl,
        publicId: fileName,
        width: 800,
        height: 600,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        order: index,
        isProfile: index === profilePhotoIndex,
      })
    }

    // Reorder photos so profile photo is first
    const sortedPhotos = [...photos].sort((a, b) => {
      if (a.isProfile) return -1
      if (b.isProfile) return 1
      return a.order - b.order
    })

    // Process video
    const videos = []
    let videoOrder = 0

    // Handle YouTube URLs
    const videoUrlsJson = formData.get('videoUrls') as string | null
    if (videoUrlsJson) {
      try {
        const videoUrls = JSON.parse(videoUrlsJson) as string[]
        for (const url of videoUrls) {
          const youtubeId = getYouTubeId(url)
          if (youtubeId) {
            videos.push({
              id: `video-${Date.now()}-${videoOrder}`,
              type: 'youtube',
              youtubeId,
              url: null,
              title: '',
              order: videoOrder,
            })
            videoOrder++
          }
        }
      } catch (e) {
        console.error('Failed to parse videoUrls:', e)
      }
    }

    // Handle uploaded video files
    const videoFiles = formData.getAll('videoFiles') as File[]
    for (const videoFile of videoFiles) {
      const fileExt = videoFile.name.split('.').pop() || 'mp4'
      const fileName = `${memorialPrefix}/video-${videoOrder}.${fileExt}`
      
      // Convert File to Buffer for upload
      const arrayBuffer = await videoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memorial-videos')
        .upload(fileName, buffer, {
          contentType: videoFile.type,
          upsert: true,
        })

      if (uploadError) {
        console.error(`Failed to upload video ${videoOrder}:`, uploadError)
        // Skip this video if upload fails
        continue
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memorial-videos')
        .getPublicUrl(fileName)

      const videoId = `video-${Date.now()}-${videoOrder}`
      videos.push({
        id: videoId,
        type: 'upload',
        youtubeId: null,
        url: publicUrl,
        title: videoFile.name,
        order: videoOrder,
      })
      videoOrder++
    }

    let memorialSlug: string
    let memorialId: string

    if (activationType === 'online' && existingMemorialId) {
      // Update existing memorial
      const { data: memorial, error } = await supabase
        .from('memorial_records')
        .update({
          deceased_name: deceasedName,
          deceased_type: deceasedType,
          species: species || null,
          birth_date: birthDate || null,
          death_date: deathDate || null,
          memorial_text: memorialText,
          photos_json: sortedPhotos,
          videos_json: videos,
          theme: theme,
          frame: frame,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMemorialId)
        .select('memorial_slug')
        .single()

      if (error || !memorial) {
        console.error('Update memorial error:', error)
        return NextResponse.json({ error: 'Failed to update memorial' }, { status: 500 })
      }

      memorialSlug = memorial.memorial_slug
      memorialId = existingMemorialId

      // Log activity
      await supabase.from('activity_log').insert({
        memorial_id: memorialId,
        activity_type: 'published',
        details: { photoCount: sortedPhotos.length, hasVideo: videos.length > 0, theme },
      })
    } else if (activationType === 'retail' && activationCode) {
      // Create new memorial from retail code
      memorialSlug = generateSlug(deceasedName)
      const expiryDate = calculateExpiryDate(new Date(), hostingDuration)
      const price = DEFAULT_PRICING[hostingDuration][productType]

      // Create memorial
      const { data: memorial, error: memorialError } = await supabase
        .from('memorial_records')
        .insert({
          memorial_slug: memorialSlug,
          deceased_name: deceasedName,
          deceased_type: deceasedType,
          species: species || null,
          birth_date: birthDate || null,
          death_date: deathDate || null,
          memorial_text: memorialText,
          photos_json: sortedPhotos,
          videos_json: videos,
          theme: theme,
          frame: frame,
          is_published: true,
          hosting_duration: hostingDuration,
          product_type: productType,
          base_price: price,
          hosting_expires_at: expiryDate.toISOString(),
          contact_email: contactEmail,
        })
        .select('id')
        .single()

      if (memorialError || !memorial) {
        console.error('Create memorial error:', memorialError)
        return NextResponse.json({ error: 'Failed to create memorial' }, { status: 500 })
      }

      memorialId = memorial.id

      // Mark activation code as used
      await supabase
        .from('retail_activation_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          memorial_id: memorialId,
        })
        .eq('activation_code', activationCode)

      // Log activity
      await supabase.from('activity_log').insert({
        memorial_id: memorialId,
        activity_type: 'created',
        details: { 
          source: 'retail', 
          partnerId,
          photoCount: photos.length,
          hasVideo: videos.length > 0,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid activation type' }, { status: 400 })
    }

    // Get the edit token for the memorial (either from existing or newly created)
    const { data: memorialWithToken } = await supabase
      .from('memorial_records')
      .select('edit_token')
      .eq('id', memorialId)
      .single()

    const editToken = memorialWithToken?.edit_token

    // Get customer email for sending confirmation
    // For retail: use contactEmail from form
    // For online: try contactEmail first, then fall back to order customer email
    let customerEmail: string | null = contactEmail
    
    if (!customerEmail && activationType === 'online' && existingMemorialId) {
      // Fall back to getting email from order
      const { data: order } = await supabase
        .from('orders')
        .select('customers(email)')
        .eq('memorial_id', existingMemorialId)
        .single()
      customerEmail = (order?.customers as any)?.email
    }

    // Trigger email with edit link and QR code (via Pipedream webhook)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'
    if (customerEmail && editToken) {
      try {
        const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'memorial_created',
              email: customerEmail,
              sender_name: 'MemoriQR',
              reply_to: 'memoriqr.global@gmail.com',
              memorialName: deceasedName,
              memorialUrl: `${baseUrl}/memorial/${memorialSlug}`,
              editUrl: `${baseUrl}/memorial/edit?token=${editToken}`,
              qrCodeUrl: `${baseUrl}/api/qr/${memorialSlug}`,
            }),
          })
          console.log('Memorial creation email sent to:', customerEmail)
        } else {
          console.warn('PIPEDREAM_WEBHOOK_URL not configured - email not sent')
        }
      } catch (e) {
        console.error('Failed to send memorial creation email:', e)
        // Don't fail the request if email fails
      }
    } else {
      console.log('No email to send: customerEmail=', customerEmail, 'editToken=', !!editToken)
    }

    return NextResponse.json({
      success: true,
      slug: memorialSlug,
      memorialId,
      editToken,
    })
  } catch (error) {
    console.error('Create memorial error:', error)
    return NextResponse.json(
      { error: 'Failed to create memorial' },
      { status: 500 }
    )
  }
}
