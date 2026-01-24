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

// GET - Search orders by customer name/email and/or partner
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const customerQuery = searchParams.get('q')?.trim()
    const businessName = searchParams.get('businessName')?.trim()
    const partnerType = searchParams.get('partnerType')?.trim()

    // At least one search parameter required
    if (!customerQuery && !businessName && !partnerType) {
      return NextResponse.json({ error: 'At least one search field is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    let customerIds: string[] = []
    let partnerIds: string[] = []

    // Search customers by name or email if provided
    if (customerQuery) {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .or(`full_name.ilike.%${customerQuery}%,email.ilike.%${customerQuery}%`)
        .limit(50)

      if (customerError) {
        console.error('Customer search error:', customerError)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
      }

      customerIds = customers?.map(c => c.id) || []
    }

    // Search partners by business name and/or type if provided
    if (businessName || partnerType) {
      let partnerQuery = supabase.from('partners').select('id')
      
      if (businessName) {
        partnerQuery = partnerQuery.ilike('partner_name', `%${businessName}%`)
      }
      if (partnerType) {
        partnerQuery = partnerQuery.eq('partner_type', partnerType)
      }

      const { data: partners, error: partnerError } = await partnerQuery.limit(50)

      if (partnerError) {
        console.error('Partner search error:', partnerError)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
      }

      partnerIds = partners?.map(p => p.id) || []
    }

    // Build order query based on search criteria
    let orderQuery = supabase
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
        partner_id,
        customer:customers(id, full_name, email, phone, shipping_address),
        memorial:memorial_records(id, memorial_slug, deceased_name, deceased_type, is_published),
        partner:partners(id, partner_name, partner_type)
      `)
      .order('created_at', { ascending: false })

    // Apply filters based on what was searched
    if (customerQuery && (businessName || partnerType)) {
      // Both customer and partner filters - need both to match
      if (customerIds.length === 0 || partnerIds.length === 0) {
        return NextResponse.json({ orders: [] })
      }
      orderQuery = orderQuery.in('customer_id', customerIds).in('partner_id', partnerIds)
    } else if (customerQuery) {
      // Only customer filter
      if (customerIds.length === 0) {
        return NextResponse.json({ orders: [] })
      }
      orderQuery = orderQuery.in('customer_id', customerIds)
    } else if (businessName || partnerType) {
      // Only partner filter
      if (partnerIds.length === 0) {
        return NextResponse.json({ orders: [] })
      }
      orderQuery = orderQuery.in('partner_id', partnerIds)
    }

    const { data: orders, error: ordersError } = await orderQuery.limit(100)

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
