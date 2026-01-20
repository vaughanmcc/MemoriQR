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

// Card variant configuration
const CARD_VARIANTS: Record<string, { duration: 5 | 10 | 25; product: 'nfc_only' | 'qr_only' | 'both'; price: number }> = {
  '5N':  { duration: 5,  product: 'nfc_only', price: 89 },
  '5Q':  { duration: 5,  product: 'qr_only',  price: 79 },
  '5B':  { duration: 5,  product: 'both',     price: 129 },
  '10N': { duration: 10, product: 'nfc_only', price: 149 },
  '10Q': { duration: 10, product: 'qr_only',  price: 129 },
  '10B': { duration: 10, product: 'both',     price: 199 },
  '25N': { duration: 25, product: 'nfc_only', price: 249 },
  '25Q': { duration: 25, product: 'qr_only',  price: 199 },
  '25B': { duration: 25, product: 'both',     price: 299 },
}

// Generate a 6-character alphanumeric code (excluding confusing chars)
function generateRandomPart(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded I, O, 0, 1
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Generate full activation code in format MQR-VARIANT-RANDOM
function generateActivationCode(variant: string): string {
  return `MQR-${variant}-${generateRandomPart()}`
}

export async function POST(request: NextRequest) {
  try {
    // Check admin session
    if (!await checkAdminAuth()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { variant, quantity } = await request.json()

    // Validate variant
    if (!variant || !CARD_VARIANTS[variant]) {
      return NextResponse.json(
        { error: 'Invalid card variant' },
        { status: 400 }
      )
    }

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      )
    }

    const variantConfig = CARD_VARIANTS[variant]
    const supabase = createAdminClient()

    // Generate unique codes
    const codes: string[] = []
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 3) // Retail codes expire in 3 years

    for (let i = 0; i < quantity; i++) {
      let newCode: string
      let attempts = 0
      
      // Keep generating until we get a unique code
      do {
        newCode = generateActivationCode(variant)
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

      if (attempts >= 10) {
        console.error('Failed to generate unique code after 10 attempts')
        continue
      }

      // Insert code into database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('retail_activation_codes')
        .insert({
          activation_code: newCode,
          product_type: variantConfig.product,
          hosting_duration: variantConfig.duration,
          is_used: false,
          expires_at: expiresAt.toISOString(),
        })

      if (insertError) {
        console.error('Error inserting code:', insertError)
        continue
      }

      codes.push(newCode)
    }

    if (codes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any codes' },
        { status: 500 }
      )
    }

    console.log(`Generated ${codes.length} retail activation codes for variant ${variant}`)

    return NextResponse.json({
      success: true,
      variant,
      quantity: codes.length,
      codes,
      expiresAt: expiresAt.toISOString(),
      productType: variantConfig.product,
      hostingDuration: variantConfig.duration,
      retailPrice: variantConfig.price,
    })

  } catch (error) {
    console.error('Generate codes error:', error)
    return NextResponse.json(
      { error: 'Failed to generate codes' },
      { status: 500 }
    )
  }
}
