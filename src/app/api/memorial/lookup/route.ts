import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { GRACE_PERIOD_DAYS } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const { query, renewalToken } = await request.json()

    if (!query && !renewalToken) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Build the select query
    const selectFields = 'memorial_slug, deceased_name, hosting_expires_at, hosting_duration'
    
    let memorial: {
      memorial_slug: string
      deceased_name: string
      hosting_expires_at: string | null
      hosting_duration: number
    } | null = null

    if (renewalToken) {
      // Look up by renewal token (for one-click email links)
      const { data } = await supabase
        .from('memorial_records')
        .select(selectFields)
        .eq('renewal_token', renewalToken)
        .single()
      memorial = data
    } else {
      // Try to find by slug
      const { data: slugResult } = await supabase
        .from('memorial_records')
        .select(selectFields)
        .eq('memorial_slug', query.toLowerCase())
        .single()

      if (slugResult) {
        memorial = slugResult
      } else {
        // If not found, try by order number
        const { data: order } = await supabase
          .from('orders')
          .select(`memorial_records(${selectFields})`)
          .eq('order_number', query.toUpperCase())
          .single()

        if (order?.memorial_records) {
          memorial = order.memorial_records as typeof memorial
        }
      }
    }

    if (!memorial) {
      return NextResponse.json(
        { error: 'Memorial not found. Please check the URL or order number.' },
        { status: 404 }
      )
    }

    // Calculate expiry status
    const now = new Date()
    const expiresAt = memorial.hosting_expires_at ? new Date(memorial.hosting_expires_at) : null
    const isLifetime = memorial.hosting_duration === 999
    const isExpired = expiresAt ? expiresAt < now : false
    const gracePeriodEnd = expiresAt 
      ? new Date(expiresAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000) 
      : null
    const isInGracePeriod = isExpired && gracePeriodEnd ? now < gracePeriodEnd : false
    const daysLeft = expiresAt 
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return NextResponse.json({
      memorial: {
        slug: memorial.memorial_slug,
        name: memorial.deceased_name,
        expiresAt: memorial.hosting_expires_at,
        daysLeft,
        isExpired,
        isInGracePeriod,
        isLifetime,
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
