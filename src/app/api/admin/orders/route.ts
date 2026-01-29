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

// GET - List all orders with filters
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        product_type,
        hosting_duration,
        total_amount,
        order_status,
        tracking_number,
        shipping_carrier,
        notes,
        created_at,
        paid_at,
        shipped_at,
        completed_at,
        customer:customers(id, full_name, email, phone, shipping_address),
        memorial:memorial_records(id, memorial_slug, deceased_name, deceased_type)
      `)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'needs_fulfillment') {
        // Orders that are paid but not yet shipped
        query = query.eq('order_status', 'paid')
      } else {
        query = query.eq('order_status', status)
      }
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Filter by search if provided
    let filteredOrders = orders || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredOrders = filteredOrders.filter((order: { 
        order_number: string
        customer: { full_name: string; email: string } | null
        memorial: { deceased_name: string } | null
      }) => 
        order.order_number.toLowerCase().includes(searchLower) ||
        order.customer?.full_name?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower) ||
        order.memorial?.deceased_name?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate counts for tabs
    const allOrders = orders || []
    const counts = {
      all: allOrders.length,
      needs_fulfillment: allOrders.filter((o: { order_status: string }) => o.order_status === 'paid').length,
      shipped: allOrders.filter((o: { order_status: string }) => o.order_status === 'shipped').length,
      completed: allOrders.filter((o: { order_status: string }) => o.order_status === 'completed').length,
    }

    return NextResponse.json({ orders: filteredOrders, counts })
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
