import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface TrackViewRequest {
  slug: string
  referrer?: string
}

export async function POST(request: NextRequest) {
  try {
    const { slug }: TrackViewRequest = await request.json()

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get memorial ID
    const { data: memorial } = await supabase
      .from('memorial_records')
      .select('id')
      .eq('memorial_slug', slug)
      .single()

    if (!memorial) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
    }

    // Increment views and update last_viewed
    await supabase.rpc('increment_memorial_views', { slug })

    // Log activity
    await supabase.from('activity_log').insert({
      memorial_id: memorial.id,
      activity_type: 'viewed',
      details: {
        user_agent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track view error:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}
