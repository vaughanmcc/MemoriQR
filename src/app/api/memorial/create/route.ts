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
    const videoUrl = formData.get('videoUrl') as string | null
    const hostingDuration = parseInt(formData.get('hostingDuration') as string) as HostingDuration
    const productType = formData.get('productType') as ProductType
    
    const photoFiles = formData.getAll('photos') as File[]

    if (!deceasedName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (photoFiles.length === 0) {
      return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Process photos - in production, upload to Cloudinary
    // For now, we'll create placeholder URLs
    const photos = photoFiles.map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      url: `/placeholder-photo-${index}.jpg`, // In production: Cloudinary URL
      publicId: `memorial/${Date.now()}-${index}`,
      width: 800,
      height: 600,
      caption: '',
      order: index,
    }))

    // Process video
    const videos = []
    if (videoUrl) {
      const youtubeId = getYouTubeId(videoUrl)
      if (youtubeId) {
        videos.push({
          id: `video-${Date.now()}`,
          youtubeId,
          title: '',
          order: 0,
        })
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
          photos_json: photos,
          videos_json: videos,
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
        details: { photoCount: photos.length, hasVideo: videos.length > 0 },
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
          photos_json: photos,
          videos_json: videos,
          is_published: true,
          hosting_duration: hostingDuration,
          product_type: productType,
          base_price: price,
          hosting_expires_at: expiryDate.toISOString(),
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

    return NextResponse.json({
      success: true,
      slug: memorialSlug,
      memorialId,
    })
  } catch (error) {
    console.error('Create memorial error:', error)
    return NextResponse.json(
      { error: 'Failed to create memorial' },
      { status: 500 }
    )
  }
}
