'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, Loader2, AlertCircle, Check, Palette, Image as ImageIcon, Save } from 'lucide-react'
import Image from 'next/image'
import type { HostingDuration, ProductType } from '@/types/database'
import { MemorialPhoto, MemorialVideo } from '@/types'

// Theme and frame definitions (same as upload form)
const MEMORIAL_THEMES = [
  { id: 'classic', name: 'Classic', colors: { bg: '#FDF8F3', accent: '#8B7355', text: '#4A4A4A' } },
  { id: 'garden', name: 'Garden', colors: { bg: '#F5F9F5', accent: '#5A7F5A', text: '#3D3D3D' } },
  { id: 'ocean', name: 'Ocean', colors: { bg: '#F5F8FA', accent: '#4A7C8C', text: '#3D4852' } },
  { id: 'sunset', name: 'Sunset', colors: { bg: '#FFF9F5', accent: '#C17F59', text: '#4A3F35' } },
  { id: 'night', name: 'Starlight', colors: { bg: '#F8F7FA', accent: '#6B5B7A', text: '#3D3852' } },
  { id: 'rose', name: 'Rose Garden', colors: { bg: '#FDF8F9', accent: '#B5838D', text: '#4A4045' } },
  { id: 'meadow', name: 'Meadow', colors: { bg: '#F7FAF5', accent: '#7A9E7A', text: '#3D4A3D' } },
  { id: 'autumn', name: 'Autumn', colors: { bg: '#FAF7F2', accent: '#A67C52', text: '#4A4035' } },
  { id: 'lavender', name: 'Lavender', colors: { bg: '#F9F7FC', accent: '#8E7CC3', text: '#3D3852' } },
  { id: 'sky', name: 'Blue Sky', colors: { bg: '#F5FAFC', accent: '#5B9BD5', text: '#3D4852' } },
]

const MEMORIAL_FRAMES = [
  { id: 'none', name: 'No Frame', border: 'none' },
  { id: 'classic-gold', name: 'Classic Gold', border: '4px solid #D4AF37' },
  { id: 'silver', name: 'Silver', border: '4px solid #C0C0C0' },
  { id: 'bronze', name: 'Bronze', border: '4px solid #CD7F32' },
  { id: 'wood', name: 'Wood', border: '6px solid #8B4513' },
  { id: 'ornate-gold', name: 'Ornate Gold', border: '8px double #D4AF37' },
  { id: 'ornate-silver', name: 'Ornate Silver', border: '8px double #A8A8A8' },
  { id: 'vintage', name: 'Vintage', border: '6px solid #8B7355' },
  { id: 'rose-gold', name: 'Rose Gold', border: '4px solid #B76E79' },
  { id: 'pearl', name: 'Pearl', border: '5px solid #F5F5F5' },
]

interface MemorialData {
  id: string
  slug: string
  deceasedName: string
  deceasedType: 'pet' | 'human'
  species?: string
  birthDate?: string
  deathDate?: string
  memorialText?: string
  photos: MemorialPhoto[]
  videos: MemorialVideo[]
  theme: string
  frame: string
  hostingDuration: HostingDuration
  productType: ProductType
}

function EditPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [memorial, setMemorial] = useState<MemorialData | null>(null)

  // Editable fields
  const [memorialText, setMemorialText] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('classic')
  const [selectedFrame, setSelectedFrame] = useState('classic-gold')

  // Get available themes/frames based on plan
  const availableThemes = memorial?.hostingDuration === 5 ? 5 : memorial?.hostingDuration === 10 ? 10 : 25
  const availableFrames = memorial?.hostingDuration === 5 ? 5 : memorial?.hostingDuration === 10 ? 10 : 25

  useEffect(() => {
    if (!token) {
      setError('Invalid edit link. Please use the link from your confirmation email.')
      setLoading(false)
      return
    }

    // Fetch memorial data
    fetch(`/api/memorial/edit?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setMemorial(data.memorial)
          setMemorialText(data.memorial.memorialText || '')
          setSelectedTheme(data.memorial.theme || 'classic')
          setSelectedFrame(data.memorial.frame || 'classic-gold')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load memorial data')
        setLoading(false)
      })
  }, [token])

  const handleSave = async () => {
    if (!memorial || !token) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/memorial/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          memorialText,
          theme: selectedTheme,
          frame: selectedFrame,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError('Failed to save changes')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error && !memorial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif mb-2">Unable to Edit</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="btn-primary inline-block">Return Home</a>
        </div>
      </div>
    )
  }

  if (!memorial) return null

  return (
    <div className="min-h-screen bg-memorial-cream">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container-narrow py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-primary-600">
            <Heart className="h-5 w-5" />
            <span className="font-medium">MemoriQR</span>
          </a>
          <a
            href={`/memorial/${memorial.slug}`}
            target="_blank"
            className="text-sm text-gray-600 hover:text-primary-600"
          >
            View Memorial →
          </a>
        </div>
      </header>

      <main className="container-narrow py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-serif mb-2">Edit Memorial</h1>
          <p className="text-gray-600 mb-8">
            Update the memorial page for <strong>{memorial.deceasedName}</strong>
          </p>

          {/* Status messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <Check className="h-5 w-5 flex-shrink-0" />
              Changes saved successfully!
            </div>
          )}

          <div className="space-y-8">
            {/* Current Photos Preview */}
            <div>
              <label className="label">Current Photos ({memorial.photos.length})</label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {memorial.photos.slice(0, 8).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative"
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
                {memorial.photos.length > 8 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    +{memorial.photos.length - 8} more
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                To add or remove photos, please contact support.
              </p>
            </div>

            {/* Memorial Text */}
            <div>
              <label className="label">Memorial Text</label>
              <textarea
                value={memorialText}
                onChange={(e) => setMemorialText(e.target.value)}
                rows={6}
                className="input resize-none"
                placeholder="Share memories, stories, or a tribute..."
              />
            </div>

            {/* Theme Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-primary-600" />
                <label className="label mb-0">Theme</label>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {MEMORIAL_THEMES.slice(0, availableThemes).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    style={{ backgroundColor: theme.colors.bg }}
                  >
                    <div
                      className="h-6 w-full rounded mb-2"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <p className="text-xs font-medium" style={{ color: theme.colors.text }}>
                      {theme.name}
                    </p>
                    {selectedTheme === theme.id && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-primary-600" />
                <label className="label mb-0">Photo Frame</label>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {MEMORIAL_FRAMES.slice(0, availableFrames).map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-3 rounded-lg border-2 transition-all bg-white ${
                      selectedFrame === frame.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div
                      className="h-12 w-full rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                      style={{ border: frame.border }}
                    >
                      🖼️
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-2">{frame.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-4 border-t">
              <a
                href={`/memorial/${memorial.slug}`}
                className="btn-outline flex-1 text-center"
              >
                Cancel
              </a>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function MemorialEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <EditPageContent />
    </Suspense>
  )
}
