import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// Check admin authentication
async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  return !!correctPassword && session === correctPassword
}

// GET - List all partner batch requests
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all', 'pending', 'approved', 'generated', 'shipped', 'cancelled'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('code_batches')
      .select(`
        *,
        partner:partners(id, partner_name, contact_email)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: batches, error } = await query

    if (error) {
      console.error('Error fetching batches:', error)
      return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
    }

    return NextResponse.json({
      batches: batches || [],
      summary: {
        total: batches?.length || 0,
        pending: batches?.filter((b: { status: string }) => b.status === 'pending').length || 0,
        approved: batches?.filter((b: { status: string }) => b.status === 'approved').length || 0,
        generated: batches?.filter((b: { status: string }) => b.status === 'generated').length || 0,
      }
    })
  } catch (error) {
    console.error('Error in batch list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
