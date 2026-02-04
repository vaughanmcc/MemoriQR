import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

type Partner = Database['public']['Tables']['partners']['Row']

// Helper to get authenticated partner
async function getAuthenticatedPartner(): Promise<Partner | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('partner_session')?.value

  if (!sessionToken) {
    return null
  }

  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from('partner_sessions')
    .select('partner_id, expires_at')
    .eq('session_token', sessionToken)
    .single() as { data: { partner_id: string; expires_at: string } | null }

  if (!session || new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('id', session.partner_id)
    .eq('is_active', true)
    .single() as { data: Partner | null }

  return partner
}

// POST /api/partner/referrals/request - Submit a referral code request
export async function POST(request: Request) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quantity, reason } = body

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Require reason for requests over 10
    if (quantity > 10 && (!reason || reason.trim().length < 10)) {
      return NextResponse.json(
        { error: 'Please provide a reason when requesting more than 10 codes' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check for pending requests from this partner
    // Using type assertion for new table not yet in schema
    const { data: pendingCheck } = await (supabase
      .from('referral_code_requests' as any)
      .select('id')
      .eq('partner_id', partner.id)
      .eq('status', 'pending') as any)

    if (pendingCheck && pendingCheck.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending request. Please wait for it to be processed.' },
        { status: 400 }
      )
    }

    // For requests of 10 or less, auto-approve and generate codes
    if (quantity <= 10) {
      // Generate codes immediately
      const batchId = `REF-${Date.now()}`
      const codes: any[] = []
      
      for (let i = 0; i < quantity; i++) {
        const code = `REF-${generateRandomCode()}`
        codes.push({
          code,
          partner_id: partner.id,
          discount_percent: partner.default_discount_percent ?? 10,
          commission_percent: partner.default_commission_percent ?? 15,
          free_shipping: partner.default_free_shipping ?? false,
          batch_id: batchId,
          batch_name: `Request ${new Date().toLocaleDateString()}`
        })
      }

      // Insert codes
      const { error: insertError } = await (supabase
        .from('referral_codes')
        .insert(codes as any) as any)

      if (insertError) {
        console.error('Failed to generate codes:', insertError)
        return NextResponse.json(
          { error: 'Failed to generate codes' },
          { status: 500 }
        )
      }

      // Log the auto-approved request
      await (supabase.from('referral_code_requests' as any).insert({
        partner_id: partner.id,
        quantity,
        reason: reason || null,
        status: 'approved',
        admin_notes: 'Auto-approved (10 or fewer codes)',
        processed_at: new Date().toISOString(),
        batch_id: batchId
      } as any) as any)

      // Send notification email to partner
      try {
        const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'referral_codes_generated',
              to: partner.contact_email,
              businessName: partner.partner_name,
              quantity,
              totalCodes: quantity,
              codes: codes.map(c => c.code),
              discountPercent: partner.default_discount_percent ?? 10,
              commissionPercent: partner.default_commission_percent ?? 15,
              freeShipping: partner.default_free_shipping ?? false,
              expiresAt: null,
              dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'}/partner/referrals`
            })
          })
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError)
      }

      return NextResponse.json({
        success: true,
        autoApproved: true,
        quantity,
        message: `${quantity} referral codes have been generated and are ready to use!`
      })
    }

    // For requests over 10, create pending request for admin review
    console.log('Creating pending request for partner:', partner.id, 'quantity:', quantity)
    
    const { data: insertedRequest, error: requestError } = await (supabase
      .from('referral_code_requests' as any)
      .insert({
        partner_id: partner.id,
        quantity,
        reason: reason.trim(),
        status: 'pending'
      } as any)
      .select() as any)

    console.log('Insert result:', { insertedRequest, requestError })

    if (requestError) {
      console.error('Failed to create request:', requestError)
      return NextResponse.json(
        { error: 'Failed to submit request', details: requestError },
        { status: 500 }
      )
    }

    // Send notification email to admin
    try {
      const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'referral_code_request',
            partner_name: partner.partner_name,
            partner_email: partner.contact_email,
            quantity,
            reason: reason.trim(),
            baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    // Send confirmation email to partner
    try {
      const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'referral_request_submitted',
            partner_email: partner.contact_email,
            partner_name: partner.partner_name,
            quantity,
            reason: reason.trim(),
            baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send partner confirmation:', emailError)
    }

    return NextResponse.json({
      success: true,
      autoApproved: false,
      quantity,
      message: `Your request for ${quantity} referral codes has been submitted and is pending admin approval.`
    })

  } catch (error) {
    console.error('Referral request error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// GET /api/partner/referrals/request - Get request history
export async function GET() {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: requests, error } = await (supabase
      .from('referral_code_requests' as any)
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })
      .limit(20) as any)

    if (error) {
      console.error('Failed to fetch requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({ requests })

  } catch (error) {
    console.error('Get requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
