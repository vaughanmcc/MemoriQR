import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Verify login code and create session
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedCode = String(code).trim()

    const supabase = createAdminClient()

    // Find partner by email (case-insensitive) - use same ordering as login route
    const { data: partners, error: partnerError } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, is_active')
      .ilike('contact_email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1)

    const partner = partners?.[0]

    if (partnerError || !partner) {
      console.log('Partner lookup failed:', { normalizedEmail, partnerError })
      return NextResponse.json(
        { error: 'Invalid email or code' },
        { status: 401 }
      )
    }

    if (!partner.is_active) {
      return NextResponse.json(
        { error: 'This partner account is inactive' },
        { status: 403 }
      )
    }

    // Find and validate login code
    const { data: loginCode, error: codeError } = await supabase
      .from('partner_login_codes')
      .select('*')
      .eq('partner_id', partner.id)
      .eq('code', normalizedCode)
      .is('used_at', null)
      .single()

    console.log('Login code lookup:', { 
      partnerId: partner.id, 
      codeEntered: normalizedCode,
      codeError: codeError?.message,
      codeFound: !!loginCode 
    })

    if (codeError || !loginCode) {
      // Check if there's ANY code for this partner to help debug
      const { data: allCodes } = await supabase
        .from('partner_login_codes')
        .select('code, expires_at, used_at, created_at')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false })
        .limit(3)
      
      console.log('Recent codes for partner:', allCodes)
      
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

    // Mark code as used
    await supabase
      .from('partner_login_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', loginCode.id)

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour

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
        user_agent: userAgent
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
