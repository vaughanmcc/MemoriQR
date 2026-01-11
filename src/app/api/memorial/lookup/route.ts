import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Try to find by slug
    let { data: memorial } = await supabase
      .from('memorial_records')
      .select('memorial_slug, deceased_name, hosting_expires_at, days_until_expiry')
      .eq('memorial_slug', query.toLowerCase())
      .single()

    // If not found, try by order number
    if (!memorial) {
      const { data: order } = await supabase
        .from('orders')
        .select('memorial_records(memorial_slug, deceased_name, hosting_expires_at, days_until_expiry)')
        .eq('order_number', query.toUpperCase())
        .single()

      if (order?.memorial_records) {
        memorial = order.memorial_records as any
      }
    }

    if (!memorial) {
      return NextResponse.json(
        { error: 'Memorial not found. Please check the URL or order number.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      memorial: {
        slug: memorial.memorial_slug,
        name: memorial.deceased_name,
        expiresAt: memorial.hosting_expires_at,
        daysLeft: memorial.days_until_expiry || 0,
      },
    })
  } catch (error) {
    console.error('Memorial lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup memorial' },
      { status: 500 }
    )
  }
}
