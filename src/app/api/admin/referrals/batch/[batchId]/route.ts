import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Verify admin session
async function verifyAdmin() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  return !!correctPassword && sessionToken === correctPassword
}

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { batchId } = params

  const supabase = createAdminClient()

  const { data: codes, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('batch_id', batchId)
    .order('code', { ascending: true })

  if (error) {
    console.error('Error fetching batch codes:', error)
    return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 })
  }

  return NextResponse.json({ codes })
}
