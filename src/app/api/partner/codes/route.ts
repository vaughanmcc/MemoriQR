import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

// Helper to get authenticated partner
async function getAuthenticatedPartner() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('partner_session')?.value

  if (!sessionToken) {
    return null
  }

  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from('partner_sessions')
    .select('partner_id, expires_at')
    .eq('session_token', sessionToken)
    .single()

  if (!session || new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('id', session.partner_id)
    .eq('is_active', true)
    .single()

  return partner
}

// GET - List activation codes for partner
export async function GET(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all', 'available', 'used'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('retail_activation_codes')
      .select('*', { count: 'exact' })
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    if (status === 'available') {
      query = query.eq('is_used', false)
    } else if (status === 'used') {
      query = query.eq('is_used', true)
    }

    const { data: codes, count, error } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    // Get batch info
    const { data: batches } = await supabase
      .from('code_batches')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    // Check if partner has banking details
    const hasBankingDetails = !!(partner.bank_name && partner.bank_account_number)

    return NextResponse.json({
      codes: codes || [],
      batches: batches || [],
      hasBankingDetails,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('List codes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch codes' },
      { status: 500 }
    )
  }
}

// POST - Purchase new batch of codes via Stripe
export async function POST(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { quantity, productType, hostingDuration, notes } = await request.json()

    // Validate inputs
    if (!quantity || quantity < 1 || quantity > 500) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 500' },
        { status: 400 }
      )
    }

    if (!['nfc_only', 'qr_only', 'both'].includes(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      )
    }

    // Hosting duration is required for wholesale purchases
    if (hostingDuration === null || ![5, 10, 25].includes(hostingDuration)) {
      return NextResponse.json(
        { error: 'Hosting duration is required (5, 10, or 25 years)' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Calculate wholesale pricing (discounted for partners)
    const retailPricing: { [key: string]: { [key: number]: number } } = {
      'nfc_only': { 5: 99, 10: 149, 25: 199 },
      'qr_only': { 5: 149, 10: 199, 25: 279 },
      'both': { 5: 199, 10: 249, 25: 349 }
    }

    const retailPrice = retailPricing[productType][hostingDuration]
    // Partner pays 60% of retail (40% margin for them)
    const unitCost = Math.round(retailPrice * 0.6 * 100) / 100 // Round to 2 decimals
    const totalCost = unitCost * quantity

    // Generate batch number
    const batchNumber = `WS-${partner.id.substring(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

    // Product display names
    const productNames: { [key: string]: string } = {
      'nfc_only': 'NFC Tag Only',
      'qr_only': 'QR Code Plate Only',
      'both': 'QR Code Plate + NFC Tag'
    }

    // Create batch record with pending status
    const { data: batch, error: batchError } = await supabase
      .from('code_batches')
      .insert({
        partner_id: partner.id,
        batch_number: batchNumber,
        quantity,
        product_type: productType,
        hosting_duration: hostingDuration,
        unit_cost: unitCost,
        total_cost: totalCost,
        status: 'pending',
        notes
      })
      .select()
      .single()

    if (batchError) {
      throw batchError
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: partner.contact_email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `Wholesale Activation Codes - ${productNames[productType]}`,
              description: `${quantity} × ${productNames[productType]} (${hostingDuration} Year Hosting)`,
              metadata: {
                batch_id: batch.id,
                partner_id: partner.id,
                product_type: productType,
                hosting_duration: hostingDuration.toString(),
              }
            },
            unit_amount: Math.round(unitCost * 100), // Convert to cents
          },
          quantity: quantity,
        }
      ],
      metadata: {
        type: 'partner_code_purchase',
        batch_id: batch.id,
        partner_id: partner.id,
        partner_name: partner.partner_name || '',
        batch_number: batchNumber,
        quantity: quantity.toString(),
        product_type: productType,
        hosting_duration: hostingDuration.toString(),
      },
      success_url: `${baseUrl}/partner/codes?success=true&batch=${batch.id}`,
      cancel_url: `${baseUrl}/partner/codes?cancelled=true&batch=${batch.id}`,
    })

    // Update batch with Stripe session ID
    await supabase
      .from('code_batches')
      .update({ stripe_session_id: session.id })
      .eq('id', batch.id)

    return NextResponse.json({
      success: true,
      batch,
      checkoutUrl: session.url,
      message: 'Redirecting to checkout...'
    })

  } catch (error) {
    console.error('Request codes error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
