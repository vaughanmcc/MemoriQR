import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

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

interface CommissionWithRelations {
  id: string
  partner_id: string
  order_id: string | null
  order_total: number | null
  order_value: number
  commission_percent: number | null
  commission_rate: number
  commission_amount: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  earned_at: string
  approved_at: string | null
  paid_at: string | null
  payout_reference: string | null
  partner: {
    id: string
    partner_name: string | null
    contact_email: string | null
    bank_account_name: string | null
    bank_account_number: string | null
    bank_name: string | null
  } | null
  order: {
    order_number: string
    customer_id: string | null
  } | null
}

// GET - List all commissions with partner info and filtering
export async function GET(request: NextRequest) {
  if (!await checkAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'all', 'pending', 'approved', 'paid', 'cancelled'
  const partnerId = searchParams.get('partner_id')
  const period = searchParams.get('period') // 'all', 'month', 'year'

  try {
    // Build query for commissions with partner info
    let query = supabase
      .from('partner_commissions')
      .select(`
        *,
        partner:partners(id, partner_name, contact_email, bank_account_name, bank_account_number, bank_name),
        order:orders(order_number, customer_id)
      `)
      .order('earned_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (partnerId) {
      query = query.eq('partner_id', partnerId)
    }

    if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte('earned_at', monthAgo.toISOString())
    } else if (period === 'year') {
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      query = query.gte('earned_at', yearAgo.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    // Cast to our interface
    const commissions = (data || []) as unknown as CommissionWithRelations[]

    // Calculate summary stats
    const summary = {
      totalCommissions: commissions.length,
      totalAmount: commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0),
      pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.commission_amount), 0),
      pendingCount: commissions.filter(c => c.status === 'pending').length,
      approved: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + Number(c.commission_amount), 0),
      approvedCount: commissions.filter(c => c.status === 'approved').length,
      paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.commission_amount), 0),
      paidCount: commissions.filter(c => c.status === 'paid').length,
    }

    // Get unique partners for filter dropdown
    const { data: partners } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email')
      .eq('is_active', true)
      .order('partner_name')

    return NextResponse.json({
      commissions,
      summary,
      partners: partners || [],
    })
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    )
  }
}
