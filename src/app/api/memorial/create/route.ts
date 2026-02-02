import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateSlug, getYouTubeId, sanitizeText } from '@/lib/utils'
import { calculateExpiryDate, DEFAULT_PRICING, TIER_LIMITS } from '@/lib/pricing'
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
    
    // Shipping address for retail activations
    const shippingName = formData.get('shippingName') as string | null
    const shippingAddressJson = formData.get('shippingAddress') as string | null
    const shippingAddress = shippingAddressJson ? JSON.parse(shippingAddressJson) : null
    
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
    
    // Handle pre-uploaded video paths (from direct browser uploads to bypass Vercel limit)
    const uploadedVideoPathsJson = formData.get('uploadedVideoPaths') as string | null
    if (uploadedVideoPathsJson) {
      try {
        const uploadedPaths = JSON.parse(uploadedVideoPathsJson) as string[]
        for (const path of uploadedPaths) {
          // Get the public URL for this already-uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('memorial-videos')
            .getPublicUrl(path)

          videos.push({
            id: `video-${Date.now()}-${videoOrder}`,
            type: 'upload',
            youtubeId: null,
            url: publicUrl,
            title: path.split('/').pop() || 'Uploaded video',
            order: videoOrder,
          })
          videoOrder++
        }
      } catch (e) {
        console.error('Failed to parse uploadedVideoPaths:', e)
      }
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

      // Create memorial with shipping info and fulfillment status
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
          // Retail-specific fields for fulfillment
          activation_source: 'retail',
          fulfillment_status: 'pending',
          shipping_name: shippingName,
          shipping_address: shippingAddress,
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

      // Log activation code usage activity
      await supabase
        .from('activation_code_activity_log')
        .insert({
          activation_code: activationCode,
          activity_type: 'used',
          performed_by_admin: false,
          from_partner_id: partnerId || null,
          to_partner_id: partnerId || null,
          notes: `Activated for memorial: ${deceasedName}`,
          metadata: { 
            memorial_id: memorialId,
            deceased_name: deceasedName,
            product_type: productType,
            hosting_duration: hostingDuration,
            used_at: new Date().toISOString()
          }
        })

      // Notify partner that activation code was used
      if (partnerId) {
        const { data: partner } = await supabase
          .from('partners')
          .select('id, partner_name, contact_email, notify_referral_redemption, bank_name, bank_account_number')
          .eq('id', partnerId)
          .single()

        // Check if partner has banking details
        const hasBankingDetails = !!(partner?.bank_name && partner?.bank_account_number)

        // Use notify_referral_redemption setting (defaults to true if null)
        if (partner?.contact_email && partner.notify_referral_redemption !== false) {
          const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
          if (webhookUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
            const businessName = partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner'

            try {
              await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'activation_code_used',
                  to: partner.contact_email,
                  businessName,
                  activationCode,
                  deceasedName,
                  productType,
                  hostingDuration,
                  memorialUrl: `${baseUrl}/memorial/${memorialSlug}`,
                  dashboardUrl: `${baseUrl}/partner/codes`,
                  hasBankingDetails,
                  settingsUrl: `${baseUrl}/partner/settings`,
                }),
              })
              console.log(`Activation code used notification sent to ${partner.contact_email}`)
            } catch (emailError) {
              console.error('Failed to send activation code used notification:', emailError)
            }
          }
        }
      }

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.memoriqr.com'
    if (customerEmail && editToken) {
      try {
        const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
        if (webhookUrl) {
          // Get package limits for this plan
          const limits = TIER_LIMITS[hostingDuration]
          const themeCount = hostingDuration === 5 ? 5 : hostingDuration === 10 ? 10 : 25
          const frameCount = hostingDuration === 5 ? 5 : hostingDuration === 10 ? 10 : 25
          
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
              // Package details
              hostingYears: hostingDuration,
              packageLimits: {
                photos: limits.photos,
                videos: limits.videos,
                themes: themeCount,
                frames: frameCount,
              },
            }),
          })
          console.log('Memorial creation email sent to:', customerEmail)
          
          // For retail activations, also send fulfillment email to admin
          if (activationType === 'retail' && shippingAddress) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'retail_fulfillment',
                customer_email: customerEmail,
                customer_name: shippingName || deceasedName,
                deceased_name: deceasedName,
                product_type: productType,
                hosting_duration: hostingDuration,
                activation_code: activationCode,
                shipping_name: shippingName,
                shipping_address: JSON.stringify(shippingAddress),
                memorial_url: `${baseUrl}/memorial/${memorialSlug}`,
                nfc_url: `${baseUrl}/qr/${memorialSlug}`,
                qr_code_url: `${baseUrl}/api/qr/${memorialSlug}`,
                partner_id: partnerId,
              }),
            })
            console.log('Retail fulfillment email sent to admin')
          }
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
