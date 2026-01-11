import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MemorialPage } from '@/components/memorial/MemorialPage'

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

  if (!memorial.is_hosting_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-gray-900 mb-4">
            Hosting Expired
          </h1>
          <p className="text-gray-600 mb-6">
            This memorial's hosting period has ended. If you're the owner, 
            you can renew the hosting to restore access.
          </p>
          <a href="/renew" className="btn-primary">
            Renew Hosting
          </a>
        </div>
      </div>
    )
  }

  // Increment view count (fire and forget)
  supabase.rpc('increment_memorial_views', { slug: params.slug })

  return <MemorialPage memorial={memorial} />
}
