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

// GET - Get order details by order number
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')?.trim()

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get order with customer and memorial details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        product_type,
        hosting_duration,
        total_amount,
        stripe_payment_id,
        stripe_session_id,
        order_status,
        engraving_text,
        qr_code_url,
        nfc_tag_id,
        tracking_number,
        shipping_carrier,
        notes,
        created_at,
        paid_at,
        shipped_at,
        completed_at,
        customer:customers(id, full_name, email, phone, shipping_address),
        memorial:memorial_records(id, memorial_slug, deceased_name, deceased_type, is_published)
      `)
      .eq('order_number', orderNumber)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json({ error: 'Order lookup failed' }, { status: 500 })
  }
}
