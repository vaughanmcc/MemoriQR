import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Verify login code and create session
export async function POST(request: NextRequest) {
  try {
    const { email, code, trustDevice, partnerId: selectedPartnerId } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedCode = String(code).trim()

    const supabase = createAdminClient()

    // Find ALL partners by email (case-insensitive)
    const { data: partners, error: partnerError } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, is_active')
      .ilike('contact_email', normalizedEmail)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (partnerError || !partners || partners.length === 0) {
      console.log('Partner lookup failed:', { normalizedEmail, partnerError })
      return NextResponse.json(
        { error: 'Invalid email or code' },
        { status: 401 }
      )
    }

    // If multiple partners exist and no specific one selected, verify code first then ask for selection
    let partner = partners[0]
    
    if (partners.length > 1 && selectedPartnerId) {
      // User selected a specific partner
      const selectedPartner = partners.find(p => p.id === selectedPartnerId)
      if (!selectedPartner) {
        return NextResponse.json(
          { error: 'Invalid partner selection' },
          { status: 400 }
        )
      }
      partner = selectedPartner
    }

    // Find and validate login code - check against ALL partners with this email
    let loginCode = null
    let codeOwnerPartner = null
    
    for (const p of partners) {
      const { data: code, error: codeError } = await supabase
        .from('partner_login_codes')
        .select('*')
        .eq('partner_id', p.id)
        .eq('code', normalizedCode)
        .is('used_at', null)
        .single()
      
      if (!codeError && code) {
        loginCode = code
        codeOwnerPartner = p
        break
      }
    }

    if (!loginCode || !codeOwnerPartner) {
      // Check if there's ANY code for these partners to help debug
      const partnerIds = partners.map(p => p.id)
      const { data: allCodes } = await supabase
        .from('partner_login_codes')
        .select('partner_id, code, expires_at, used_at, created_at')
        .in('partner_id', partnerIds)
        .order('created_at', { ascending: false })
        .limit(5)
      
      console.log('Recent codes for partners:', allCodes)
      
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      )
    }

    // Check if code is expired
    if (new Date(loginCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Code has expired. Please request a new one.' },
        { status: 401 }
      )
    }

    // If multiple partners and no selection made yet, return the list for selection
    if (partners.length > 1 && !selectedPartnerId) {
      return NextResponse.json({
        requiresSelection: true,
        partners: partners.map(p => ({
          id: p.id,
          name: p.partner_name
        })),
        message: 'Multiple businesses found. Please select which one to log into.'
      })
    }

    // Mark code as used
    await supabase
      .from('partner_login_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', loginCode.id)

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const isTrustedDevice = trustDevice === true
    // Trusted devices get 24 hours, standard sessions get 1 hour (but can be extended with activity)
    const sessionDuration = isTrustedDevice ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + sessionDuration)

    // Get request info for session
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create session
    const { error: sessionError } = await supabase
      .from('partner_sessions')
      .insert({
        partner_id: partner.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        is_trusted_device: isTrustedDevice
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Update partner last login
    await supabase
      .from('partners')
      .update({
        last_login: new Date().toISOString(),
        login_count: (partner as any).login_count ? (partner as any).login_count + 1 : 1
      })
      .eq('id', partner.id)

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.partner_name,
        email: partner.contact_email
      }
    })

    response.cookies.set('partner_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
