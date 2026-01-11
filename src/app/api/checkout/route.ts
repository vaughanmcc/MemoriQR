import { NextRequest, NextResponse } from 'next/server'
import { stripe, SHIPPING_RATES, CURRENCY, getPriceInCents } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { DEFAULT_PRICING, calculateExpiryDate } from '@/lib/pricing'
import { generateSlug } from '@/lib/utils'
import type { HostingDuration, ProductType, Database } from '@/types/database'

type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type MemorialInsert = Database['public']['Tables']['memorial_records']['Insert']
type OrderInsert = Database['public']['Tables']['orders']['Insert']

interface CheckoutRequest {
  hostingDuration: HostingDuration
  productType: ProductType
  deceasedType: 'pet' | 'human'
  deceasedName: string
  species?: string
  engravingText?: string
  email: string
  fullName: string
  phone?: string
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
      engravingText,
      email,
      fullName,
      phone,
    } = body

    // Validate required fields
    if (!hostingDuration || !productType || !deceasedName || !email || !fullName) {
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

    // Create or get customer
    let customerId: string

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const customerData: CustomerInsert = {
        email,
        full_name: fullName,
        phone: phone || null,
        customer_type: 'direct',
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
      total_amount: price,
      order_status: 'pending',
      engraving_text: engravingText || null,
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: `MemoriQR ${hostingDuration}-Year Memorial`,
              description: `${productLabels[productType]} for ${deceasedName}`,
            },
            unit_amount: getPriceInCents(price),
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['NZ', 'AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: SHIPPING_RATES.NZ,
              currency: CURRENCY,
            },
            display_name: 'Standard Shipping (NZ)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: productType === 'nfc_only' ? 2 : 7 },
              maximum: { unit: 'business_day', value: productType === 'nfc_only' ? 3 : 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: SHIPPING_RATES.AU,
              currency: CURRENCY,
            },
            display_name: 'International Shipping (AU)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: productType === 'nfc_only' ? 5 : 10 },
              maximum: { unit: 'business_day', value: productType === 'nfc_only' ? 7 : 14 },
            },
          },
        },
      ],
      metadata: {
        order_number: orderNumber,
        memorial_id: memorial.id,
        customer_id: customerId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order?cancelled=true`,
    })

    // Update order with session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('order_number', orderNumber)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
