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
  contact_phone: string | null
  payout_email: string | null
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  website: string | null
  address: Record<string, string> | null
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
    .select('id, partner_name, contact_email, contact_phone, payout_email, bank_name, bank_account_name, bank_account_number, website, address, is_active')
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

  // Parse partner name to extract business name and contact name
  const partnerName = partner.partner_name || ''
  const contactNameMatch = partnerName.match(/\(([^)]+)\)/)
  const contactName = contactNameMatch?.[1] || ''
  const businessName = partnerName.replace(/\s*\([^)]+\)\s*$/, '')

  return NextResponse.json({
    settings: {
      id: partner.id,
      partner_name: partner.partner_name,
      business_name: businessName,
      contact_name: contactName,
      contact_email: partner.contact_email,
      contact_phone: partner.contact_phone,
      payout_email: partner.payout_email,
      bank_name: partner.bank_name,
      bank_account_name: partner.bank_account_name,
      bank_account_number: partner.bank_account_number,
      website: partner.website,
      address: partner.address,
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
    const { 
      business_name,
      contact_name,
      contact_phone,
      payout_email, 
      bank_name, 
      bank_account_name, 
      bank_account_number,
      website,
      address
    } = body

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

    const updateData: Record<string, unknown> = {}
    
    // Update partner name if business or contact name changed
    if (business_name !== undefined || contact_name !== undefined) {
      const newBusinessName = business_name ?? partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') ?? ''
      const newContactName = contact_name ?? partner.partner_name?.match(/\(([^)]+)\)/)?.[1] ?? ''
      updateData.partner_name = newContactName ? `${newBusinessName} (${newContactName})` : newBusinessName
    }

    // Only update fields that were provided
    if (contact_phone !== undefined) {
      updateData.contact_phone = contact_phone || null
    }
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
    if (website !== undefined) {
      updateData.website = website || null
    }
    if (address !== undefined) {
      updateData.address = address || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: 'No changes to save' })
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
