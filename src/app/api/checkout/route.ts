import { NextRequest, NextResponse } from 'next/server'
import { stripe, SHIPPING_RATES, CURRENCY, getPriceInCents } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { DEFAULT_PRICING, calculateExpiryDate } from '@/lib/pricing'
import { generateSlug } from '@/lib/utils'
import type { HostingDuration, ProductType, Database, Json } from '@/types/database'

type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type MemorialInsert = Database['public']['Tables']['memorial_records']['Insert']
type OrderInsert = Database['public']['Tables']['orders']['Insert']

interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: 'NZ' | 'AU'
}

interface CheckoutRequest {
  hostingDuration: HostingDuration
  productType: ProductType
  deceasedType: 'pet' | 'human'
  deceasedName: string
  species?: string

  email: string
  fullName: string
  phone?: string
  shippingAddress: ShippingAddress
  
  // Referral code support
  referralCode?: string
  discountPercent?: number
  freeShipping?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    
    const {
      hostingDuration,
      productType,
      deceasedType,
      deceasedName,
      species,
      email,
      fullName,
      phone,
      shippingAddress,
      referralCode,
    } = body

    // Validate required fields
    if (!hostingDuration || !productType || !deceasedName || !email || !fullName || !shippingAddress?.line1) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get price
    const price = DEFAULT_PRICING[hostingDuration][productType]
    if (!price) {
      return NextResponse.json(
        { error: 'Invalid pricing configuration' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Validate referral code and calculate discount
    let validatedReferralCode: string | null = null
    let referralDiscount = 0
    let referralCommissionPercent = 0
    let applyFreeShipping = false
    let referralCodeId: string | null = null

    if (referralCode) {
      const { data: refCode } = await supabase
        .from('referral_codes')
        .select('id, discount_percent, commission_percent, free_shipping, is_used, expires_at')
        .eq('code', referralCode.toUpperCase())
        .single()

      if (refCode && !refCode.is_used) {
        const isExpired = refCode.expires_at && new Date(refCode.expires_at) < new Date()
        if (!isExpired) {
          // Valid referral code
          validatedReferralCode = referralCode.toUpperCase()
          referralCodeId = refCode.id
          referralDiscount = Math.round(price * (refCode.discount_percent / 100))
          referralCommissionPercent = refCode.commission_percent
          applyFreeShipping = refCode.free_shipping
        }
      }
    }

    const finalPrice = price - referralDiscount

    // Create or get customer
    let customerId: string
    let stripeCustomerId: string | undefined

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, stripe_customer_id')
      .eq('email', email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
      stripeCustomerId = existingCustomer.stripe_customer_id || undefined
      
      // Update shipping address for existing customer
      await supabase
        .from('customers')
        .update({ shipping_address: shippingAddress as unknown as Json })
        .eq('id', customerId)
    } else {
      const customerData: CustomerInsert = {
        email,
        full_name: fullName,
        phone: phone || null,
        customer_type: 'direct',
        shipping_address: shippingAddress as unknown as Json,
      }
      
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert(customerData)
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('Customer creation error:', customerError)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }
      customerId = newCustomer.id
    }

    // Generate order number and memorial slug
    const orderNumber = `MQR-${Date.now().toString(36).toUpperCase()}`
    const memorialSlug = generateSlug(deceasedName)
    const expiryDate = calculateExpiryDate(new Date(), hostingDuration)

    // Create memorial record (unpublished)
    const memorialData: MemorialInsert = {
      customer_id: customerId,
      memorial_slug: memorialSlug,
      deceased_name: deceasedName,
      deceased_type: deceasedType,
      species: species || null,
      hosting_duration: hostingDuration,
      product_type: productType,
      base_price: price,
      hosting_expires_at: expiryDate.toISOString(),
      is_published: false,
    }
    
    const { data: memorial, error: memorialError } = await supabase
      .from('memorial_records')
      .insert(memorialData)
      .select('id')
      .single()

    if (memorialError || !memorial) {
      console.error('Memorial creation error:', memorialError)
      return NextResponse.json(
        { error: 'Failed to create memorial' },
        { status: 500 }
      )
    }

    // Create order record
    const orderData: OrderInsert = {
      customer_id: customerId,
      memorial_id: memorial.id,
      order_number: orderNumber,
      order_type: 'online',
      product_type: productType,
      hosting_duration: hostingDuration,
      total_amount: finalPrice,
      order_status: 'pending',
      referral_code: validatedReferralCode,
      referral_discount: referralDiscount,
    }
    
    const { error: orderError } = await supabase
      .from('orders')
      .insert(orderData)

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const productLabels: Record<ProductType, string> = {
      nfc_only: 'NFC Tag',
      qr_only: 'QR Plate',
      both: 'NFC Tag + QR Plate',
    }

    // Create or retrieve Stripe customer with shipping address
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email,
        name: fullName,
        phone: phone || undefined,
        shipping: {
          name: fullName,
          phone: phone || undefined,
          address: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || undefined,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
          },
        },
      })
      stripeCustomerId = stripeCustomer.id

      // Store Stripe customer ID in our database
      await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', customerId)
    } else {
      // Update existing Stripe customer's shipping address
      await stripe.customers.update(stripeCustomerId, {
        shipping: {
          name: fullName,
          phone: phone || undefined,
          address: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || undefined,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
          },
        },
      })
    }

    const isPreview = process.env.VERCEL_ENV === 'preview'
    const rawBaseUrl = isPreview
      ? (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.memoriqr.co.nz')
      : (request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://memoriqr.co.nz')
    
    // Trim any whitespace/newlines from env vars
    const baseUrl = rawBaseUrl.trim()

    // Build shipping options based on referral benefits
    const shippingOptions = applyFreeShipping
      ? [
          {
            shipping_rate_data: {
              type: 'fixed_amount' as const,
              fixed_amount: {
                amount: 0,
                currency: CURRENCY,
              },
              display_name: 'Free Shipping (Partner Benefit)',
              delivery_estimate: {
                minimum: { unit: 'business_day' as const, value: productType === 'nfc_only' ? 2 : 7 },
                maximum: { unit: 'business_day' as const, value: productType === 'nfc_only' ? 5 : 14 },
              },
            },
          },
        ]
      : [
          {
            shipping_rate_data: {
              type: 'fixed_amount' as const,
              fixed_amount: {
                amount: SHIPPING_RATES.NZ,
                currency: CURRENCY,
              },
              display_name: 'Standard Shipping (NZ)',
              delivery_estimate: {
                minimum: { unit: 'business_day' as const, value: productType === 'nfc_only' ? 2 : 7 },
                maximum: { unit: 'business_day' as const, value: productType === 'nfc_only' ? 3 : 10 },
              },
            },
          },
          {
            shipping_rate_data: {
              type: 'fixed_amount' as const,
              fixed_amount: {
                amount: SHIPPING_RATES.AU,
                currency: CURRENCY,
              },
              display_name: 'International Shipping (AU)',
              delivery_estimate: {
                minimum: { unit: 'business_day' as const, value: productType === 'nfc_only' ? 5 : 10 },
                maximum: { unit: 'business_day' as const, value: productType === 'nfc_only' ? 7 : 14 },
              },
            },
          },
        ]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: `MemoriQR ${hostingDuration}-Year Memorial`,
              description: validatedReferralCode 
                ? `${productLabels[productType]} for ${deceasedName} (Partner Discount Applied)`
                : `${productLabels[productType]} for ${deceasedName}`,
            },
            unit_amount: getPriceInCents(finalPrice),
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['NZ', 'AU'],
      },
      shipping_options: shippingOptions,
      metadata: {
        order_number: orderNumber,
        memorial_id: memorial.id,
        customer_id: customerId,
        referral_code: validatedReferralCode || '',
        referral_code_id: referralCodeId || '',
        referral_discount: referralDiscount.toString(),
        referral_commission_percent: referralCommissionPercent.toString(),
      },
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order?cancelled=true`,
    })

    // Update order with session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('order_number', orderNumber)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
