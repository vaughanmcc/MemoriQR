import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Pipedream webhook URL for emails
const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL

// Helper to check admin session from request
function checkAdminSession(request: NextRequest): boolean {
  const session = request.cookies.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  if (!correctPassword || !session) {
    return false
  }
  return session === correctPassword
}

// POST - Bulk approve commissions
export async function POST(request: NextRequest) {
  if (!checkAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const body = await request.json()
  const { commissionIds } = body // Array of commission IDs to approve

  if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
    return NextResponse.json({ error: 'No commission IDs provided' }, { status: 400 })
  }

  try {
    // Get commission details before updating (to send notifications)
    const { data: commissionsToApprove } = await supabase
      .from('partner_commissions')
      .select(`
        id,
        commission_amount,
        partner_id,
        partners:partner_id (
          id,
          partner_name,
          contact_email
        )
      `)
      .in('id', commissionIds)
      .eq('status', 'pending')

    const { data, error } = await supabase
      .from('partner_commissions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .in('id', commissionIds)
      .eq('status', 'pending')
      .select()

    if (error) throw error

    // Send notification emails to partners
    if (PIPEDREAM_WEBHOOK_URL && commissionsToApprove && commissionsToApprove.length > 0) {
      // Group commissions by partner
      const partnerCommissions = new Map<string, { partner: any, totalAmount: number, count: number }>()
      
      for (const commission of commissionsToApprove) {
        const partner = commission.partners as any
        if (!partner?.contact_email) continue
        
        const existing = partnerCommissions.get(partner.id)
        if (existing) {
          existing.totalAmount += Number(commission.commission_amount)
          existing.count += 1
        } else {
          partnerCommissions.set(partner.id, {
            partner,
            totalAmount: Number(commission.commission_amount),
            count: 1
          })
        }
      }

      // Send one email per partner
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
      
      for (const [, { partner, totalAmount, count }] of partnerCommissions) {
        const businessName = partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner'
        
        try {
          await fetch(PIPEDREAM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'commission_approved',
              to: partner.contact_email,
              businessName,
              commissionCount: count,
              totalAmount: totalAmount.toFixed(2),
              dashboardUrl: `${baseUrl}/partner/dashboard`,
            }),
          })
        } catch (emailError) {
          console.error(`Failed to send commission approved email to ${partner.contact_email}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} commissions approved`,
      approved: data?.length || 0,
    })
  } catch (error) {
    console.error('Error bulk approving commissions:', error)
    return NextResponse.json(
      { error: 'Failed to approve commissions' },
      { status: 500 }
    )
  }
}
