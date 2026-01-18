import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Generate a secure session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { token, code } = await request.json()

    if (!token || !code) {
      return NextResponse.json({ error: 'Token and code are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Look up memorial by edit token
    const { data: memorial, error: memorialError } = await supabase
      .from('memorial_records')
      .select('id')
      .eq('edit_token', token)
      .single()

    if (memorialError || !memorial) {
      return NextResponse.json({ error: 'Memorial not found or invalid token' }, { status: 404 })
    }

    // Look up verification code
    const { data: verification, error: verificationError } = await supabase
      .from('edit_verification_codes')
      .select('*')
      .eq('memorial_id', memorial.id)
      .eq('code', code)
      .is('used_at', null)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 })
    }

    // Mark code as used
    await supabase
      .from('edit_verification_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', verification.id)

    // Generate a session token for this edit session (valid for 2 hours)
    const sessionToken = generateSessionToken()
    const sessionExpires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

    // Store session token in the verification table
    // We store the full token (hashed first 32 chars) for validation
    const { error: sessionInsertError } = await supabase
      .from('edit_verification_codes')
      .insert({
        memorial_id: memorial.id,
        code: `SESSION:${sessionToken}`, // Store full session token
        email: verification.email,
        expires_at: sessionExpires.toISOString(),
      })

    if (sessionInsertError) {
      console.error('Failed to create session:', sessionInsertError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: sessionExpires.toISOString(),
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
