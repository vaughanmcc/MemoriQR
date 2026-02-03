import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TOTAL_DAYS_BEFORE_DELETION } from '@/lib/pricing'

// This endpoint should be called by Vercel Cron daily
// It deletes memorials that are past the grace period + preservation period (44 days)
// Secured by CRON_SECRET environment variable

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel Pro sends Authorization header automatically)
  // On Hobby plan, we check if request comes from Vercel's cron system
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const userAgent = request.headers.get('user-agent') || ''
  const isVercelCron = userAgent.includes('vercel-cron')

  // Allow if: no secret configured, OR header matches, OR it's Vercel's cron user-agent
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
    console.log('Cron auth failed:', { authHeader: authHeader?.substring(0, 20), isVercelCron })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  
  // Calculate the cutoff date (44 days ago)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - TOTAL_DAYS_BEFORE_DELETION)

// Type for memorial records for deletion
interface MemorialForDeletion {
  id: string
  memorial_slug: string
  deceased_name: string
  hosting_expires_at: string
  photos_json: { url?: string }[] | null
  videos_json: { url?: string }[] | null
  customers: { email: string } | null
}

  const results = {
    memorials_checked: 0,
    memorials_deleted: 0,
    photos_deleted: 0,
    videos_deleted: 0,
    errors: [] as string[],
  }

  try {
    // Find memorials ready for deletion
    // hosting_expires_at + 44 days < now
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: fetchError } = await (supabase as any)
      .from('memorial_records')
      .select(`
        id,
        memorial_slug,
        deceased_name,
        hosting_expires_at,
        photos_json,
        videos_json,
        customers(email)
      `)
      .neq('hosting_duration', 999) // Exclude lifetime
      .lt('hosting_expires_at', cutoffDate.toISOString())
    
    const memorialsToDelete = data as MemorialForDeletion[] | null

    if (fetchError) {
      console.error('Failed to fetch memorials for deletion:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    results.memorials_checked = memorialsToDelete?.length || 0

    for (const memorial of memorialsToDelete || []) {
      try {
        const photos = memorial.photos_json || []
        const videos = memorial.videos_json || []
        const customerEmail = memorial.customers?.email

        // Log deletion before removing (table from migration 023)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('memorial_deletion_log').insert({
          memorial_id: memorial.id,
          memorial_slug: memorial.memorial_slug,
          deceased_name: memorial.deceased_name,
          customer_email: customerEmail || null,
          hosting_expired_at: memorial.hosting_expires_at,
          grace_period_ended_at: new Date(
            new Date(memorial.hosting_expires_at).getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          deletion_reason: 'expiry',
          photos_count: photos.length,
          videos_count: videos.length,
        })

        // Delete photos from storage
        for (const photo of photos) {
          if (photo.url) {
            try {
              // Extract path from URL
              const url = new URL(photo.url)
              const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/memorial-photos\/(.+)/)
              if (pathMatch) {
                await supabase.storage.from('memorial-photos').remove([pathMatch[1]])
                results.photos_deleted++
              }
            } catch {
              // Continue even if photo deletion fails
            }
          }
        }

        // Delete videos from storage
        for (const video of videos) {
          if (video.url) {
            try {
              const url = new URL(video.url)
              const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/memorial-videos\/(.+)/)
              if (pathMatch) {
                await supabase.storage.from('memorial-videos').remove([pathMatch[1]])
                results.videos_deleted++
              }
            } catch {
              // Continue even if video deletion fails
            }
          }
        }

        // Delete the memorial record
        // This will cascade delete:
        // - activity_log entries
        // - memorial_upgrades
        // - expiry_reminder_log
        // - memorial_renewals
        const { error: deleteError } = await supabase
          .from('memorial_records')
          .delete()
          .eq('id', memorial.id)

        if (deleteError) {
          results.errors.push(`Failed to delete ${memorial.memorial_slug}: ${deleteError.message}`)
        } else {
          results.memorials_deleted++
          console.log(`Deleted expired memorial: ${memorial.memorial_slug}`)
        }
      } catch (err) {
        console.error(`Error deleting memorial ${memorial.memorial_slug}:`, err)
        results.errors.push(`Error processing ${memorial.memorial_slug}: ${err}`)
      }
    }

    console.log('Data cleanup completed:', results)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Cron data-cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
