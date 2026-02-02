import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { MemorialPage } from '@/components/memorial/MemorialPage'
import { GRACE_PERIOD_DAYS, DATA_PRESERVATION_DAYS } from '@/lib/pricing'
import Link from 'next/link'

// Disable caching so edits appear immediately
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: memorial } = await supabase
    .from('memorial_records')
    .select('deceased_name, deceased_type, memorial_text')
    .eq('memorial_slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!memorial) {
    return {
      title: 'Memorial Not Found',
    }
  }

  const description = memorial.memorial_text 
    ? memorial.memorial_text.substring(0, 160)
    : `A loving memorial for ${memorial.deceased_name}`

  return {
    title: `In Memory of ${memorial.deceased_name}`,
    description,
    openGraph: {
      title: `In Memory of ${memorial.deceased_name}`,
      description,
      type: 'article',
    },
    robots: {
      index: false, // Keep memorials private from search
      follow: false,
    },
  }
}

// Calculate memorial hosting status
function getHostingStatus(expiresAt: string | null, hostingDuration: number) {
  // Lifetime memorials never expire
  if (hostingDuration === 999 || !expiresAt) {
    return { status: 'active' as const, daysRemaining: null, isEditable: true }
  }

  const now = new Date()
  const expiry = new Date(expiresAt)
  const gracePeriodEnd = new Date(expiry.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
  const dataPreservationEnd = new Date(gracePeriodEnd.getTime() + DATA_PRESERVATION_DAYS * 24 * 60 * 60 * 1000)
  
  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / msPerDay)
  const daysIntoGrace = Math.ceil((now.getTime() - expiry.getTime()) / msPerDay)
  const daysUntilDeletion = Math.ceil((dataPreservationEnd.getTime() - now.getTime()) / msPerDay)

  if (now < expiry) {
    // Still active
    return { 
      status: 'active' as const, 
      daysRemaining: daysUntilExpiry, 
      isEditable: true 
    }
  } else if (now < gracePeriodEnd) {
    // In grace period - viewable but not editable
    return { 
      status: 'grace_period' as const, 
      daysRemaining: GRACE_PERIOD_DAYS - daysIntoGrace,
      daysUntilDeletion,
      isEditable: false 
    }
  } else if (now < dataPreservationEnd) {
    // Past grace period - offline, data preserved
    return { 
      status: 'offline' as const, 
      daysRemaining: 0,
      daysUntilDeletion,
      isEditable: false 
    }
  } else {
    // Should be deleted
    return { 
      status: 'expired' as const, 
      daysRemaining: 0, 
      isEditable: false 
    }
  }
}

export default async function MemorialPageRoute({ params }: Props) {
  const supabase = createClient()

  // Fetch memorial data
  const { data: memorial, error } = await supabase
    .from('memorial_records')
    .select('*')
    .eq('memorial_slug', params.slug)
    .single()

  if (error || !memorial) {
    notFound()
  }

  // Check if memorial is published and hosting is active
  if (!memorial.is_published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-gray-900 mb-4">
            Memorial In Progress
          </h1>
          <p className="text-gray-600">
            This memorial is still being set up. Please check back soon.
          </p>
        </div>
      </div>
    )
  }

  // Check hosting status
  const hostingStatus = getHostingStatus(memorial.hosting_expires_at, memorial.hosting_duration)

  // Memorial is offline (past grace period)
  if (hostingStatus.status === 'offline') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-gray-900 mb-4">
            Memorial Offline
          </h1>
          <p className="text-gray-600 mb-2">
            This memorial&apos;s hosting period has ended.
          </p>
          {hostingStatus.daysUntilDeletion && hostingStatus.daysUntilDeletion > 0 && (
            <p className="text-amber-600 text-sm mb-6">
              Data will be permanently deleted in {hostingStatus.daysUntilDeletion} days if not renewed.
            </p>
          )}
          <p className="text-gray-600 mb-6">
            If you&apos;re the owner, you can renew the hosting to restore access.
          </p>
          <Link 
            href={`/renew?slug=${memorial.memorial_slug}`} 
            className="btn-primary"
          >
            Renew Hosting
          </Link>
        </div>
      </div>
    )
  }

  // Memorial is fully expired (should not reach here as cleanup cron should delete)
  if (hostingStatus.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-gray-900 mb-4">
            Memorial No Longer Available
          </h1>
          <p className="text-gray-600 mb-6">
            This memorial is no longer available. The hosting period has ended 
            and the data has been removed.
          </p>
          <Link href="/" className="btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  // Increment view count - use admin client for permissions
  const adminSupabase = createAdminClient()
  await adminSupabase.rpc('increment_memorial_views', { slug: params.slug })

  // Pass hosting status to the memorial page for grace period banner
  return (
    <MemorialPage 
      memorial={memorial} 
      isInGracePeriod={hostingStatus.status === 'grace_period'}
      gracePeriodDaysRemaining={hostingStatus.status === 'grace_period' ? hostingStatus.daysRemaining : undefined}
      isEditable={hostingStatus.isEditable}
    />
  )
}
