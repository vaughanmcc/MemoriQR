import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Switch to a different partner account (same email)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const currentSessionToken = cookieStore.get('partner_session')?.value

    if (!currentSessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { partnerId } = await request.json()

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get current session to find the email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentSession, error: sessionError } = await (supabase as any)
      .from('partner_sessions')
      .select(`
        *,
        partner:partners(contact_email)
      `)
      .eq('session_token', currentSessionToken)
      .single()

    if (sessionError || !currentSession) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const currentEmail = currentSession.partner?.contact_email

    if (!currentEmail) {
      return NextResponse.json(
        { error: 'Could not determine current email' },
        { status: 500 }
      )
    }

    // Verify the target partner has the same email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: targetPartner, error: partnerError } = await (supabase as any)
      .from('partners')
      .select('id, partner_name, contact_email, is_active')
      .eq('id', partnerId)
      .ilike('contact_email', currentEmail)
      .eq('is_active', true)
      .single()

    if (partnerError || !targetPartner) {
      return NextResponse.json(
        { error: 'Cannot switch to this partner account' },
        { status: 403 }
      )
    }

    // Delete current session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('partner_sessions')
      .delete()
      .eq('session_token', currentSessionToken)

    // Create new session for the target partner
    const newSessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: createError } = await (supabase as any)
      .from('partner_sessions')
      .insert({
        partner_id: targetPartner.id,
        session_token: newSessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        is_trusted_device: currentSession.is_trusted_device || false
      })

    if (createError) {
      console.error('Error creating new session:', createError)
      return NextResponse.json(
        { error: 'Failed to switch partner' },
        { status: 500 }
      )
    }

    // Set new session cookie
    const response = NextResponse.json({
      success: true,
      partner: {
        id: targetPartner.id,
        name: targetPartner.partner_name,
        email: targetPartner.contact_email
      }
    })

    response.cookies.set('partner_session', newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Switch partner error:', error)
    return NextResponse.json(
      { error: 'Failed to switch partner' },
      { status: 500 }
    )
  }
}
