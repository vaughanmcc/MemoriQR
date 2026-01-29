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

const PIPEDREAM_PARTNER_CODES_WEBHOOK_URL = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL

// Generate a unique activation code
function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'MQR-'
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// POST - Manually generate codes for a batch stuck in approved state
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: batchId } = await context.params
  const supabase = createAdminClient()

  try {
    // Get batch details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: batch, error: batchError } = await (supabase as any)
      .from('code_batches')
      .select('*, partners(id, partner_name, contact_email)')
      .eq('id', batchId)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Only allow generating for approved (paid but not generated) batches
    if (batch.status !== 'approved') {
      return NextResponse.json({ 
        error: `Cannot generate codes for batch with status: ${batch.status}. Only 'approved' batches can be generated.` 
      }, { status: 400 })
    }

    // Check if codes already exist for this batch
    const { count: existingCount } = await supabase
      .from('retail_activation_codes')
      .select('*', { count: 'exact', head: true })
      .eq('batch_id', batchId)

    if (existingCount && existingCount > 0) {
      // Codes exist, just update status
      await supabase
        .from('code_batches')
        .update({
          status: 'generated',
          generated_at: new Date().toISOString(),
          notes: `Manually marked as generated - ${existingCount} codes already existed`
        })
        .eq('id', batchId)

      return NextResponse.json({
        success: true,
        message: `Batch already had ${existingCount} codes. Status updated to generated.`,
        codesGenerated: existingCount
      })
    }

    // Generate codes
    const quantity = batch.quantity
    const codes: string[] = []
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 2)

    for (let i = 0; i < quantity; i++) {
      let newCode: string
      let attempts = 0
      let isUnique = false

      do {
        newCode = generateActivationCode()
        attempts++
        if (attempts > 100) break
        
        if (codes.includes(newCode)) continue
        
        const { data: existing } = await supabase
          .from('retail_activation_codes')
          .select('activation_code')
          .eq('activation_code', newCode)
          .single()
        
        isUnique = !existing
      } while (!isUnique && attempts <= 100)

      if (isUnique && attempts <= 100) {
        codes.push(newCode)
      }
    }

    // Insert codes
    const codeInserts = codes.map(code => ({
      activation_code: code,
      partner_id: batch.partner_id,
      batch_id: batchId,
      product_type: batch.product_type,
      hosting_duration: batch.hosting_duration,
      is_used: false,
      expires_at: expiresAt.toISOString(),
    }))

    const { error: insertError } = await supabase
      .from('retail_activation_codes')
      .insert(codeInserts)

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to insert codes', 
        details: insertError.message 
      }, { status: 500 })
    }

    // Update batch status
    await supabase
      .from('code_batches')
      .update({
        status: 'generated',
        generated_at: new Date().toISOString(),
        notes: 'Manually generated via admin'
      })
      .eq('id', batchId)

    // Send email notification
    if (PIPEDREAM_PARTNER_CODES_WEBHOOK_URL && batch.partners?.contact_email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
      
      try {
        await fetch(PIPEDREAM_PARTNER_CODES_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_codes_generated',
            partner_email: batch.partners.contact_email,
            partner_name: batch.partners.partner_name,
            batch_number: batch.batch_number,
            quantity: codes.length,
            product_type: batch.product_type,
            hosting_duration: batch.hosting_duration,
            codes_list: codes.join('\n'),
            portal_url: `${baseUrl}/partner/codes`,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send partner codes email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${codes.length} codes for batch ${batch.batch_number}`,
      codesGenerated: codes.length,
      emailSent: !!batch.partners?.contact_email
    })

  } catch (error) {
    console.error('Error generating codes for batch:', error)
    return NextResponse.json({ error: 'Failed to generate codes' }, { status: 500 })
  }
}
