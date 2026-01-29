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

    const supabase = createAdminClient()

    // Build query
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
        activation_code,
        view_count,
        created_at,
        updated_at,
        customer:customers(id, full_name, email)
      `)
      .order('created_at', { ascending: false })

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

    // Filter by search if provided
    let filteredMemorials = memorials || []
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
    const allMemorials = memorials || []
    const counts = {
      all: allMemorials.length,
      published: allMemorials.filter((m: { is_published: boolean }) => m.is_published).length,
      draft: allMemorials.filter((m: { is_published: boolean }) => !m.is_published).length,
      pending_fulfillment: allMemorials.filter((m: { fulfillment_status: string }) => 
        ['pending', 'processing'].includes(m.fulfillment_status)
      ).length,
    }

    return NextResponse.json({ memorials: filteredMemorials, counts })
  } catch (error) {
    console.error('Memorials API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
