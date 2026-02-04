import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Pipedream webhook URL for commission emails (separate workflow)
const PIPEDREAM_COMMISSION_WEBHOOK_URL = process.env.PIPEDREAM_COMMISSION_WEBHOOK_URL

// Helper to check admin session from request
function checkAdminSession(request: NextRequest): boolean {
  const session = request.cookies.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  if (!correctPassword || !session) {
    return false
  }
  return session === correctPassword
}

// PATCH - Approve or cancel individual commission
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { id } = params
  const body = await request.json()
  const { action, reason } = body // action: 'approve' | 'cancel'

  try {
    // Get the commission
    const { data: commission, error: fetchError } = await supabase
      .from('partner_commissions')
      .select('*, partner:partners(id, partner_name, contact_email)')
      .eq('id', id)
      .single()

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    if (action === 'approve') {
      if (commission.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending commissions can be approved' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabase
        .from('partner_commissions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Send email notification to partner
      if (PIPEDREAM_COMMISSION_WEBHOOK_URL && commission.partner?.contact_email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'
        try {
          await fetch(PIPEDREAM_COMMISSION_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'commission_approved',
              to: commission.partner.contact_email,
              data: {
                partner_name: commission.partner.partner_name,
                approved_amount: Number(commission.commission_amount),
                commission_count: 1,
                dashboard_url: `${baseUrl}/partner/commissions`
              }
            })
          })
        } catch (emailError) {
          console.error('Failed to send commission approval email:', emailError)
        }
      }

      return NextResponse.json({ success: true, message: 'Commission approved' })
    }

    if (action === 'cancel') {
      if (commission.status === 'paid') {
        return NextResponse.json(
          { error: 'Paid commissions cannot be cancelled' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabase
        .from('partner_commissions')
        .update({
          status: 'cancelled',
        })
        .eq('id', id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true, message: 'Commission cancelled' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json(
      { error: 'Failed to update commission' },
      { status: 500 }
    )
  }
}

// GET - Get single commission details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await checkAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { id } = params

  try {
    const { data: commission, error } = await supabase
      .from('partner_commissions')
      .select(`
        *,
        partner:partners(id, partner_name, contact_email, bank_account_name, bank_account_number, bank_name),
        order:orders(order_number, total_amount, product_type, hosting_duration),
        referral_code:referral_codes(code, discount_percent, commission_percent)
      `)
      .eq('id', id)
      .single()

    if (error || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    return NextResponse.json({ commission })
  } catch (error) {
    console.error('Error fetching commission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commission' },
      { status: 500 }
    )
  }
}
