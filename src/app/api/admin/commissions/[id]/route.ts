import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Pipedream webhook URL
const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL || 'https://eo7epxu5aypc0vj.m.pipedream.net'

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
