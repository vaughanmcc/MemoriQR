import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Pipedream webhook URL for emails
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
