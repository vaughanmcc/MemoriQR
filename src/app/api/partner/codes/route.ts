import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

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

    return NextResponse.json({
      codes: codes || [],
      batches: batches || [],
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

// POST - Request new batch of codes
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
    if (!quantity || quantity < 10 || quantity > 500) {
      return NextResponse.json(
        { error: 'Quantity must be between 10 and 500' },
        { status: 400 }
      )
    }

    if (!['nfc_only', 'qr_only', 'both'].includes(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      )
    }

    if (![5, 10, 25].includes(hostingDuration)) {
      return NextResponse.json(
        { error: 'Invalid hosting duration' },
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
    const unitCost = retailPrice * 0.6
    const totalCost = unitCost * quantity

    // Generate batch number
    const batchNumber = `BATCH-${partner.id.substring(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

    // Create batch request
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

    // Send notification to admin
    const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_code_request',
            partner_name: partner.partner_name,
            partner_email: partner.contact_email,
            batch_number: batchNumber,
            quantity,
            product_type: productType,
            hosting_duration: hostingDuration,
            unit_cost: unitCost,
            total_cost: totalCost,
            notes
          })
        })
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      batch,
      message: 'Code batch request submitted. You will receive an email when approved.'
    })

  } catch (error) {
    console.error('Request codes error:', error)
    return NextResponse.json(
      { error: 'Failed to request codes' },
      { status: 500 }
    )
  }
}
