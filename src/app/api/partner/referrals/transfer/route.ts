import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Partner = Database['public']['Tables']['partners']['Row']

const PIPEDREAM_PARTNER_CODES_WEBHOOK_URL = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL

// Helper to get authenticated partner (same pattern as referrals/route.ts)
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

// GET - Get other businesses owned by the same partner (same email)
export async function GET() {
  const partner = await getAuthenticatedPartner()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    
    // Find other partners with the same contact email (same owner, different businesses)
    const { data: linkedPartners, error } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, partner_type')
      .ilike('contact_email', partner.contact_email || '')
      .eq('is_active', true)
      .neq('id', partner.id) // Exclude current partner

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

// POST - Transfer referral codes to a linked partner
export async function POST(request: Request) {
  const partner = await getAuthenticatedPartner()
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  try {
    const { codeIds, toPartnerId, notes } = await request.json()

    if (!codeIds || !Array.isArray(codeIds) || codeIds.length === 0) {
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
      return NextResponse.json({ error: 'Target partner not found or not owned by you' }, { status: 403 })
    }

    // Verify the codes belong to the current partner and are unused
    const { data: codes, error: codesError } = await supabase
      .from('referral_codes')
      .select('id, code, partner_id, is_used')
      .in('id', codeIds)
      .eq('partner_id', partner.id)

    if (codesError) {
      console.error('Error fetching codes:', codesError)
      return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 })
    }

    if (!codes || codes.length === 0) {
      return NextResponse.json({ error: 'No valid codes found' }, { status: 404 })
    }

    // Filter out used codes
    const unusedCodes = (codes as { id: string; code: string; partner_id: string; is_used: boolean }[]).filter((c: { is_used: boolean }) => !c.is_used)
    if (unusedCodes.length === 0) {
      return NextResponse.json({ error: 'All selected codes have already been used' }, { status: 400 })
    }

    const codeIdsToTransfer = unusedCodes.map((c: { id: string }) => c.id)

    // Transfer the codes
    const { error: updateError } = await supabase
      .from('referral_codes')
      .update({ partner_id: toPartnerId })
      .in('id', codeIdsToTransfer)

    if (updateError) {
      console.error('Error transferring codes:', updateError)
      return NextResponse.json({ error: 'Failed to transfer codes' }, { status: 500 })
    }

    // Log the activity
    const activityLogs = unusedCodes.map((code: { id: string; code: string }) => ({
      referral_code_id: code.id,
      code: code.code,
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
      .from('referral_code_activity_log')
      .insert(activityLogs)

    if (logError) {
      console.error('Error logging activity:', logError)
      // Don't fail the request, just log the error
    }

    // Send email notification to the receiving partner
    if (PIPEDREAM_PARTNER_CODES_WEBHOOK_URL && toPartner.contact_email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
      const codesList = unusedCodes.map((c: { code: string }) => c.code).join('\n')
      
      try {
        await fetch(PIPEDREAM_PARTNER_CODES_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'referral_codes_transferred',
            to: toPartner.contact_email,
            toBusinessName: toPartner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner',
            fromBusinessName: partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner',
            quantity: unusedCodes.length,
            codesList,
            notes: notes || null,
            dashboardUrl: `${baseUrl}/partner/referrals`,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send transfer notification email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      transferred: unusedCodes.length,
      skipped: codes.length - unusedCodes.length,
      message: `Successfully transferred ${unusedCodes.length} referral code(s) to ${toPartner.partner_name}`
    })
  } catch (error) {
    console.error('Error in referral transfer POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
