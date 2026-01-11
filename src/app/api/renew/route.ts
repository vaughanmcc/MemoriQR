import { NextRequest, NextResponse } from 'next/server'
import { stripe, CURRENCY, getPriceInCents } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { RENEWAL_PRICING } from '@/lib/pricing'

interface RenewRequest {
  memorialSlug: string
  renewalOption: 'yearly' | 'fiveYear' | 'tenYear'
}

const renewalDurations = {
  yearly: { years: 1, price: RENEWAL_PRICING.yearly },
  fiveYear: { years: 5, price: RENEWAL_PRICING.fiveYear },
  tenYear: { years: 10, price: RENEWAL_PRICING.tenYear },
}

export async function POST(request: NextRequest) {
  try {
    const { memorialSlug, renewalOption }: RenewRequest = await request.json()

    if (!memorialSlug || !renewalOption) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const renewal = renewalDurations[renewalOption]
    if (!renewal) {
      return NextResponse.json(
        { error: 'Invalid renewal option' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get memorial and customer info
    const { data: memorial, error: memorialError } = await supabase
      .from('memorial_records')
      .select('id, deceased_name, customer_id, customers(email)')
      .eq('memorial_slug', memorialSlug)
      .single()

    if (memorialError || !memorial) {
      return NextResponse.json(
        { error: 'Memorial not found' },
        { status: 404 }
      )
    }

    // Create Stripe checkout session for renewal
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: (memorial.customers as any)?.email,
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: `Memorial Renewal - ${renewal.years} Year${renewal.years > 1 ? 's' : ''}`,
              description: `Extend hosting for "${memorial.deceased_name}"`,
            },
            unit_amount: getPriceInCents(renewal.price),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'renewal',
        memorial_id: memorial.id,
        memorial_slug: memorialSlug,
        renewal_years: renewal.years.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/renew/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/renew?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Renewal error:', error)
    return NextResponse.json(
      { error: 'Failed to create renewal session' },
      { status: 500 }
    )
  }
}
