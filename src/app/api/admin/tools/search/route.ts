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

// GET - Search orders by customer name/email
// Note: Orders don't have partner_id - for partner-based search use the activation search in Resend Emails tab
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const customerQuery = searchParams.get('q')?.trim()

    // Customer search required
    if (!customerQuery) {
      return NextResponse.json({ error: 'Please enter a customer name or email to search' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Search customers by name or email
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .or(`full_name.ilike.%${customerQuery}%,email.ilike.%${customerQuery}%`)
      .limit(50)

    if (customerError) {
      console.error('Customer search error:', customerError)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({ orders: [] })
    }

    const customerIds = customers.map(c => c.id)

    // Get orders for these customers
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        product_type,
        hosting_duration,
        total_amount,
        order_status,
        created_at,
        paid_at,
        customer:customers(id, full_name, email, phone, shipping_address),
        memorial:memorial_records(id, memorial_slug, deceased_name, deceased_type, is_published)
      `)
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false })
      .limit(100)

    if (ordersError) {
      console.error('Orders search error:', ordersError)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
