'use client'

import { useState } from 'react'
import { Loader2, Search, Check, Calendar } from 'lucide-react'
import { RENEWAL_PRICING, formatPriceNZD } from '@/lib/pricing'

const renewalOptions = [
  {
    id: 'yearly',
    label: '1 Year',
    price: RENEWAL_PRICING.yearly,
    description: 'Extend hosting for one more year',
  },
  {
    id: 'fiveYear',
    label: '5 Years',
    price: RENEWAL_PRICING.fiveYear,
    description: 'Save $21 compared to yearly',
    popular: true,
  },
  {
    id: 'tenYear',
    label: '10 Years',
    price: RENEWAL_PRICING.tenYear,
    description: 'Best value - save $41',
  },
]

export function RenewalForm() {
  const [step, setStep] = useState<'search' | 'options' | 'success'>('search')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [memorial, setMemorial] = useState<{
    slug: string
    name: string
    expiresAt: string
    daysLeft: number
  } | null>(null)
  const [selectedOption, setSelectedOption] = useState('fiveYear')
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/memorial/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
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

  const handleRenew = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialSlug: memorial?.slug,
          renewalOption: selectedOption,
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
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
          <div className="bg-memorial-cream rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900">{memorial.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {memorial.daysLeft > 0 
                ? `Expires in ${memorial.daysLeft} days`
                : 'Hosting expired'}
            </p>
          </div>

          {/* Renewal options */}
          <div className="space-y-3 mb-6">
            {renewalOptions.map((option) => (
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
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
                  Renew Now
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
