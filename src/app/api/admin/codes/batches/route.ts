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

// GET - List admin-generated batches
export async function GET() {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Get distinct batches with aggregated info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: codes, error } = await (supabase as any)
      .from('retail_activation_codes')
      .select('generation_batch_id, generation_batch_name, product_type, hosting_duration, is_used, created_at')
      .not('generation_batch_id', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching batches:', error)
      return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
    }

    // Group codes by batch
    const batchMap = new Map<string, {
      id: string
      name: string
      productType: string
      hostingDuration: number
      totalCodes: number
      usedCodes: number
      createdAt: string
    }>()

    for (const code of codes || []) {
      const batchId = code.generation_batch_id
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          id: batchId,
          name: code.generation_batch_name || 'Unnamed Batch',
          productType: code.product_type,
          hostingDuration: code.hosting_duration,
          totalCodes: 0,
          usedCodes: 0,
          createdAt: code.created_at,
        })
      }
      const batch = batchMap.get(batchId)!
      batch.totalCodes++
      if (code.is_used) {
        batch.usedCodes++
      }
    }

    // Convert to array and sort by createdAt
    const batches = Array.from(batchMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ batches })

  } catch (error) {
    console.error('List batches error:', error)
    return NextResponse.json({ error: 'Failed to list batches' }, { status: 500 })
  }
}

// DELETE - Delete an entire batch (only unused codes)
export async function DELETE(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { batchId } = await request.json()

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check how many codes are used in this batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: batchCodes } = await (supabase as any)
      .from('retail_activation_codes')
      .select('activation_code, is_used')
      .eq('generation_batch_id', batchId)

    if (!batchCodes || batchCodes.length === 0) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const usedCount = batchCodes.filter((c: { is_used: boolean }) => c.is_used).length
    const unusedCount = batchCodes.length - usedCount

    if (unusedCount === 0) {
      return NextResponse.json({
        error: 'All codes in this batch have been used and cannot be deleted'
      }, { status: 400 })
    }

    // Delete only unused codes from the batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError, count } = await (supabase as any)
      .from('retail_activation_codes')
      .delete()
      .eq('generation_batch_id', batchId)
      .eq('is_used', false)

    if (deleteError) {
      console.error('Error deleting batch:', deleteError)
      return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 })
    }

    console.log(`Deleted ${count} unused codes from batch ${batchId}`)

    return NextResponse.json({
      success: true,
      deleted: count,
      preserved: usedCount,
      message: usedCount > 0 
        ? `Deleted ${count} unused codes. ${usedCount} used code(s) were preserved.`
        : `Deleted all ${count} codes from the batch.`
    })

  } catch (error) {
    console.error('Delete batch error:', error)
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 })
  }
}
