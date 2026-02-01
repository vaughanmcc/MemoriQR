import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST - Track when a referral invite link is clicked
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inviteCode } = body

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get the invite
    const { data: invite, error } = await supabase
      .from('partner_referral_invites')
      .select('id, partner_id, status, expires_at, clicked_at')
      .eq('invite_code', inviteCode)
      .single()

    if (error || !invite) {
      // Invalid code - just return success to not reveal info
      return NextResponse.json({ valid: false })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('partner_referral_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id)
      return NextResponse.json({ valid: false, expired: true })
    }

    // Only update clicked_at if not already clicked
    if (!invite.clicked_at) {
      await supabase
        .from('partner_referral_invites')
        .update({ 
          clicked_at: new Date().toISOString(),
          status: 'clicked'
        })
        .eq('id', invite.id)
    }

    // Get partner info for display
    const { data: partner } = await supabase
      .from('partners')
      .select('partner_name')
      .eq('id', invite.partner_id)
      .single()

    const partnerName = partner?.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'A MemoriQR Partner'

    return NextResponse.json({ 
      valid: true,
      inviteCode,
      partnerName,
    })
  } catch (error) {
    console.error('Error tracking invite click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
