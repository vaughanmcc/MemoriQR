import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

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

// Get partner dashboard stats
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

    // Get activation codes stats
    const { data: codesData } = await supabase
      .from('retail_activation_codes')
      .select('activation_code, is_used, used_at, product_type, hosting_duration, created_at')
      .eq('partner_id', partner.id)

    const totalCodes = codesData?.length || 0
    const usedCodes = codesData?.filter(c => c.is_used).length || 0
    const availableCodes = totalCodes - usedCodes

    // Get commissions
    const { data: commissionsData } = await supabase
      .from('partner_commissions')
      .select('*')
      .eq('partner_id', partner.id)

    const totalEarned = commissionsData?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0
    const pendingCommission = commissionsData?.filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0
    const paidCommission = commissionsData?.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0

    // Get recent activations (last 30 days) - now uses referral codes instead
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get referral codes for this partner
    const { data: referralCodesData } = await supabase
      .from('referral_codes')
      .select('code, is_used, used_at')
      .eq('partner_id', partner.id)

    const recentActivations = referralCodesData?.filter(c => 
      c.is_used && c.used_at && new Date(c.used_at) > thirtyDaysAgo
    ).length || 0

    // Get code batches
    const { data: batchesData } = await supabase
      .from('code_batches')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent commissions
    const { data: recentCommissions } = await supabase
      .from('partner_commissions')
      .select(`
        *,
        memorial:memorial_records(deceased_name, deceased_type)
      `)
      .eq('partner_id', partner.id)
      .order('earned_at', { ascending: false })
      .limit(10)

    // Monthly breakdown for chart
    const monthlyStats = getMonthlyStats(commissionsData || [])

    // Check if partner has banking details
    const hasBankingDetails = !!(partner.bank_name && partner.bank_account_name && partner.bank_account_number)

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.partner_name,
        type: partner.partner_type,
        email: partner.contact_email,
        commissionRate: partner.default_commission_percent ?? partner.commission_rate ?? 15,
        discountPercent: partner.default_discount_percent ?? 0,
        freeShipping: partner.default_free_shipping ?? false,
        hasBankingDetails
      },
      stats: {
        totalCodes,
        usedCodes,
        availableCodes,
        totalEarned,
        pendingCommission,
        paidCommission,
        recentActivations
      },
      recentBatches: batchesData || [],
      recentCommissions: recentCommissions || [],
      monthlyStats
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

function getMonthlyStats(commissions: any[]) {
  const months: { [key: string]: { activations: number; commission: number } } = {}

  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months[key] = { activations: 0, commission: 0 }
  }

  // Fill in data
  commissions.forEach(c => {
    const date = new Date(c.earned_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (months[key]) {
      months[key].activations++
      months[key].commission += Number(c.commission_amount)
    }
  })

  return Object.entries(months).map(([month, data]) => ({
    month,
    label: new Date(month + '-01').toLocaleString('en-NZ', { month: 'short', year: 'numeric' }),
    ...data
  }))
}
