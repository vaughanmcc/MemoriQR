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

// GET - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: order, error } = await supabase
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
        memorial:memorial_records(id, memorial_slug, deceased_name, deceased_type, is_published)
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update order status (mark shipped, completed, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { action, tracking_number, shipping_carrier, notes } = body

    const supabase = createAdminClient()

    // Build update based on action
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {}

    if (action === 'mark_shipped') {
      updates.order_status = 'shipped'
      updates.shipped_at = new Date().toISOString()
      if (tracking_number) updates.tracking_number = tracking_number
      if (shipping_carrier) updates.shipping_carrier = shipping_carrier
    } else if (action === 'mark_completed') {
      updates.order_status = 'completed'
      updates.completed_at = new Date().toISOString()
    } else if (action === 'mark_processing') {
      updates.order_status = 'processing'
    } else if (action === 'update_notes') {
      updates.notes = notes
    } else if (action === 'update_tracking') {
      if (tracking_number !== undefined) updates.tracking_number = tracking_number
      if (shipping_carrier !== undefined) updates.shipping_carrier = shipping_carrier
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Order update error:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
