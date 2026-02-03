import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// Check admin authentication
async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  return !!correctPassword && session === correctPassword
}

// GET - List all memorials with filters
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const fulfillment = searchParams.get('fulfillment') || 'all'
    const filter = searchParams.get('filter') || ''

    const supabase = createAdminClient()

    // Build query - note: views_count (not view_count), no activation_code on this table
    let query = supabase
      .from('memorial_records')
      .select(`
        id,
        memorial_slug,
        deceased_name,
        deceased_type,
        birth_date,
        death_date,
        is_published,
        fulfillment_status,
        views_count,
        hosting_duration,
        hosting_expires_at,
        created_at,
        updated_at,
        customer:customers(id, full_name, email),
        activation_codes:retail_activation_codes(activation_code)
      `)
      .order('created_at', { ascending: false })

    // Apply renewals filter if specified
    if (filter === 'renewals') {
      const now = new Date()
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      query = query
        .neq('hosting_duration', 999) // Exclude lifetime
        .lt('hosting_expires_at', ninetyDaysFromNow.toISOString())
        .gt('hosting_expires_at', thirtyDaysAgo.toISOString()) // Include grace period
        .order('hosting_expires_at', { ascending: true })
    }

    // Apply filters
    if (status === 'published') {
      query = query.eq('is_published', true)
    } else if (status === 'draft') {
      query = query.eq('is_published', false)
    }

    if (fulfillment === 'pending') {
      query = query.in('fulfillment_status', ['pending', 'processing'])
    } else if (fulfillment === 'shipped') {
      query = query.eq('fulfillment_status', 'shipped')
    } else if (fulfillment === 'completed') {
      query = query.eq('fulfillment_status', 'completed')
    }

    const { data: memorials, error } = await query

    if (error) {
      console.error('Error fetching memorials:', error)
      return NextResponse.json({ error: 'Failed to fetch memorials' }, { status: 500 })
    }

    // Transform memorials to flatten activation_code from related table
    const transformedMemorials = (memorials || []).map((m: {
      id: string
      memorial_slug: string
      deceased_name: string
      deceased_type: string
      birth_date: string | null
      death_date: string | null
      is_published: boolean
      fulfillment_status: string
      views_count: number
      created_at: string
      updated_at: string
      customer: { id: string; full_name: string; email: string } | null
      activation_codes: { activation_code: string }[] | null
    }) => ({
      ...m,
      view_count: m.views_count,
      activation_code: m.activation_codes?.[0]?.activation_code || null,
    }))

    // Filter by search if provided
    let filteredMemorials = transformedMemorials
    if (search) {
      const searchLower = search.toLowerCase()
      filteredMemorials = filteredMemorials.filter((m: {
        memorial_slug: string
        deceased_name: string
        activation_code: string | null
        customer: { full_name: string; email: string } | null
      }) =>
        m.memorial_slug?.toLowerCase().includes(searchLower) ||
        m.deceased_name?.toLowerCase().includes(searchLower) ||
        m.activation_code?.toLowerCase().includes(searchLower) ||
        m.customer?.full_name?.toLowerCase().includes(searchLower) ||
        m.customer?.email?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate counts
    const allMemorials = transformedMemorials
    
    // Calculate renewals count
    const now = new Date()
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const counts = {
      all: allMemorials.length,
      published: allMemorials.filter((m: { is_published: boolean }) => m.is_published).length,
      draft: allMemorials.filter((m: { is_published: boolean }) => !m.is_published).length,
      pending_fulfillment: allMemorials.filter((m: { fulfillment_status: string }) => 
        ['pending', 'processing'].includes(m.fulfillment_status)
      ).length,
      renewals_due: allMemorials.filter((m: { hosting_duration: number; hosting_expires_at: string }) => {
        if (m.hosting_duration === 999) return false // Exclude lifetime
        const expiresAt = new Date(m.hosting_expires_at)
        return expiresAt < ninetyDaysFromNow && expiresAt > thirtyDaysAgo
      }).length,
    }

    return NextResponse.json({ memorials: filteredMemorials, counts })
  } catch (error) {
    console.error('Memorials API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
