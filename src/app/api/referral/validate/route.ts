import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST - Validate a referral code and return discount info
export async function POST(request: NextRequest) {
  try {
    const { referralCode } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ valid: false, error: 'Referral code is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Look up the referral code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: code, error } = await (supabase as any)
      .from('referral_codes')
      .select(`
        id,
        code,
        partner_id,
        discount_percent,
        free_shipping,
        is_used,
        expires_at,
        partners(partner_name)
      `)
      .eq('code', referralCode.toUpperCase().trim())
      .single()

    if (error || !code) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid referral code' 
      })
    }

    // Check if already used
    if (code.is_used) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This referral code has already been used' 
      })
    }

    // Check if expired
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This referral code has expired' 
      })
    }

    // Valid code - return discount info
    // Extract just the business name (before the parentheses with contact name)
    const partnerName = code.partners?.partner_name?.replace(/\s*\([^)]*\)$/, '') || null
    
    return NextResponse.json({
      valid: true,
      referralCode: code.code,
      discountPercent: code.discount_percent,
      freeShipping: code.free_shipping,
      partnerName,
      message: code.discount_percent > 0 
        ? `${code.discount_percent}% discount applied${code.free_shipping ? ' + free shipping!' : '!'}`
        : code.free_shipping 
          ? 'Free shipping applied!'
          : 'Referral code applied!'
    })

  } catch (error) {
    console.error('Validate referral code error:', error)
    return NextResponse.json({ valid: false, error: 'Failed to validate code' }, { status: 500 })
  }
}

// GET - Validate via query param (for URL-based validation)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const referralCode = searchParams.get('code')

  if (!referralCode) {
    return NextResponse.json({ valid: false, error: 'Code parameter required' }, { status: 400 })
  }

  // Reuse POST logic
  const mockRequest = {
    json: async () => ({ referralCode })
  } as NextRequest

  return POST(mockRequest)
}
