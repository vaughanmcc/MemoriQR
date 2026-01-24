import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL

// Check admin authentication
async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  return !!correctPassword && session === correctPassword
}

// POST - Resend activation or memorial creation email
export async function POST(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderNumber, emailType } = await request.json()

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
    }

    if (!emailType || !['activation', 'memorial'].includes(emailType)) {
      return NextResponse.json({ error: 'Invalid email type. Use "activation" or "memorial"' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get order with customer and memorial details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        product_type,
        hosting_duration,
        customer:customers(id, full_name, email),
        memorial:memorial_records(id, memorial_slug, deceased_name, deceased_type)
      `)
      .eq('order_number', orderNumber)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Type assertion for joined data
    const customer = order.customer as { id: string; full_name: string; email: string } | null
    const memorial = order.memorial as { id: string; memorial_slug: string; deceased_name: string; deceased_type: string } | null

    if (!customer?.email) {
      return NextResponse.json({ error: 'No customer email found for this order' }, { status: 400 })
    }

    if (!PIPEDREAM_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'

    if (emailType === 'activation') {
      // Resend activation email
      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_confirmation',
          to: customer.email,
          data: {
            customerName: customer.full_name,
            orderNumber: order.order_number,
            productType: order.product_type,
            hostingDuration: order.hosting_duration,
            memorialSlug: memorial?.memorial_slug,
            qrCodeUrl: memorial ? `${baseUrl}/qr/${memorial.memorial_slug}` : null,
            editUrl: memorial ? `${baseUrl}/memorial/edit?slug=${memorial.memorial_slug}` : null,
            viewUrl: memorial ? `${baseUrl}/memorial/${memorial.memorial_slug}` : null,
          },
        }),
      })

      return NextResponse.json({ 
        success: true, 
        message: `Activation email resent to ${customer.email}` 
      })
    } else {
      // Resend memorial creation email
      if (!memorial) {
        return NextResponse.json({ error: 'No memorial found for this order' }, { status: 400 })
      }

      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'memorial_edit_link',
          to: customer.email,
          data: {
            customerName: customer.full_name,
            deceasedName: memorial.deceased_name,
            memorialSlug: memorial.memorial_slug,
            editUrl: `${baseUrl}/memorial/edit?slug=${memorial.memorial_slug}`,
            viewUrl: `${baseUrl}/memorial/${memorial.memorial_slug}`,
          },
        }),
      })

      return NextResponse.json({ 
        success: true, 
        message: `Memorial creation email resent to ${customer.email}` 
      })
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json({ error: 'Failed to resend email' }, { status: 500 })
  }
}
