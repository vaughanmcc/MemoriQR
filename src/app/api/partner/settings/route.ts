import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// Pipedream webhook URL for security change notifications
const PIPEDREAM_SECURITY_WEBHOOK_URL = process.env.PIPEDREAM_SECURITY_WEBHOOK_URL

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
  notify_referral_redemption: boolean
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
    .select('id, partner_name, contact_email, contact_phone, payout_email, bank_name, bank_account_name, bank_account_number, website, address, is_active, notify_referral_redemption')
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

  const supabase = createAdminClient()

  // Check if partner has any trusted device sessions
  const { data: trustedSessions } = await supabase
    .from('partner_sessions')
    .select('id')
    .eq('partner_id', partner.id)
    .eq('is_trusted_device', true)
    .gt('expires_at', new Date().toISOString())

  const hasTrustedSessions = (trustedSessions?.length || 0) > 0

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
      notify_referral_redemption: partner.notify_referral_redemption ?? true,
    },
    hasTrustedSessions,
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
      address,
      notify_referral_redemption
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
    const securityChanges: Array<{ type: string; description: string }> = []
    
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
    
    // Track security-sensitive changes
    if (payout_email !== undefined && payout_email !== partner.payout_email) {
      updateData.payout_email = payout_email || null
      if (partner.payout_email) {
        securityChanges.push({
          type: 'payout_email',
          description: `Payout email changed from ${partner.payout_email} to ${payout_email || '(removed)'}`
        })
      }
    }
    
    if (bank_name !== undefined) {
      updateData.bank_name = bank_name || null
    }
    if (bank_account_name !== undefined) {
      updateData.bank_account_name = bank_account_name || null
    }
    
    // Track bank account number changes (security sensitive)
    if (bank_account_number !== undefined && bank_account_number !== partner.bank_account_number) {
      updateData.bank_account_number = bank_account_number || null
      if (partner.bank_account_number) {
        const oldLast4 = partner.bank_account_number.replace(/\D/g, '').slice(-4)
        const newLast4 = bank_account_number ? bank_account_number.replace(/\D/g, '').slice(-4) : 'none'
        securityChanges.push({
          type: 'bank_account',
          description: `Bank account changed from ****${oldLast4} to ****${newLast4}`
        })
      } else if (bank_account_number) {
        securityChanges.push({
          type: 'bank_account',
          description: 'Bank account number added'
        })
      }
    }
    
    if (website !== undefined) {
      updateData.website = website || null
    }
    if (address !== undefined) {
      updateData.address = address || null
    }
    if (notify_referral_redemption !== undefined) {
      updateData.notify_referral_redemption = notify_referral_redemption
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

    // Send security notification emails for sensitive changes
    if (securityChanges.length > 0) {
      const headersList = headers()
      const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'Unknown'
      const userAgent = headersList.get('user-agent') || 'Unknown'
      const partnerName = partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner'
      
      // Log security changes to audit table
      for (const change of securityChanges) {
        try {
          await supabase
            .from('partner_security_audit')
            .insert({
              partner_id: partner.id,
              change_type: change.type,
              change_description: change.description,
              ip_address: ipAddress,
              user_agent: userAgent
            })
        } catch (auditError) {
          console.error('Failed to log security audit:', auditError)
        }
      }
      
      // Send email notifications
      if (PIPEDREAM_SECURITY_WEBHOOK_URL && partner.contact_email) {
        for (const change of securityChanges) {
          try {
            await fetch(PIPEDREAM_SECURITY_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'security_change',
                to: partner.contact_email,
                data: {
                  partner_name: partnerName,
                  change_type: change.type,
                  change_description: change.description,
                  changed_at: new Date().toISOString(),
                  ip_address: ipAddress
                }
              })
            })
          } catch (emailError) {
            console.error('Failed to send security change notification:', emailError)
          }
        }
      }
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
