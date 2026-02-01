import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL

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

// Check partner authentication
async function getPartnerSession(): Promise<Partner | null> {
  const cookieStore = await cookies()
  const partnerId = cookieStore.get('partner-id')?.value
  const partnerToken = cookieStore.get('partner-token')?.value
  
  if (!partnerId || !partnerToken) {
    return null
  }
  
  const supabase = createAdminClient()
  const { data: partner } = await supabase
    .from('partners')
    .select('id, partner_name, contact_email, status, default_discount_percent')
    .eq('id', partnerId)
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

    // Send email via Pipedream
    if (PIPEDREAM_WEBHOOK_URL) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
        const orderUrl = `${baseUrl}/order?ref=${encodeURIComponent(referralCode.code)}`

        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'referral_code_share',
            to: recipientEmail.trim().toLowerCase(),
            recipientName: recipientName?.trim() || null,
            partnerName: partner.partner_name,
            referralCode: referralCode.code,
            discountPercent: referralCode.discount_percent || partner.default_discount_percent || 0,
            freeShipping: referralCode.free_shipping || false,
            personalMessage: message?.trim() || null,
            orderUrl,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send share email:', emailError)
        // Don't fail the request if email fails - the share is still recorded
      }
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
