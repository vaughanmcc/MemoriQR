import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

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
      .select('id, partner_name, status')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      console.error('Partner lookup error:', partnerError)
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const partnerDisplayName = partner.partner_name || 'Unknown Partner'

    if (partner.status !== 'active') {
      return NextResponse.json({ error: 'Partner is not active' }, { status: 400 })
    }

    // Get the codes that are unassigned and unused
    const { data: existingCodes, error: fetchError } = await supabase
      .from('retail_activation_codes')
      .select('activation_code, partner_id, is_used')
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

    // Only unassign codes that are not used
    const { data: existingCodes, error: fetchError } = await supabase
      .from('retail_activation_codes')
      .select('activation_code, partner_id, is_used')
      .in('activation_code', codes)

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 })
    }

    const unassignableCodes = existingCodes?.filter(c => c.partner_id && !c.is_used) || []

    if (unassignableCodes.length === 0) {
      return NextResponse.json({ error: 'No assigned unused codes to unassign' }, { status: 400 })
    }

    const codesToUnassign = unassignableCodes.map(c => c.activation_code)

    const { error: updateError } = await supabase
      .from('retail_activation_codes')
      .update({ partner_id: null })
      .in('activation_code', codesToUnassign)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to unassign codes' }, { status: 500 })
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
