import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

type Partner = Database['public']['Tables']['partners']['Row']
type ReferralCode = Database['public']['Tables']['referral_codes']['Row']

// Helper to get authenticated partner
async function getAuthenticatedPartner(): Promise<Partner | null> {
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
    .single() as { data: { partner_id: string; expires_at: string } | null }

  if (!session || new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('id', session.partner_id)
    .eq('is_active', true)
    .single() as { data: Partner | null }

  return partner
}

// GET - List referral codes for partner
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
    const status = searchParams.get('status') // 'all', 'available', 'used'

    let query = supabase
      .from('referral_codes')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    if (status === 'available') {
      query = query.eq('is_used', false)
    } else if (status === 'used') {
      query = query.eq('is_used', true)
    }

    const { data: codes, error } = await query as { data: ReferralCode[] | null, error: any }

    if (error) {
      throw error
    }

    // Get batch summary
    const batches: Record<string, {
      batch_id: string
      batch_name: string | null
      total: number
      used: number
      available: number
      discount_percent: number
      commission_percent: number
      free_shipping: boolean
      created_at: string
    }> = {}

    codes?.forEach(code => {
      const batchId = code.batch_id || 'unbatched'
      if (!batches[batchId]) {
        batches[batchId] = {
          batch_id: batchId,
          batch_name: code.batch_name,
          total: 0,
          used: 0,
          available: 0,
          discount_percent: code.discount_percent,
          commission_percent: code.commission_percent,
          free_shipping: code.free_shipping,
          created_at: code.created_at,
        }
      }
      batches[batchId].total++
      if (code.is_used) {
        batches[batchId].used++
      } else {
        batches[batchId].available++
      }
    })

    // Calculate summary
    const summary = {
      total: codes?.length || 0,
      available: codes?.filter(c => !c.is_used).length || 0,
      used: codes?.filter(c => c.is_used).length || 0,
    }

    return NextResponse.json({
      codes: codes || [],
      batches: Object.values(batches).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      summary,
    })

  } catch (error) {
    console.error('List referral codes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral codes' },
      { status: 500 }
    )
  }
}
