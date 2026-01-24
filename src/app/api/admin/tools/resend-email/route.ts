import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL

// Package limits for email content
const TIER_LIMITS: Record<number, { photos: number; videos: number }> = {
  5: { photos: 10, videos: 2 },
  10: { photos: 20, videos: 5 },
  25: { photos: 50, videos: 10 },
}

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
    const { orderNumber, memorialSlug, emailType, overrideEmail } = await request.json()

    // Must have either orderNumber OR memorialSlug
    if (!orderNumber && !memorialSlug) {
      return NextResponse.json({ error: 'Either order number or memorial slug is required' }, { status: 400 })
    }

    if (!emailType || !['activation', 'memorial', 'memorial_created'].includes(emailType)) {
      return NextResponse.json({ 
        error: 'Invalid email type. Use "activation", "memorial", or "memorial_created"' 
      }, { status: 400 })
    }

    const supabase = createAdminClient()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'

    if (!PIPEDREAM_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Handle memorial_created email (for retail activations - no order)
    if (memorialSlug && (emailType === 'memorial_created' || emailType === 'memorial')) {
      // Look up memorial directly by slug
      const { data: memorial, error: memError } = await supabase
        .from('memorial_records')
        .select(`
          id,
          memorial_slug,
          deceased_name,
          deceased_type,
          contact_email,
          hosting_duration,
          product_type,
          edit_token,
          customer:customers(id, full_name, email)
        `)
        .eq('memorial_slug', memorialSlug)
        .single()

      if (memError || !memorial) {
        return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
      }

      // Type assertion for joined data
      const customer = memorial.customer as { id: string; full_name: string; email: string } | null
      const recipientEmail = overrideEmail || memorial.contact_email || customer?.email

      if (!recipientEmail) {
        return NextResponse.json({ error: 'No email found for this memorial' }, { status: 400 })
      }

      // Get package limits
      const hostingDuration = memorial.hosting_duration || 5
      const limits = TIER_LIMITS[hostingDuration] || TIER_LIMITS[5]
      const themeCount = hostingDuration === 5 ? 5 : hostingDuration === 10 ? 10 : 25
      const frameCount = hostingDuration === 5 ? 5 : hostingDuration === 10 ? 10 : 25

      // Build edit URL with token if available
      const editUrl = memorial.edit_token 
        ? `${baseUrl}/memorial/edit?token=${memorial.edit_token}`
        : `${baseUrl}/memorial/edit?slug=${memorial.memorial_slug}`

      // Send memorial_created email (same as original creation email)
      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'memorial_created',
          email: recipientEmail,
          sender_name: 'MemoriQR',
          reply_to: 'memoriqr.global@gmail.com',
          memorialName: memorial.deceased_name,
          memorialUrl: `${baseUrl}/memorial/${memorial.memorial_slug}`,
          editUrl,
          qrCodeUrl: `${baseUrl}/api/qr/${memorial.memorial_slug}`,
          hostingYears: hostingDuration,
          packageLimits: {
            photos: limits.photos,
            videos: limits.videos,
            themes: themeCount,
            frames: frameCount,
          },
        }),
      })

      return NextResponse.json({ 
        success: true, 
        message: `Memorial creation email resent to ${recipientEmail}`,
        details: {
          memorial: memorial.deceased_name,
          email: recipientEmail,
        }
      })
    }

    // Handle order-based emails (existing flow)
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required for activation emails' }, { status: 400 })
    }

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
    const recipientEmail = overrideEmail || customer?.email

    if (!recipientEmail) {
      return NextResponse.json({ error: 'No customer email found for this order' }, { status: 400 })
    }

    if (emailType === 'activation') {
      // Resend activation email (order confirmation)
      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_confirmation',
          to: recipientEmail,
          data: {
            customerName: customer?.full_name || 'Customer',
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
        message: `Activation email resent to ${recipientEmail}` 
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
          to: recipientEmail,
          data: {
            customerName: customer?.full_name || 'Customer',
            deceasedName: memorial.deceased_name,
            memorialSlug: memorial.memorial_slug,
            editUrl: `${baseUrl}/memorial/edit?slug=${memorial.memorial_slug}`,
            viewUrl: `${baseUrl}/memorial/${memorial.memorial_slug}`,
          },
        }),
      })

      return NextResponse.json({ 
        success: true, 
        message: `Memorial creation email resent to ${recipientEmail}` 
      })
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json({ error: 'Failed to resend email' }, { status: 500 })
  }
}
