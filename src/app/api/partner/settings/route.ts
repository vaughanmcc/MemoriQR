import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

interface PartnerSession {
  partner_id: string
  expires_at: string
}

interface Partner {
  id: string
  partner_name: string | null
  contact_email: string | null
  payout_email: string | null
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  is_active: boolean
}

// Helper to get authenticated partner
async function getAuthenticatedPartner(): Promise<Partner | null> {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('partner_session')?.value

  if (!sessionToken) {
    return null
  }

  const supabase = createAdminClient()

  const { data: sessionData } = await supabase
    .from('partner_sessions')
    .select('partner_id, expires_at')
    .eq('session_token', sessionToken)
    .single()

  if (!sessionData) return null
  
  const session = sessionData as unknown as PartnerSession
  if (new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: partnerData } = await supabase
    .from('partners')
    .select('id, partner_name, contact_email, payout_email, bank_name, bank_account_name, bank_account_number, is_active')
    .eq('id', session.partner_id)
    .eq('is_active', true)
    .single()

  return partnerData as unknown as Partner | null
}

// GET - Get partner settings
export async function GET() {
  const partner = await getAuthenticatedPartner()

  if (!partner) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json({
    settings: {
      id: partner.id,
      partner_name: partner.partner_name,
      contact_email: partner.contact_email,
      payout_email: partner.payout_email,
      bank_name: partner.bank_name,
      bank_account_name: partner.bank_account_name,
      bank_account_number: partner.bank_account_number,
    },
  })
}

// PUT - Update partner settings
export async function PUT(request: NextRequest) {
  const partner = await getAuthenticatedPartner()

  if (!partner) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { payout_email, bank_name, bank_account_name, bank_account_number } = body

    // Basic validation for bank account number (NZ format)
    if (bank_account_number) {
      // Remove formatting for validation
      const cleanNumber = bank_account_number.replace(/\D/g, '')
      if (cleanNumber.length < 15 || cleanNumber.length > 16) {
        return NextResponse.json(
          { error: 'Invalid bank account number format. Please use NZ format: XX-XXXX-XXXXXXX-XXX' },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient()

    const updateData: Record<string, string | null> = {}
    
    // Only update fields that were provided
    if (payout_email !== undefined) {
      updateData.payout_email = payout_email || null
    }
    if (bank_name !== undefined) {
      updateData.bank_name = bank_name || null
    }
    if (bank_account_name !== undefined) {
      updateData.bank_account_name = bank_account_name || null
    }
    if (bank_account_number !== undefined) {
      // Store the formatted version
      updateData.bank_account_number = bank_account_number || null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from('partners') as any)
      .update(updateData)
      .eq('id', partner.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: 'Settings updated' })
  } catch (error) {
    console.error('Error updating partner settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
