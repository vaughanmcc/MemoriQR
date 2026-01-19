'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Partner {
  business_name: string
  contact_name: string
}

interface DownloadItem {
  id: string
  name: string
  description: string
  type: 'pdf' | 'image' | 'zip'
  size: string
  url: string
  category: 'brochures' | 'logos' | 'displays' | 'social'
}

const marketingMaterials: DownloadItem[] = [
  // Brochures
  {
    id: 'brochure-general',
    name: 'MemoriQR General Brochure',
    description: 'Overview brochure explaining how MemoriQR works, suitable for display or handout',
    type: 'pdf',
    size: '2.4 MB',
    url: '/materials/memoriqr-brochure.pdf',
    category: 'brochures'
  },
  {
    id: 'brochure-pet',
    name: 'Pet Memorial Brochure',
    description: 'Specialized brochure for pet memorials, great for veterinary clinics',
    type: 'pdf',
    size: '1.8 MB',
    url: '/materials/memoriqr-pet-brochure.pdf',
    category: 'brochures'
  },
  {
    id: 'brochure-human',
    name: 'Human Memorial Brochure',
    description: 'Brochure focused on human memorials, ideal for funeral homes',
    type: 'pdf',
    size: '2.1 MB',
    url: '/materials/memoriqr-human-brochure.pdf',
    category: 'brochures'
  },
  {
    id: 'price-list',
    name: 'Retail Price List',
    description: 'Printable price list showing all product options and pricing',
    type: 'pdf',
    size: '0.5 MB',
    url: '/materials/memoriqr-price-list.pdf',
    category: 'brochures'
  },
  // Logos
  {
    id: 'logo-full-color',
    name: 'MemoriQR Logo (Full Color)',
    description: 'Full color logo in PNG format with transparent background',
    type: 'image',
    size: '156 KB',
    url: '/materials/logos/memoriqr-logo-color.png',
    category: 'logos'
  },
  {
    id: 'logo-white',
    name: 'MemoriQR Logo (White)',
    description: 'White logo for dark backgrounds, PNG with transparent background',
    type: 'image',
    size: '142 KB',
    url: '/materials/logos/memoriqr-logo-white.png',
    category: 'logos'
  },
  {
    id: 'logo-black',
    name: 'MemoriQR Logo (Black)',
    description: 'Black logo for light backgrounds, PNG with transparent background',
    type: 'image',
    size: '138 KB',
    url: '/materials/logos/memoriqr-logo-black.png',
    category: 'logos'
  },
  {
    id: 'logo-pack',
    name: 'Complete Logo Pack',
    description: 'All logo variations in PNG, SVG, and EPS formats',
    type: 'zip',
    size: '4.2 MB',
    url: '/materials/logos/memoriqr-logo-pack.zip',
    category: 'logos'
  },
  // Display Materials
  {
    id: 'counter-display',
    name: 'Counter Display Card',
    description: 'A5 counter display card for point of sale, print-ready PDF',
    type: 'pdf',
    size: '3.8 MB',
    url: '/materials/displays/counter-display-a5.pdf',
    category: 'displays'
  },
  {
    id: 'poster-a3',
    name: 'A3 Poster',
    description: 'Large format poster for waiting rooms or display areas',
    type: 'pdf',
    size: '8.5 MB',
    url: '/materials/displays/poster-a3.pdf',
    category: 'displays'
  },
  {
    id: 'window-decal',
    name: 'Window Decal Design',
    description: 'Partner window sticker design "Official MemoriQR Partner"',
    type: 'pdf',
    size: '1.2 MB',
    url: '/materials/displays/window-decal.pdf',
    category: 'displays'
  },
  // Social Media
  {
    id: 'social-pack',
    name: 'Social Media Graphics Pack',
    description: 'Ready-to-use graphics for Facebook, Instagram, and LinkedIn',
    type: 'zip',
    size: '12.4 MB',
    url: '/materials/social/social-media-pack.zip',
    category: 'social'
  },
  {
    id: 'social-templates',
    name: 'Canva Template Links',
    description: 'Editable Canva templates for creating custom social posts',
    type: 'pdf',
    size: '0.2 MB',
    url: '/materials/social/canva-templates.pdf',
    category: 'social'
  }
]

const categories = [
  { id: 'all', label: 'All Materials', icon: '📁' },
  { id: 'brochures', label: 'Brochures & Price Lists', icon: '📄' },
  { id: 'logos', label: 'Logos & Brand Assets', icon: '🎨' },
  { id: 'displays', label: 'Display Materials', icon: '🖼️' },
  { id: 'social', label: 'Social Media', icon: '📱' }
]

export default function PartnerMaterialsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/partner/session')
        if (response.status === 401) {
          router.push('/partner')
          return
        }
        const data = await response.json()
        setPartner(data.partner)
      } catch {
        router.push('/partner')
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  const filteredMaterials = selectedCategory === 'all'
    ? marketingMaterials
    : marketingMaterials.filter(m => m.category === selectedCategory)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zm-3 0a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zm1.5.5h1.5a.5.5 0 010 1H9.5v.75h1a.5.5 0 010 1h-1V17a.5.5 0 01-1 0v-2.5a.5.5 0 01.5-.5z"/>
          </svg>
        )
      case 'image':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'zip':
        return (
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        )
      default:
        return null
    }
  }

  const handleDownload = (item: DownloadItem) => {
    // In production, these would be actual file downloads
    // For now, show an alert
    alert(`Download: ${item.name}\n\nIn production, this would download: ${item.url}`)
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="text-sm mb-4">
              <Link href="/partner/dashboard" className="text-emerald-600 hover:text-emerald-700">
                ← Back to Dashboard
              </Link>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Materials</h1>
            <p className="text-gray-600 mt-2">
              Download brochures, logos, and promotional materials for your business
            </p>
          </div>

          {/* Partner Badge */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Official Partner</p>
                <h2 className="text-xl font-bold">{partner?.business_name}</h2>
                <p className="text-emerald-100 text-sm">{partner?.contact_name}</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Materials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase">
                          {item.type} • {item.size}
                        </span>
                        <button
                          onClick={() => handleDownload(item)}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Materials Request */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Custom Materials?</h3>
                <p className="text-gray-600">
                  We can create co-branded materials featuring your business logo and contact information. 
                  Contact us to discuss your requirements.
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="mailto:partners@memoriqr.co.nz?subject=Custom Marketing Materials Request"
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>

          {/* Brand Guidelines */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Brand Usage Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Use the provided logos without modification</li>
              <li>✓ Maintain clear space around logos (minimum 10% of logo height)</li>
              <li>✓ Use full color logo on light backgrounds, white logo on dark backgrounds</li>
              <li>✗ Do not stretch, distort, or rotate the logo</li>
              <li>✗ Do not change the logo colors</li>
              <li>✗ Do not add effects like shadows or gradients to the logo</li>
            </ul>
            <p className="text-sm text-blue-700 mt-4">
              For complete brand guidelines, please contact{' '}
              <a href="mailto:partners@memoriqr.co.nz" className="underline">partners@memoriqr.co.nz</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
