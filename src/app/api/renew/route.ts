import { NextRequest, NextResponse } from 'next/server'
import { stripe, CURRENCY, getPriceInCents } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { EXTENSION_PRICING, ExtensionType, GRACE_PERIOD_DAYS } from '@/lib/pricing'

interface RenewRequest {
  memorialSlug?: string
  memorialId?: string
  renewalToken?: string // For one-click renewal from email
  extensionType: ExtensionType
}

export async function POST(request: NextRequest) {
  try {
    const body: RenewRequest = await request.json()
    const { memorialSlug, memorialId, renewalToken, extensionType } = body

    if (!extensionType || !EXTENSION_PRICING[extensionType]) {
      return NextResponse.json(
        { error: 'Invalid extension type' },
        { status: 400 }
      )
    }

    if (!memorialSlug && !memorialId && !renewalToken) {
      return NextResponse.json(
        { error: 'Missing memorial identifier' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const extension = EXTENSION_PRICING[extensionType]

    // Find the memorial
    let query = supabase
      .from('memorial_records')
      .select(`
        id, 
        memorial_slug, 
        deceased_name, 
        customer_id, 
        hosting_expires_at,
        hosting_duration,
        renewal_token,
        renewal_token_expires_at,
        customers(id, email, full_name)
      `)

    if (memorialId) {
      query = query.eq('id', memorialId)
    } else if (renewalToken) {
      // One-click renewal from email - verify token
      query = query.eq('renewal_token', renewalToken)
    } else if (memorialSlug) {
      query = query.eq('memorial_slug', memorialSlug)
    }

    const { data: memorial, error: memorialError } = await query.single()

    if (memorialError || !memorial) {
      return NextResponse.json(
        { error: 'Memorial not found' },
        { status: 404 }
      )
    }

    // If using renewal token, verify it hasn't expired
    if (renewalToken) {
      if (memorial.renewal_token !== renewalToken) {
        return NextResponse.json(
          { error: 'Invalid renewal token' },
          { status: 403 }
        )
      }
      if (memorial.renewal_token_expires_at && new Date(memorial.renewal_token_expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Renewal link has expired. Please search for your memorial to renew.' },
          { status: 403 }
        )
      }
    }

    // Calculate expiry status
    const now = new Date()
    const expiresAt = memorial.hosting_expires_at ? new Date(memorial.hosting_expires_at) : null
    const isLifetime = memorial.hosting_duration === 999
    const isExpired = expiresAt && expiresAt < now
    const gracePeriodEnd = expiresAt ? new Date(expiresAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000) : null
    const isInGracePeriod = isExpired && gracePeriodEnd && now < gracePeriodEnd
    const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null

    // Can't renew lifetime memorials
    if (isLifetime) {
      return NextResponse.json(
        { error: 'This memorial already has lifetime hosting' },
        { status: 400 }
      )
    }

    // Calculate the new expiry date
    let newExpiresAt: Date
    if (isExpired) {
      // If expired, start from today
      newExpiresAt = new Date()
      newExpiresAt.setFullYear(newExpiresAt.getFullYear() + extension.years)
    } else {
      // If still active, add to existing expiry
      newExpiresAt = new Date(expiresAt!)
      newExpiresAt.setFullYear(newExpiresAt.getFullYear() + extension.years)
    }

    const customerEmail = (memorial.customers as { email?: string } | null)?.email
    const customerName = (memorial.customers as { full_name?: string } | null)?.full_name

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: `Memorial Hosting Extension - ${extension.label}`,
              description: `Extend hosting for "${memorial.deceased_name}" by ${extension.years} year${extension.years > 1 ? 's' : ''}`,
            },
            unit_amount: getPriceInCents(extension.price),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'memorial_renewal',
        memorial_id: memorial.id,
        memorial_slug: memorial.memorial_slug,
        customer_id: memorial.customer_id || '',
        extension_type: extensionType,
        years_added: extension.years.toString(),
        previous_expires_at: memorial.hosting_expires_at || '',
        new_expires_at: newExpiresAt.toISOString(),
        was_expired: isExpired ? 'true' : 'false',
        was_in_grace_period: isInGracePeriod ? 'true' : 'false',
        days_remaining: daysRemaining?.toString() || '0',
      },
      success_url: `${baseUrl}/renew/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/renew?cancelled=true&slug=${memorial.memorial_slug}`,
    })

    return NextResponse.json({ 
      url: session.url,
      memorial: {
        slug: memorial.memorial_slug,
        name: memorial.deceased_name,
        currentExpiry: memorial.hosting_expires_at,
        newExpiry: newExpiresAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Renewal error:', error)
    return NextResponse.json(
      { error: 'Failed to create renewal session' },
      { status: 500 }
    )
  }
}
