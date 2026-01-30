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

// GET - List activation codes with optional filters
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, unused, used
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createAdminClient()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('retail_activation_codes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter
    if (search) {
      query = query.ilike('activation_code', `%${search}%`)
    }

    // Apply status filter
    if (status === 'unused') {
      query = query.eq('is_used', false)
    } else if (status === 'used') {
      query = query.eq('is_used', true)
    } else if (status === 'unassigned') {
      query = query.is('partner_id', null)
    }

    const { data: codes, error, count } = await query

    if (error) {
      console.error('Error fetching codes:', error)
      return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 })
    }

    return NextResponse.json({
      codes,
      total: count,
      limit,
      offset
    })

  } catch (error) {
    console.error('List codes error:', error)
    return NextResponse.json({ error: 'Failed to list codes' }, { status: 500 })
  }
}

// DELETE - Delete/invalidate codes
export async function DELETE(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { codes } = await request.json()

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: 'No codes provided' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if any codes are already used
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingCodes } = await (supabase as any)
      .from('retail_activation_codes')
      .select('activation_code, is_used, memorial_id')
      .in('activation_code', codes)

    const usedCodes = existingCodes?.filter((c: { is_used: boolean }) => c.is_used) || []
    if (usedCodes.length > 0) {
      return NextResponse.json({
        error: `Cannot delete ${usedCodes.length} code(s) that have already been used`,
        usedCodes: usedCodes.map((c: { activation_code: string }) => c.activation_code)
      }, { status: 400 })
    }

    // Delete unused codes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError, count } = await (supabase as any)
      .from('retail_activation_codes')
      .delete()
      .in('activation_code', codes)
      .eq('is_used', false)

    if (deleteError) {
      console.error('Error deleting codes:', deleteError)
      return NextResponse.json({ error: 'Failed to delete codes' }, { status: 500 })
    }

    console.log(`Deleted ${count} activation codes`)

    return NextResponse.json({
      success: true,
      deleted: count
    })

  } catch (error) {
    console.error('Delete codes error:', error)
    return NextResponse.json({ error: 'Failed to delete codes' }, { status: 500 })
  }
}
