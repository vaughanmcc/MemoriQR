import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Partner = Database['public']['Tables']['partners']['Row']

const PIPEDREAM_PARTNER_CODES_WEBHOOK_URL = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL

// Helper to get authenticated partner
async function getAuthenticatedPartner(): Promise<Partner | null> {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('partner_session')?.value

  if (!sessionToken) {
    return null
  }

  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from('partner_sessions')
    .select('partner_id, expires_at')
    .eq('session_token', sessionToken)
    .single() as { data: { partner_id: string; expires_at: string } | null }

  if (!session || new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('id', session.partner_id)
    .eq('is_active', true)
    .single() as { data: Partner | null }

  return partner
}

// GET - Get other businesses owned by the same partner (same email) - for transfer target selection
export async function GET() {
  const partner = await getAuthenticatedPartner()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    
    console.log(`[Activation Transfer] Looking for linked partners for ${partner.partner_name} with email ${partner.contact_email}`)
    
    // Find other partners with the same contact email (same owner, different businesses)
    const { data: linkedPartners, error } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, partner_type')
      .ilike('contact_email', partner.contact_email || '')
      .eq('is_active', true)
      .neq('id', partner.id) // Exclude current partner

    console.log(`[Activation Transfer] Found ${linkedPartners?.length || 0} linked partners, error: ${error?.message || 'none'}`)

    if (error) {
      console.error('Error fetching linked partners:', error)
      return NextResponse.json({ error: 'Failed to fetch linked partners' }, { status: 500 })
    }

    return NextResponse.json({ linkedPartners: linkedPartners || [] })
  } catch (error) {
    console.error('Error in linked partners GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Transfer activation codes to a linked partner (same owner)
export async function POST(request: Request) {
  const partner = await getAuthenticatedPartner()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  try {
    const { codes, toPartnerId, notes } = await request.json()

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: 'No codes provided' }, { status: 400 })
    }

    if (!toPartnerId) {
      return NextResponse.json({ error: 'Target partner not specified' }, { status: 400 })
    }

    // Fetch target partner details and verify they share the same email (same owner)
    const { data: toPartner, error: toPartnerError } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, is_active')
      .eq('id', toPartnerId)
      .ilike('contact_email', partner.contact_email || '') // Must be same owner
      .eq('is_active', true)
      .single()

    if (toPartnerError || !toPartner) {
      return NextResponse.json({ error: 'Target partner not found or not linked to your account' }, { status: 403 })
    }

    // Verify all codes belong to the current partner and are unused
    const { data: existingCodes, error: codesError } = await supabase
      .from('retail_activation_codes')
      .select('activation_code, partner_id, is_used')
      .in('activation_code', codes)

    if (codesError) {
      console.error('Error fetching codes:', codesError)
      return NextResponse.json({ error: 'Failed to verify codes' }, { status: 500 })
    }

    // Filter to only codes owned by current partner that are unused
    const ownedUnusedCodes = existingCodes?.filter(
      c => c.partner_id === partner.id && !c.is_used
    ) || []

    if (ownedUnusedCodes.length === 0) {
      const otherPartnerCodes = existingCodes?.filter(c => c.partner_id !== partner.id).length || 0
      const usedCodes = existingCodes?.filter(c => c.is_used).length || 0
      let message = 'No codes available to transfer.'
      if (otherPartnerCodes > 0) message += ` ${otherPartnerCodes} belong to other partners.`
      if (usedCodes > 0) message += ` ${usedCodes} already used.`
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Transfer the codes
    const codesToTransfer = ownedUnusedCodes.map(c => c.activation_code)
    
    const { error: updateError } = await supabase
      .from('retail_activation_codes')
      .update({ partner_id: toPartnerId })
      .in('activation_code', codesToTransfer)

    if (updateError) {
      console.error('Error transferring codes:', updateError)
      return NextResponse.json({ error: 'Failed to transfer codes' }, { status: 500 })
    }

    // Log the activity for each transferred code
    const activityLogs = codesToTransfer.map((code: string) => ({
      activation_code: code,
      code: code,
      activity_type: 'transferred',
      performed_by_partner_id: partner.id,
      performed_by_admin: false,
      from_partner_id: partner.id,
      to_partner_id: toPartnerId,
      from_partner_name: partner.partner_name,
      to_partner_name: toPartner.partner_name,
      notes: notes || null,
      metadata: { transferred_at: new Date().toISOString() }
    }))

    const { error: logError } = await supabase
      .from('activation_code_activity_log')
      .insert(activityLogs)

    if (logError) {
      console.error('Error logging activity:', logError)
      // Don't fail the request, just log the error
    }

    console.log(`Partner ${partner.partner_name} transferred ${codesToTransfer.length} activation codes to ${toPartner.partner_name}`)

    // Send email notification to the receiving partner (same email, but different business)
    if (PIPEDREAM_PARTNER_CODES_WEBHOOK_URL && toPartner.contact_email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
      const codesList = codesToTransfer.join('\n')
      
      try {
        await fetch(PIPEDREAM_PARTNER_CODES_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'activation_codes_transferred',
            to: toPartner.contact_email,
            toBusinessName: toPartner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner',
            fromBusinessName: partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner',
            quantity: codesToTransfer.length,
            codesList,
            notes: notes || null,
            dashboardUrl: `${baseUrl}/partner/codes`,
          }),
        })
        console.log(`Activation code transfer email sent to ${toPartner.contact_email}`)
      } catch (emailError) {
        console.error('Failed to send transfer email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      transferred: codesToTransfer.length,
      toPartnerName: toPartner.partner_name,
      skipped: codes.length - codesToTransfer.length
    })

  } catch (error) {
    console.error('Error transferring activation codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
