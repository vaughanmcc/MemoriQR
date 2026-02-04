import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// Use the partner codes webhook for share emails
const PIPEDREAM_PARTNER_CODES_WEBHOOK_URL = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL

interface Partner {
  id: string
  partner_name: string
  contact_email: string
  status: string
  default_discount_percent: number
}

interface ReferralCode {
  id: string
  code: string
  is_used: boolean
  discount_percent: number
  free_shipping: boolean
}

// Check partner authentication - using partner_session cookie
async function getPartnerSession(): Promise<Partner | null> {
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
    .single()

  if (!session || new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('id, partner_name, contact_email, status, default_discount_percent')
    .eq('id', session.partner_id)
    .eq('status', 'active')
    .single()
  
  return partner as Partner | null
}

// GET - List shared codes for the partner
export async function GET(request: NextRequest) {
  const partner = await getPartnerSession()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    
    // Get shares with referral code info - use any to work around missing table types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: shares, error } = await (supabase as any)
      .from('referral_code_shares')
      .select(`
        id,
        recipient_email,
        recipient_name,
        message,
        sent_at,
        referral_code_id,
        referral_codes (
          code,
          is_used,
          used_at
        )
      `)
      .eq('partner_id', partner.id)
      .order('sent_at', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Error fetching shares:', error)
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
    }
    
    return NextResponse.json({ shares })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
  }
}

// POST - Share a referral code via email
export async function POST(request: NextRequest) {
  const partner = await getPartnerSession()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { referralCodeId, recipientEmail, recipientName, message } = body

    if (!referralCodeId) {
      return NextResponse.json({ error: 'Please select a referral code' }, { status: 400 })
    }

    if (!recipientEmail || !recipientEmail.trim()) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify the referral code belongs to this partner and is not used
    const { data: referralCodeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('id, code, is_used, discount_percent, free_shipping')
      .eq('id', referralCodeId)
      .eq('partner_id', partner.id)
      .single()

    const referralCode = referralCodeData as ReferralCode | null

    if (codeError || !referralCode) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
    }

    if (referralCode.is_used) {
      return NextResponse.json({ error: 'This code has already been used' }, { status: 400 })
    }

    // Check if this code has already been shared to the same email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingShare } = await (supabase as any)
      .from('referral_code_shares')
      .select('id')
      .eq('referral_code_id', referralCodeId)
      .eq('recipient_email', recipientEmail.trim().toLowerCase())
      .single()

    if (existingShare) {
      return NextResponse.json({ 
        error: 'This code has already been shared with this email address' 
      }, { status: 400 })
    }

    // Create the share record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: share, error: insertError } = await (supabase as any)
      .from('referral_code_shares')
      .insert({
        referral_code_id: referralCodeId,
        partner_id: partner.id,
        recipient_email: recipientEmail.trim().toLowerCase(),
        recipient_name: recipientName?.trim() || null,
        message: message?.trim() || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating share:', insertError)
      return NextResponse.json({ error: 'Failed to share code' }, { status: 500 })
    }

    // Log share activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('referral_code_activity_log')
      .insert({
        referral_code_id: referralCodeId,
        code: referralCode.code,
        activity_type: 'shared',
        performed_by_partner_id: partner.id,
        performed_by_admin: false,
        from_partner_id: partner.id,
        to_partner_id: partner.id,
        from_partner_name: partner.partner_name,
        to_partner_name: partner.partner_name,
        notes: `Shared with ${recipientName || recipientEmail.trim().toLowerCase()}`,
        metadata: { 
          share_id: share.id,
          recipient_email: recipientEmail.trim().toLowerCase(),
          recipient_name: recipientName?.trim() || null,
          shared_at: new Date().toISOString()
        }
      })

    // Send email via Pipedream (partner codes workflow)
    if (PIPEDREAM_PARTNER_CODES_WEBHOOK_URL) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
        const orderUrl = `${baseUrl}/order?ref=${encodeURIComponent(referralCode.code)}`

        const webhookPayload = {
          type: 'referral_code_share',
          to: recipientEmail.trim().toLowerCase(),
          recipientName: recipientName?.trim() || null,
          partnerName: partner.partner_name,
          referralCode: referralCode.code,
          discountPercent: referralCode.discount_percent || partner.default_discount_percent || 0,
          freeShipping: referralCode.free_shipping || false,
          personalMessage: message?.trim() || null,
          orderUrl,
        }
        
        console.log('[Share] Sending to Pipedream:', {
          url: PIPEDREAM_PARTNER_CODES_WEBHOOK_URL,
          payload: webhookPayload,
        })

        const response = await fetch(PIPEDREAM_PARTNER_CODES_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        })
        
        console.log('[Share] Pipedream response status:', response.status)
      } catch (emailError) {
        console.error('Failed to send share email:', emailError)
        // Don't fail the request if email fails - the share is still recorded
      }
    } else {
      console.warn('[Share] PIPEDREAM_PARTNER_CODES_WEBHOOK_URL not set!')
    }

    return NextResponse.json({ 
      success: true,
      message: `Code ${referralCode.code} shared with ${recipientEmail}`,
      share 
    })
  } catch (error) {
    console.error('Error sharing code:', error)
    return NextResponse.json({ error: 'Failed to share code' }, { status: 500 })
  }
}
