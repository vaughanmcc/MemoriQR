import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Check if the request is from an authenticated admin
async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  return !!correctPassword && session === correctPassword
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const sessionToken = searchParams.get('session')
    const isAdmin = await isAdminRequest()

    if (!token) {
      return NextResponse.json({ error: 'Edit token is required' }, { status: 400 })
    }

    // Admin users can bypass session verification
    if (!sessionToken && !isAdmin) {
      return NextResponse.json({ error: 'Session token is required. Please verify your email first.' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Look up memorial by edit token
    const { data: memorial, error } = await supabase
      .from('memorial_records')
      .select('*')
      .eq('edit_token', token)
      .single()

    if (error || !memorial) {
      return NextResponse.json({ error: 'Memorial not found or invalid token' }, { status: 404 })
    }

    // Admin users bypass session verification
    if (!isAdmin) {
      // Verify the session token is valid and not expired
      const { data: session, error: sessionError } = await supabase
        .from('edit_verification_codes')
        .select('*')
        .eq('memorial_id', memorial.id)
        .eq('code', `SESSION:${sessionToken}`)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session) {
        return NextResponse.json({ error: 'Session expired. Please verify your email again.' }, { status: 401 })
      }
    }

    // Return the memorial data for editing
    return NextResponse.json({
      success: true,
      memorial: {
        id: memorial.id,
        slug: memorial.memorial_slug,
        deceasedName: memorial.deceased_name,
        deceasedType: memorial.deceased_type,
        species: memorial.species,
        birthDate: memorial.birth_date,
        deathDate: memorial.death_date,
        memorialText: memorial.memorial_text,
        photos: memorial.photos_json,
        videos: memorial.videos_json,
        theme: memorial.theme || 'classic',
        frame: memorial.frame || 'classic-gold',
        hostingDuration: memorial.hosting_duration,
        productType: memorial.product_type,
      },
    })
  } catch (error) {
    console.error('Get memorial for edit error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve memorial' },
      { status: 500 }
    )
  }
}
