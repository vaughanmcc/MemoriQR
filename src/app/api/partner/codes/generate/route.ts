import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Admin endpoint to generate codes for approved batch
// This should only be called by admin after approving a batch request
export async function POST(request: NextRequest) {
  try {
    // Check for admin API key
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_API_KEY

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { batchId } = await request.json()

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get batch details
    const { data: batch, error: batchError } = await supabase
      .from('code_batches')
      .select('*, partner:partners(partner_name, contact_email)')
      .eq('id', batchId)
      .single()

    if (batchError || !batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      )
    }

    if (batch.status !== 'approved') {
      return NextResponse.json(
        { error: 'Batch must be approved before generating codes' },
        { status: 400 }
      )
    }

    // Generate codes
    const codes: string[] = []
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 2) // Codes expire in 2 years

    for (let i = 0; i < batch.quantity; i++) {
      let newCode: string
      let attempts = 0
      
      do {
        // Generate unique 8-character alphanumeric code
        newCode = generateCode()
        attempts++
        
        // Check if code exists
        const { data: existing } = await supabase
          .from('retail_activation_codes')
          .select('activation_code')
          .eq('activation_code', newCode)
          .single()

        if (!existing) {
          break
        }
      } while (attempts < 10)

      // Insert code
      const { error: insertError } = await supabase
        .from('retail_activation_codes')
        .insert({
          activation_code: newCode,
          partner_id: batch.partner_id,
          product_type: batch.product_type,
          hosting_duration: batch.hosting_duration,
          is_used: false,
          expires_at: expiresAt.toISOString()
        })

      if (!insertError) {
        codes.push(newCode)
      }
    }

    // Update batch status
    await supabase
      .from('code_batches')
      .update({
        status: 'generated',
        generated_at: new Date().toISOString()
      })
      .eq('id', batchId)

    // Send notification to partner
    const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
    if (webhookUrl && batch.partner) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_codes_generated',
            partner_email: (batch.partner as any).contact_email,
            partner_name: (batch.partner as any).partner_name,
            batch_number: batch.batch_number,
            quantity: codes.length,
            product_type: batch.product_type,
            hosting_duration: batch.hosting_duration,
            codes_list: codes.join('\n'),
            portal_url: `${process.env.NEXT_PUBLIC_APP_URL}/partner/codes`
          })
        })
      } catch (emailError) {
        console.error('Failed to send partner notification:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      codesGenerated: codes.length,
      codes
    })

  } catch (error) {
    console.error('Generate codes error:', error)
    return NextResponse.json(
      { error: 'Failed to generate codes' },
      { status: 500 }
    )
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded I, O, 0, 1 to avoid confusion
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
