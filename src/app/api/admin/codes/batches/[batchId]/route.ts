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

// GET - Get all codes in a specific batch
export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { batchId } = params

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: codes, error } = await (supabase as any)
      .from('retail_activation_codes')
      .select('activation_code, product_type, hosting_duration, is_used, used_at, created_at')
      .eq('generation_batch_id', batchId)
      .order('activation_code', { ascending: true })

    if (error) {
      console.error('Error fetching batch codes:', error)
      return NextResponse.json({ error: 'Failed to fetch batch codes' }, { status: 500 })
    }

    return NextResponse.json({ codes: codes || [] })

  } catch (error) {
    console.error('Get batch codes error:', error)
    return NextResponse.json({ error: 'Failed to get batch codes' }, { status: 500 })
  }
}
