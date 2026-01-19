import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Generate a 6-digit verification code
function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Edit token is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Look up memorial by edit token
    const { data: memorial, error: memorialError } = await supabase
      .from('memorial_records')
      .select('id, deceased_name, customer_id')
      .eq('edit_token', token)
      .single()

    if (memorialError || !memorial) {
      return NextResponse.json({ error: 'Memorial not found or invalid token' }, { status: 404 })
    }

    // Get customer email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('email, full_name')
      .eq('id', memorial.customer_id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Generate verification code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing unused verification codes for this memorial (but not session tokens)
    await supabase
      .from('edit_verification_codes')
      .delete()
      .eq('memorial_id', memorial.id)
      .is('used_at', null)
      .not('code', 'like', 'SESSION:%')

    // Insert new verification code
    const { error: insertError } = await supabase
      .from('edit_verification_codes')
      .insert({
        memorial_id: memorial.id,
        code,
        email: customer.email,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Failed to create verification code:', insertError)
      return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 })
    }

    // Send email via Pipedream webhook
    const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'edit_verification',
            customer_email: customer.email,
            customer_name: customer.full_name,
            sender_name: 'MemoriQR',
            reply_to: 'memoriqr.global@gmail.com',
            deceased_name: memorial.deceased_name,
            verification_code: code,
            expires_in: '1 hour',
            expires_at: expiresAt.toLocaleString('en-NZ', { 
              timeZone: 'Pacific/Auckland',
              dateStyle: 'medium',
              timeStyle: 'short'
            }),
          }),
        })
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Continue anyway - code is created, user can request a new one
      }
    } else {
      console.warn('PIPEDREAM_WEBHOOK_URL not configured - verification email not sent')
    }

    // Mask email for display
    const maskedEmail = customer.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      email: maskedEmail,
      expiresIn: '1 hour',
    })
  } catch (error) {
    console.error('Send verification code error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
