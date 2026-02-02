'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Search, Check, Calendar, AlertCircle, Clock } from 'lucide-react'
import { EXTENSION_PRICING, ExtensionType, formatPriceNZD, GRACE_PERIOD_DAYS } from '@/lib/pricing'

const extensionOptions: Array<{
  id: ExtensionType
  label: string
  price: number
  description: string
  popular?: boolean
}> = [
  {
    id: '1_year',
    label: '1 Year',
    price: EXTENSION_PRICING['1_year'].price,
    description: 'Extend hosting for one more year',
  },
  {
    id: '5_year',
    label: '5 Years',
    price: EXTENSION_PRICING['5_year'].price,
    description: 'Best value per year',
    popular: true,
  },
  {
    id: 'lifetime',
    label: 'Lifetime',
    price: EXTENSION_PRICING['lifetime'].price,
    description: 'Never worry about renewals again',
  },
]

interface Memorial {
  slug: string
  name: string
  expiresAt: string | null
  daysLeft: number
  isExpired: boolean
  isInGracePeriod: boolean
  isLifetime: boolean
}

export function RenewalForm() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'search' | 'options' | 'success'>('search')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [selectedOption, setSelectedOption] = useState<ExtensionType>('5_year')
  const [error, setError] = useState('')

  // Pre-fill from URL params (for one-click links)
  useEffect(() => {
    const slug = searchParams.get('slug')
    const token = searchParams.get('token')
    const cancelled = searchParams.get('cancelled')
    
    if (cancelled) {
      setError('Payment was cancelled. You can try again below.')
    }
    
    if (slug) {
      setSearchQuery(slug)
      // Auto-search if we have a slug
      handleSearchWithQuery(slug, token || undefined)
    }
  }, [searchParams])

  const handleSearchWithQuery = async (query: string, token?: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/memorial/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, renewalToken: token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Memorial not found')
      }

      setMemorial(data.memorial)
      setStep('options')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSearchWithQuery(searchQuery)
  }

  const handleRenew = async () => {
    if (!memorial) return
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialSlug: memorial.slug,
          extensionType: selectedOption,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create renewal session')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Calculate new expiry date for preview
  const getNewExpiryDate = () => {
    if (!memorial) return null
    if (selectedOption === 'lifetime') return 'Never'
    
    const years = EXTENSION_PRICING[selectedOption].years!
    const baseDate = memorial.isExpired 
      ? new Date() 
      : new Date(memorial.expiresAt!)
    baseDate.setFullYear(baseDate.getFullYear() + years)
    
    return baseDate.toLocaleDateString('en-NZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="max-w-md mx-auto">
      {step === 'search' && (
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <label className="label">Memorial URL or Order Number</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., max-2024 or MQR-ABC123"
              className="input"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter the memorial slug from your URL (memoriqr.co.nz/memorial/<strong>max-2024</strong>) 
              or your order number.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !searchQuery}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Find Memorial
              </>
            )}
          </button>
        </form>
      )}

      {step === 'options' && memorial && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Memorial info */}
          <div className={`rounded-lg p-4 mb-6 ${
            memorial.isExpired 
              ? 'bg-red-50 border border-red-200' 
              : memorial.isInGracePeriod 
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-memorial-cream'
          }`}>
            <h3 className="font-medium text-gray-900">{memorial.name}</h3>
            
            {memorial.isLifetime ? (
              <p className="text-sm text-green-600 flex items-center gap-2 mt-1">
                <Check className="h-4 w-4" />
                Lifetime hosting - no renewal needed
              </p>
            ) : memorial.isExpired ? (
              <div className="mt-2">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {memorial.isInGracePeriod 
                    ? `In grace period (${GRACE_PERIOD_DAYS - Math.abs(memorial.daysLeft)} days remaining)`
                    : 'Hosting has expired'}
                </p>
                {!memorial.isInGracePeriod && (
                  <p className="text-xs text-red-500 mt-1">
                    Renew soon to prevent data deletion
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {memorial.daysLeft > 30 
                  ? `Expires in ${memorial.daysLeft} days`
                  : memorial.daysLeft > 7
                    ? <span className="text-amber-600">Expires in {memorial.daysLeft} days</span>
                    : <span className="text-red-600 font-medium">Expires in {memorial.daysLeft} days!</span>
                }
              </p>
            )}
          </div>

          {memorial.isLifetime ? (
            <div className="text-center py-8">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">
                This memorial already has lifetime hosting.
              </p>
              <button
                onClick={() => setStep('search')}
                className="btn-outline mt-6"
              >
                Search Another Memorial
              </button>
            </div>
          ) : (
            <>
              {/* Extension options */}
              <div className="space-y-3 mb-6">
                {extensionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedOption === option.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {option.label}
                          </span>
                          {option.popular && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPriceNZD(option.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Preview new expiry */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    New expiry: <strong className="text-gray-900">{getNewExpiryDate()}</strong>
                  </span>
                </div>
                {!memorial.isExpired && selectedOption !== 'lifetime' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Time will be added to your existing expiry date
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('search')}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleRenew}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Extend Now
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
