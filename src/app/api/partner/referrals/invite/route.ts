import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL

// Generate a unique invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'INV-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Check partner authentication
async function getPartnerSession() {
  const cookieStore = await cookies()
  const partnerId = cookieStore.get('partner-id')?.value
  const partnerToken = cookieStore.get('partner-token')?.value
  
  if (!partnerId || !partnerToken) {
    return null
  }
  
  const supabase = createAdminClient()
  const { data: partner } = await supabase
    .from('partners')
    .select('id, partner_name, contact_email, status')
    .eq('id', partnerId)
    .eq('status', 'active')
    .single()
  
  return partner
}

// GET - List referral invites for the partner
export async function GET(request: NextRequest) {
  const partner = await getPartnerSession()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase
      .from('partner_referral_invites')
      .select('*')
      .eq('partner_id', partner.id)
      .order('sent_at', { ascending: false })
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    const { data: invites, error } = await query.limit(100)
    
    if (error) {
      console.error('Error fetching invites:', error)
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
    }
    
    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
  }
}

// POST - Send a new referral invite
export async function POST(request: NextRequest) {
  const partner = await getPartnerSession()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { recipientEmail, recipientName, message } = body

    if (!recipientEmail || !recipientEmail.trim()) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if we've already sent an invite to this email recently (within 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: existingInvite } = await supabase
      .from('partner_referral_invites')
      .select('id, sent_at')
      .eq('partner_id', partner.id)
      .eq('recipient_email', recipientEmail.trim().toLowerCase())
      .gte('sent_at', sevenDaysAgo.toISOString())
      .single()

    if (existingInvite) {
      return NextResponse.json({ 
        error: 'An invite was already sent to this email within the last 7 days' 
      }, { status: 400 })
    }

    // Generate unique invite code
    let inviteCode: string
    let attempts = 0
    do {
      inviteCode = generateInviteCode()
      attempts++
      const { data: existing } = await supabase
        .from('partner_referral_invites')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()
      if (!existing) break
    } while (attempts < 10)

    if (attempts >= 10) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 })
    }

    // Calculate expiry (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create the invite record
    const { data: invite, error: insertError } = await supabase
      .from('partner_referral_invites')
      .insert({
        partner_id: partner.id,
        recipient_email: recipientEmail.trim().toLowerCase(),
        recipient_name: recipientName?.trim() || null,
        message: message?.trim() || null,
        invite_code: inviteCode,
        expires_at: expiresAt.toISOString(),
        status: 'sent',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating invite:', insertError)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    // Send the invite email via Pipedream
    if (PIPEDREAM_WEBHOOK_URL) {
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz').trim()
      const partnerBusinessName = partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'A MemoriQR Partner'
      
      // The referral link includes the invite code which we'll use to track clicks/conversions
      const referralLink = `${baseUrl}/order?ref=${inviteCode}`

      try {
        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_referral_invite',
            to: recipientEmail.trim().toLowerCase(),
            recipientName: recipientName?.trim() || null,
            partnerName: partnerBusinessName,
            personalMessage: message?.trim() || null,
            referralLink,
            inviteCode,
            expiresAt: expiresAt.toISOString(),
          }),
        })
      } catch (emailError) {
        console.error('Failed to send invite email:', emailError)
        // Don't fail the request - the invite is created, email just didn't send
      }
    }

    return NextResponse.json({ 
      success: true, 
      invite,
      message: `Referral invite sent to ${recipientEmail}` 
    })
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
