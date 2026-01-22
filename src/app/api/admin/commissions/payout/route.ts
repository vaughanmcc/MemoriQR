import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

// Pipedream webhook URL for emails
const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL || 'https://eo7epxu5aypc0vj.m.pipedream.net'

// Helper to check admin session
async function checkAdminSession() {
  const cookieStore = cookies()
  const session = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  if (!correctPassword || !session) {
    return false
  }
  return session === correctPassword
}

// Helper to generate payout number
function generatePayoutNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PAY-${year}${month}-${random}`
}

interface Commission {
  id: string
  commission_amount: number
  order_total: number | null
  order_value: number
  earned_at: string
}

interface Partner {
  id: string
  partner_name: string | null
  contact_email: string | null
  payout_email: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_name: string | null
}

// POST - Create a payout for a partner (mark approved commissions as paid)
export async function POST(request: NextRequest) {
  if (!await checkAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const body = await request.json()
  const { partnerId, commissionIds, paymentReference, notes } = body

  if (!partnerId) {
    return NextResponse.json({ error: 'Partner ID required' }, { status: 400 })
  }

  try {
    // Get the partner info
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email, payout_email, bank_account_name, bank_account_number, bank_name')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partnerData) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const partner = partnerData as unknown as Partner

    // Get approved commissions for this partner
    let commissionsQuery = supabase
      .from('partner_commissions')
      .select('id, commission_amount, order_total, order_value, earned_at')
      .eq('partner_id', partnerId)
      .eq('status', 'approved')

    // If specific commission IDs provided, filter by those
    if (commissionIds && Array.isArray(commissionIds) && commissionIds.length > 0) {
      commissionsQuery = commissionsQuery.in('id', commissionIds)
    }

    const { data: commissionsData, error: commissionsError } = await commissionsQuery

    if (commissionsError) throw commissionsError

    if (!commissionsData || commissionsData.length === 0) {
      return NextResponse.json({ error: 'No approved commissions found' }, { status: 400 })
    }

    const commissions = commissionsData as unknown as Commission[]

    // Calculate totals
    const totalCommission = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0)
    const totalOrderValue = commissions.reduce((sum, c) => sum + Number(c.order_total || c.order_value || 0), 0)

    // Determine period range
    const earnedDates = commissions.map(c => new Date(c.earned_at))
    const periodStart = new Date(Math.min(...earnedDates.map(d => d.getTime())))
    const periodEnd = new Date(Math.max(...earnedDates.map(d => d.getTime())))

    // Create payout record
    const payoutId = randomUUID()
    const payoutNumber = generatePayoutNumber()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: payoutError } = await (supabase
      .from('partner_payouts') as any)
      .insert({
        id: payoutId,
        partner_id: partnerId,
        payout_number: payoutNumber,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        total_activations: commissions.length,
        total_order_value: totalOrderValue,
        total_commission: totalCommission,
        status: 'paid',
        payment_method: 'bank_transfer',
        payment_reference: paymentReference || null,
        notes: notes || null,
        processed_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      })

    if (payoutError) throw payoutError

    // Update all commissions to paid status
    const commissionIdsToUpdate = commissions.map(c => c.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase
      .from('partner_commissions') as any)
      .update({
        status: 'paid',
        payout_id: payoutId,
        payout_reference: payoutNumber,
        paid_at: new Date().toISOString(),
      })
      .in('id', commissionIdsToUpdate)

    if (updateError) throw updateError

    // Send payout statement email
    const payoutEmail = partner.payout_email || partner.contact_email
    if (payoutEmail) {
      try {
        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'commission_payout_statement',
            partner_name: partner.partner_name || 'Partner',
            partner_email: payoutEmail,
            payout_number: payoutNumber,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            total_commissions: commissions.length,
            total_amount: totalCommission.toFixed(2),
            payment_reference: paymentReference || 'N/A',
            bank_name: partner.bank_name || 'On file',
            bank_account_last4: partner.bank_account_number 
              ? partner.bank_account_number.slice(-4) 
              : 'XXXX',
          }),
        })
      } catch (emailError) {
        console.error('Failed to send payout email:', emailError)
        // Don't fail the whole operation for email errors
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payout ${payoutNumber} created for ${commissions.length} commissions`,
      payout: {
        id: payoutId,
        payout_number: payoutNumber,
        total_commission: totalCommission,
        commission_count: commissions.length,
      },
    })
  } catch (error) {
    console.error('Error creating payout:', error)
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    )
  }
}

// GET - List all payouts
export async function GET(request: NextRequest) {
  if (!await checkAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const partnerId = searchParams.get('partner_id')

  try {
    let query = supabase
      .from('partner_payouts')
      .select(`
        *,
        partner:partners(id, partner_name, contact_email)
      `)
      .order('created_at', { ascending: false })

    if (partnerId) {
      query = query.eq('partner_id', partnerId)
    }

    const { data: payouts, error } = await query

    if (error) throw error

    return NextResponse.json({ payouts: payouts || [] })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}
