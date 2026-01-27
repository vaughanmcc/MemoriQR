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

// Generate a unique activation code
function generateCode(productType: string, hostingDuration: number): string {
  const durationCode = hostingDuration.toString()
  const productCode = productType === 'both' ? 'B' : productType === 'nfc_only' ? 'N' : 'Q'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let randomPart = ''
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `MQR-${durationCode}${productCode}-${randomPart}`
}

// PATCH - Approve or reject a batch
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { action } = await request.json() // 'approve', 'reject', 'generate'

    if (!action || !['approve', 'reject', 'generate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get batch details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: batch, error: batchError } = await (supabase as any)
      .from('code_batches')
      .select('*, partner:partners(id, partner_name, contact_email)')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    if (action === 'approve') {
      if (batch.status !== 'pending') {
        return NextResponse.json({ error: 'Can only approve pending batches' }, { status: 400 })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('code_batches')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to approve batch' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Batch approved' })
    }

    if (action === 'reject') {
      if (batch.status !== 'pending') {
        return NextResponse.json({ error: 'Can only reject pending batches' }, { status: 400 })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('code_batches')
        .update({
          status: 'cancelled'
        })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to reject batch' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Batch rejected' })
    }

    if (action === 'generate') {
      if (batch.status !== 'approved') {
        return NextResponse.json({ error: 'Can only generate codes for approved batches' }, { status: 400 })
      }

      // Generate codes
      const codes: string[] = []
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 2) // Codes expire in 2 years

      for (let i = 0; i < batch.quantity; i++) {
        let newCode: string
        let attempts = 0

        do {
          newCode = generateCode(batch.product_type, batch.hosting_duration || 10)
          attempts++
          if (attempts > 100) {
            return NextResponse.json({ error: 'Failed to generate unique codes' }, { status: 500 })
          }
          // Check uniqueness
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existing } = await (supabase as any)
            .from('activation_codes')
            .select('activation_code')
            .eq('activation_code', newCode)
            .single()
          if (!existing) break
        } while (true)

        codes.push(newCode)
      }

      // Insert codes
      const codeRecords = codes.map(code => ({
        activation_code: code,
        product_type: batch.product_type,
        hosting_duration: batch.hosting_duration,
        is_used: false,
        partner_id: batch.partner_id,
        batch_id: batch.id,
        expires_at: expiresAt.toISOString(),
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('activation_codes')
        .insert(codeRecords)

      if (insertError) {
        console.error('Error inserting codes:', insertError)
        return NextResponse.json({ error: 'Failed to insert codes' }, { status: 500 })
      }

      // Update batch status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('code_batches')
        .update({
          status: 'generated',
          generated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating batch:', updateError)
      }

      // Send email notification to partner
      const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
      if (webhookUrl && batch.partner?.contact_email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
        const partnerName = batch.partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner'

        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'partner_codes_generated',
              partner_email: batch.partner.contact_email,
              partner_name: partnerName,
              batch_number: batch.batch_number,
              quantity: codes.length,
              product_type: batch.product_type,
              hosting_duration: batch.hosting_duration || 10,
              codes_list: codes.join('\n'),
              portal_url: `${baseUrl}/partner/codes`,
            }),
          })
          console.log(`Partner codes email sent to ${batch.partner.contact_email}`)
        } catch (emailError) {
          console.error('Failed to send partner codes email:', emailError)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Generated ${codes.length} codes`,
        codes
      })
    }
  } catch (error) {
    console.error('Error processing batch action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get batch details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: batch, error } = await (supabase as any)
      .from('code_batches')
      .select('*, partner:partners(id, partner_name, contact_email)')
      .eq('id', id)
      .single()

    if (error || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Get codes for this batch if generated
    let codes: string[] = []
    if (batch.status === 'generated') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: codeData } = await (supabase as any)
        .from('activation_codes')
        .select('activation_code')
        .eq('batch_id', id)

      codes = codeData?.map((c: { activation_code: string }) => c.activation_code) || []
    }

    return NextResponse.json({ batch, codes })
  } catch (error) {
    console.error('Error fetching batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
