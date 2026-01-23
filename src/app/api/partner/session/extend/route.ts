import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Extend session for active users (only for non-trusted device sessions)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('partner_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get current session
    const { data: session, error } = await supabase
      .from('partner_sessions')
      .select('id, partner_id, expires_at, is_trusted_device')
      .eq('session_token', sessionToken)
      .single()

    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      )
    }

    // Check if session is already expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Only extend non-trusted device sessions (trusted devices already have 24hr)
    if (session.is_trusted_device) {
      return NextResponse.json({ 
        success: true, 
        message: 'Trusted device - no extension needed',
        expiresAt: session.expires_at 
      })
    }

    // Extend by 1 hour from now
    const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await supabase
      .from('partner_sessions')
      .update({ expires_at: newExpiresAt.toISOString() })
      .eq('id', session.id)

    // Also update cookie expiry
    const response = NextResponse.json({ 
      success: true, 
      expiresAt: newExpiresAt.toISOString() 
    })

    response.cookies.set('partner_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: newExpiresAt
    })

    return response
  } catch (error) {
    console.error('Session extend error:', error)
    return NextResponse.json(
      { error: 'Failed to extend session' },
      { status: 500 }
    )
  }
}
