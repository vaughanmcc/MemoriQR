import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Get current partner session
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('partner_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Find session
    const { data: session, error: sessionError } = await supabase
      .from('partner_sessions')
      .select(`
        *,
        partner:partners(
          id,
          partner_name,
          partner_type,
          contact_email,
          commission_rate,
          is_active
        )
      `)
      .eq('session_token', sessionToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase
        .from('partner_sessions')
        .delete()
        .eq('id', session.id)

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    const partner = session.partner as any

    if (!partner || !partner.is_active) {
      return NextResponse.json(
        { error: 'Partner account is inactive' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      partner: {
        id: partner.id,
        name: partner.partner_name,
        type: partner.partner_type,
        email: partner.contact_email,
        commissionRate: partner.commission_rate
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    )
  }
}

// Logout - delete session
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('partner_session')?.value

    if (sessionToken) {
      const supabase = createAdminClient()

      // Delete session from database
      await supabase
        .from('partner_sessions')
        .delete()
        .eq('session_token', sessionToken)
    }

    // Clear cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('partner_session')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
