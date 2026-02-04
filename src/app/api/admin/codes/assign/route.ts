import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

const PIPEDREAM_PARTNER_CODES_WEBHOOK_URL = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL

// Check admin authentication
async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  return !!correctPassword && session === correctPassword
}

// POST - Assign codes to a partner
export async function POST(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { codes, partnerId } = await request.json()

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: 'No codes provided' }, { status: 400 })
    }

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify partner exists and is active
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, status')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      console.error('Partner lookup error:', partnerError)
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const partnerDisplayName = partner.partner_name || 'Unknown Partner'
    const partnerEmail = partner.contact_email

    if (partner.status !== 'active') {
      return NextResponse.json({ error: 'Partner is not active' }, { status: 400 })
    }

    // Get the codes that are unassigned and unused
    const { data: existingCodes, error: fetchError } = await supabase
      .from('retail_activation_codes')
      .select('activation_code, partner_id, is_used, product_type, hosting_duration')
      .in('activation_code', codes)

    if (fetchError) {
      console.error('Error fetching codes:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 })
    }

    // Filter to only unassigned codes
    const assignableCodes = existingCodes?.filter(c => !c.partner_id && !c.is_used) || []
    const alreadyAssigned = existingCodes?.filter(c => c.partner_id) || []
    const usedCodes = existingCodes?.filter(c => c.is_used) || []

    if (assignableCodes.length === 0) {
      let message = 'No codes available to assign.'
      if (alreadyAssigned.length > 0) message += ` ${alreadyAssigned.length} already assigned.`
      if (usedCodes.length > 0) message += ` ${usedCodes.length} already used.`
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Assign codes to partner
    const codesToAssign = assignableCodes.map(c => c.activation_code)
    
    const { error: updateError } = await supabase
      .from('retail_activation_codes')
      .update({ partner_id: partnerId })
      .in('activation_code', codesToAssign)

    if (updateError) {
      console.error('Error assigning codes:', updateError)
      return NextResponse.json({ error: 'Failed to assign codes' }, { status: 500 })
    }

    console.log(`Assigned ${codesToAssign.length} codes to partner ${partnerDisplayName} (${partnerId})`)

    // Log activity for each code
    const activityLogs = codesToAssign.map(code => ({
      activation_code: code,
      activity_type: 'assigned',
      performed_by_admin: true,
      from_partner_id: null,
      to_partner_id: partnerId,
      from_partner_name: null,
      to_partner_name: partnerDisplayName,
      notes: `Assigned by admin`,
      metadata: { assigned_at: new Date().toISOString() }
    }))

    const { error: logError } = await supabase
      .from('activation_code_activity_log')
      .insert(activityLogs)

    if (logError) {
      console.error('Error logging activity:', logError)
      // Don't fail - activity logging is non-critical
    }

    // Send email notification to partner
    if (partnerEmail && codesToAssign.length > 0 && PIPEDREAM_PARTNER_CODES_WEBHOOK_URL) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
      const businessName = partnerDisplayName.replace(/\s*\([^)]+\)\s*$/, '')
      
      // Get product info from first code (they may be mixed, but give an indication)
      const firstCode = assignableCodes[0]
      
      try {
        await fetch(PIPEDREAM_PARTNER_CODES_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_codes_generated',
            partner_email: partnerEmail,
            partner_name: businessName,
            batch_number: `Assigned ${new Date().toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}`,
            quantity: codesToAssign.length,
            product_type: firstCode?.product_type || 'both',
            hosting_duration: firstCode?.hosting_duration || 10,
            codes_list: codesToAssign.join('\n'),
            portal_url: `${baseUrl}/partner/codes`,
          }),
        })
        console.log(`Code assignment email sent to ${partnerEmail}`)
      } catch (emailError) {
        console.error('Failed to send code assignment email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      assigned: codesToAssign.length,
      skippedAlreadyAssigned: alreadyAssigned.length,
      skippedUsed: usedCodes.length,
      partnerName: partnerDisplayName,
    })

  } catch (error) {
    console.error('Assign codes error:', error)
    return NextResponse.json({ error: 'Failed to assign codes' }, { status: 500 })
  }
}

// DELETE - Unassign codes from partner (make them unassigned again)
export async function DELETE(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { codes } = await request.json()

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: 'No codes provided' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Only unassign codes that are not used - also get partner info for notification
    const { data: existingCodes, error: fetchError } = await supabase
      .from('retail_activation_codes')
      .select('activation_code, partner_id, is_used, partners(id, partner_name, contact_email)')
      .in('activation_code', codes)

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 })
    }

    const unassignableCodes = existingCodes?.filter(c => c.partner_id && !c.is_used) || []

    if (unassignableCodes.length === 0) {
      return NextResponse.json({ error: 'No assigned unused codes to unassign' }, { status: 400 })
    }

    // Group codes by partner for notifications
    const codesByPartner = new Map<string, { codes: string[]; email: string | null; name: string }>()
    for (const code of unassignableCodes) {
      const partnerId = code.partner_id as string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const partnerInfo = code.partners as any
      if (!codesByPartner.has(partnerId)) {
        codesByPartner.set(partnerId, {
          codes: [],
          email: partnerInfo?.contact_email || null,
          name: partnerInfo?.partner_name || 'Partner',
        })
      }
      codesByPartner.get(partnerId)!.codes.push(code.activation_code)
    }

    const codesToUnassign = unassignableCodes.map(c => c.activation_code)

    const { error: updateError } = await supabase
      .from('retail_activation_codes')
      .update({ partner_id: null })
      .in('activation_code', codesToUnassign)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to unassign codes' }, { status: 500 })
    }

    // Log activity for each code
    const activityLogs = unassignableCodes.map((code: { activation_code: string; partner_id: string; partners: { partner_name?: string } | null }) => ({
      activation_code: code.activation_code,
      activity_type: 'unassigned',
      performed_by_admin: true,
      from_partner_id: code.partner_id,
      to_partner_id: null,
      from_partner_name: (code.partners as { partner_name?: string } | null)?.partner_name || 'Partner',
      to_partner_name: null,
      notes: `Unassigned by admin`,
      metadata: { unassigned_at: new Date().toISOString() }
    }))

    const { error: logError } = await supabase
      .from('activation_code_activity_log')
      .insert(activityLogs)

    if (logError) {
      console.error('Error logging unassign activity:', logError)
      // Don't fail - activity logging is non-critical
    }

    // Send email notification to each affected partner
    if (PIPEDREAM_PARTNER_CODES_WEBHOOK_URL) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
      
      for (const [, partnerData] of codesByPartner) {
        if (partnerData.email && partnerData.codes.length > 0) {
          const businessName = partnerData.name.replace(/\s*\([^)]+\)\s*$/, '')
          
          try {
            await fetch(PIPEDREAM_PARTNER_CODES_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'partner_codes_unassigned',
                partner_email: partnerData.email,
                partner_name: businessName,
                quantity: partnerData.codes.length,
                codes_list: partnerData.codes.join('\n'),
                portal_url: `${baseUrl}/partner/codes`,
              }),
            })
            console.log(`Code unassignment email sent to ${partnerData.email}`)
          } catch (emailError) {
            console.error('Failed to send code unassignment email:', emailError)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      unassigned: codesToUnassign.length,
    })

  } catch (error) {
    console.error('Unassign codes error:', error)
    return NextResponse.json({ error: 'Failed to unassign codes' }, { status: 500 })
  }
}
