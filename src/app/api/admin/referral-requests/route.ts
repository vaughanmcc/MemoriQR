import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface CodeRequest {
  id: string
  partner_id: string
  quantity: number
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  processed_at: string | null
  batch_id: string | null
  created_at: string
  partner: {
    id: string
    partner_name: string
    contact_email: string
    partner_type: string
    default_discount_percent: number
    default_commission_percent: number
    default_free_shipping: boolean
  }
}

// GET /api/admin/referral-requests - Get all referral code requests
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')

  if (!adminAuth || adminAuth.value !== process.env.ADMIN_AUTH_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'

  const supabase = createAdminClient()

  const { data: requests, error } = await (supabase
    .from('referral_code_requests' as any)
    .select(`
      *,
      partner:partners(id, partner_name, contact_email, partner_type, default_discount_percent, default_commission_percent, default_free_shipping)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false }) as any)

  if (error) {
    console.error('Failed to fetch requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }

  return NextResponse.json({ requests: requests || [] })
}

// POST /api/admin/referral-requests - Approve or reject a request
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')

  if (!adminAuth || adminAuth.value !== process.env.ADMIN_AUTH_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { requestId, action, adminNotes } = body

  if (!requestId || !action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Get the request with partner info
  const { data: codeRequest, error: fetchError } = await (supabase
    .from('referral_code_requests' as any)
    .select(`
      *,
      partner:partners(id, partner_name, contact_email, default_discount_percent, default_commission_percent, default_free_shipping)
    `)
    .eq('id', requestId)
    .single() as any) as { data: CodeRequest | null; error: any }

  if (fetchError || !codeRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (codeRequest.status !== 'pending') {
    return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 })
  }

  if (action === 'reject') {
    // Update request as rejected
    const { error: updateError } = await (supabase
      .from('referral_code_requests' as any)
      .update({
        status: 'rejected',
        admin_notes: adminNotes || 'Request rejected',
        processed_at: new Date().toISOString()
      } as any)
      .eq('id', requestId) as any)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }

    // Send rejection email to partner
    try {
      const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'referral_request_rejected',
            partner_email: codeRequest.partner.contact_email,
            partner_name: codeRequest.partner.partner_name,
            quantity: codeRequest.quantity,
            reason: adminNotes || 'Your request was not approved at this time.'
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
    }

    return NextResponse.json({ success: true, message: 'Request rejected' })
  }

  // Approve - generate codes
  const batchId = `REF-${Date.now()}`
  const codes: any[] = []
  
  for (let i = 0; i < codeRequest.quantity; i++) {
    const code = `REF-${generateRandomCode()}`
    codes.push({
      code,
      partner_id: codeRequest.partner_id,
      discount_percent: codeRequest.partner.default_discount_percent ?? 10,
      commission_percent: codeRequest.partner.default_commission_percent ?? 15,
      free_shipping: codeRequest.partner.default_free_shipping ?? false,
      batch_id: batchId,
      batch_name: `Approved Request ${new Date().toLocaleDateString()}`
    })
  }

  // Insert codes
  const { error: insertError } = await (supabase
    .from('referral_codes')
    .insert(codes as any) as any)

  if (insertError) {
    console.error('Failed to generate codes:', insertError)
    return NextResponse.json({ error: 'Failed to generate codes' }, { status: 500 })
  }

  // Update request as approved
  const { error: updateError } = await (supabase
    .from('referral_code_requests' as any)
    .update({
      status: 'approved',
      admin_notes: adminNotes || 'Request approved',
      processed_at: new Date().toISOString(),
      batch_id: batchId
    } as any)
    .eq('id', requestId) as any)

  if (updateError) {
    console.error('Failed to update request:', updateError)
  }

  // Send notification email to partner
  try {
    const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'referral_codes_generated',
          partner_email: codeRequest.partner.contact_email,
          partner_name: codeRequest.partner.partner_name,
          quantity: codeRequest.quantity,
          codes_list: codes.map(c => c.code)
        })
      })
    }
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError)
  }

  return NextResponse.json({
    success: true,
    message: `Approved! ${codeRequest.quantity} codes generated.`,
    batchId,
    codesGenerated: codes.length
  })
}

function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
