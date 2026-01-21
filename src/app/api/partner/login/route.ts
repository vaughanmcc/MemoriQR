import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Send magic link / login code to partner email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find partner by email
    const { data: partners, error: partnerError } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, is_active, created_at')
      .ilike('contact_email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1)

    const partner = partners?.[0]

    if (partnerError || !partner) {
      // Don't reveal if partner exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a login code will be sent.'
      })
    }

    if (!partner.is_active) {
      return NextResponse.json(
        { error: 'This partner account is inactive. Please contact support.' },
        { status: 403 }
      )
    }

    // Also check status - must be 'active' or 'approved' (not 'pending' or 'rejected')
    const { data: fullPartner } = await supabase
      .from('partners')
      .select('status')
      .eq('id', partner.id)
      .single()
    
    if (fullPartner?.status === 'pending') {
      return NextResponse.json(
        { error: 'Your partner application is still being reviewed. You will receive an email when approved.' },
        { status: 403 }
      )
    }

    if (fullPartner?.status === 'rejected') {
      return NextResponse.json(
        { error: 'This partner application was not approved. Please contact support for more information.' },
        { status: 403 }
      )
    }

    // Generate 6-digit login code
    const loginCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Delete any existing codes for this partner
    await supabase
      .from('partner_login_codes')
      .delete()
      .eq('partner_id', partner.id)

    // Insert new login code
    const { error: codeError } = await supabase
      .from('partner_login_codes')
      .insert({
        partner_id: partner.id,
        code: loginCode,
        expires_at: expiresAt.toISOString()
      })

    if (codeError) {
      console.error('Error creating login code:', codeError)
      return NextResponse.json(
        { error: 'Failed to generate login code' },
        { status: 500 }
      )
    }

    // Send login code via Pipedream webhook
    const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('PIPEDREAM_WEBHOOK_URL is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      )
    }
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_login_code',
            partner_email: partner.contact_email,
            partner_name: partner.partner_name,
            login_code: loginCode,
            expires_in: '15 minutes',
            expires_at: expiresAt.toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }),
            sender_name: 'MemoriQR Partner Portal',
            reply_to: 'partners@memoriqr.co.nz'
          })
        })
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'unknown error')
          console.error('Login code webhook failed:', response.status, errorText)
        }
      } catch (emailError) {
        console.error('Failed to send login code email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a login code will be sent.'
    })

  } catch (error) {
    console.error('Login request error:', error)
    return NextResponse.json(
      { error: 'Failed to process login request' },
      { status: 500 }
    )
  }
}
