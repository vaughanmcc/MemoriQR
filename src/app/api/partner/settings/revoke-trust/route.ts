import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// POST - Revoke all trusted device sessions for the current partner
export async function POST() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('partner_session')?.value

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get current session to find partner_id
  const { data: currentSession } = await supabase
    .from('partner_sessions')
    .select('partner_id, expires_at, is_trusted_device')
    .eq('session_token', sessionToken)
    .single()

  if (!currentSession || new Date(currentSession.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Delete all trusted device sessions for this partner (except current session if it's not trusted)
  const { error, count } = await supabase
    .from('partner_sessions')
    .delete()
    .eq('partner_id', currentSession.partner_id)
    .eq('is_trusted_device', true)
    .neq('session_token', sessionToken)

  if (error) {
    console.error('Error revoking trusted sessions:', error)
    return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 })
  }

  // If current session is trusted, convert it to standard session (1 hour from now)
  if (currentSession.is_trusted_device) {
    const newExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await supabase
      .from('partner_sessions')
      .update({ 
        is_trusted_device: false,
        expires_at: newExpiry.toISOString()
      })
      .eq('session_token', sessionToken)
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Trusted device sessions revoked. You are now on a standard 1-hour session.',
    revokedCount: count || 0
  })
}
