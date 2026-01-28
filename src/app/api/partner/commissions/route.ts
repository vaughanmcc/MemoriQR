import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Helper to get authenticated partner
async function getAuthenticatedPartner() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('partner_session')?.value

  if (!sessionToken) {
    return null
  }

  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from('partner_sessions')
    .select('partner_id, expires_at')
    .eq('session_token', sessionToken)
    .single()

  if (!session || new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('id', session.partner_id)
    .eq('is_active', true)
    .single()

  return partner
}

// GET - List commissions for partner
export async function GET(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all', 'pending', 'paid'
    const period = searchParams.get('period') // 'all', 'month', 'year'

    let query = supabase
      .from('partner_commissions')
      .select(`
        *,
        memorial:memorial_records(deceased_name, deceased_type, species)
      `)
      .eq('partner_id', partner.id)
      .order('earned_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
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

    const { data: commissions, error } = await query

    if (error) {
      throw error
    }

    // Get payouts
    const { data: payouts } = await supabase
      .from('partner_payouts')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    // Calculate summary
    const summary = {
      totalEarned: commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0,
      pending: commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0,
      approved: commissions?.filter(c => c.status === 'approved').reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0,
      paid: commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0,
      totalActivations: commissions?.length || 0
    }

    // Monthly breakdown
    const monthlyData: { [key: string]: { activations: number; commission: number; orderValue: number } } = {}
    commissions?.forEach(c => {
      const date = new Date(c.earned_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[key]) {
        monthlyData[key] = { activations: 0, commission: 0, orderValue: 0 }
      }
      monthlyData[key].activations++
      monthlyData[key].commission += Number(c.commission_amount)
      monthlyData[key].orderValue += Number(c.order_value)
    })

    const monthlyBreakdown = Object.entries(monthlyData)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({
        month,
        label: new Date(month + '-01').toLocaleString('en-NZ', { month: 'long', year: 'numeric' }),
        ...data
      }))

    return NextResponse.json({
      commissions: commissions || [],
      payouts: payouts || [],
      summary,
      monthlyBreakdown,
      commissionRate: partner.commission_rate
    })

  } catch (error) {
    console.error('List commissions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    )
  }
}
